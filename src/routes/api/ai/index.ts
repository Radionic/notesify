import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  chatsTable,
  type Message,
  messagesTable,
  modelsTable,
} from "@/db/schema";
import { buildMessages } from "@/lib/ai/build-message";
import { getTextFromMessage } from "@/lib/ai/get-text-from-message";
import { aiProvider } from "@/lib/ai/provider";
import { tools } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";

export const messageMetadataSchema = z.object({
  openedPdfIds: z.array(z.string()).optional(),
  pdfId: z.string().optional(),
  viewingPage: z.number().optional(),
  contexts: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "text",
          "area",
          "page",
          "viewing-page",
          "uploaded-image",
        ]),
        content: z.string().optional(),
        rects: z
          .array(
            z.object({
              page: z.number(),
              top: z.number(),
              right: z.number(),
              bottom: z.number(),
              left: z.number(),
            }),
          )
          .optional(),
        page: z.number().optional(),
        pdfId: z.string().optional(),
      }),
    )
    .optional(),
  modelId: z.string().optional(),
  chatId: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type MessageDataParts = {
  title: {
    value: string;
  };
};
export type MyUIMessage = UIMessage<MessageMetadata, MessageDataParts>;

export const Route = createFileRoute("/api/ai/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const lastMessage = messages[messages.length - 1];
        const { openedPdfIds, pdfId, viewingPage, contexts, modelId, chatId } =
          lastMessage.metadata ?? {};

        const session = await getSession();
        if (!session?.user) {
          throw new Error("Unauthorized");
        }

        const userId = session.user.id;

        const [[chat], model] = await Promise.all([
          db
            .insert(chatsTable)
            .values({
              id: chatId,
              title: undefined,
              userId,
            })
            .onConflictDoUpdate({
              target: chatsTable.id,
              set: { updatedAt: new Date() },
            })
            .returning({
              isNew: sql<boolean>`(xmax = 0)`,
            }),
          db.query.modelsTable.findFirst({
            where: eq(modelsTable.id, modelId),
          }),
        ]);

        if (!model) {
          throw new Error("Invalid modelId.");
        }

        await db.insert(messagesTable).values({
          id: generateId(),
          chatId,
          role: "user",
          parts: lastMessage.parts,
          metadata: lastMessage.metadata,
        } as Message);

        const messagesWithContext = buildMessages(messages, contexts);

        const stream = createUIMessageStream<MyUIMessage>({
          execute: async ({ writer }) => {
            const result = streamText({
              model: aiProvider.chatModel(modelId),
              system:
                "You are a helpful assistant. Respond in Markdown format.",
              messages: messagesWithContext,
              tools: tools({
                openedPdfIds,
                pdfId,
                viewingPage,
              }),
              stopWhen: stepCountIs(10),
            });

            writer.merge(
              result.toUIMessageStream({
                sendFinish: false,
                sendReasoning: true,
                messageMetadata: ({ part }) => {
                  if (part.type === "start") {
                    return { modelId };
                  }
                },
                onFinish: async ({ responseMessage }) => {
                  await db.insert(messagesTable).values({
                    id: generateId(),
                    chatId,
                    role: "assistant",
                    parts: responseMessage.parts,
                    metadata: responseMessage.metadata,
                  } as Message);

                  if (chat.isNew && process.env.TITLE_SUMMARIZATION_MODEL_ID) {
                    const text = `User: ${getTextFromMessage(lastMessage)}\nAI: ${getTextFromMessage(responseMessage)}`;
                    const prompt = `Write a short title for the following text. Don't include any additional text.\n${text.slice(0, 512)}`;
                    const { text: title } = await generateText({
                      model: aiProvider.chatModel(
                        process.env.TITLE_SUMMARIZATION_MODEL_ID,
                      ),
                      prompt,
                      maxOutputTokens: 32,
                    });
                    writer.write({
                      type: "data-title",
                      data: { value: title },
                      transient: true,
                    });
                    await db
                      .update(chatsTable)
                      .set({ title })
                      .where(eq(chatsTable.id, chatId));
                  }
                },
              }),
            );
          },
        });

        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});
