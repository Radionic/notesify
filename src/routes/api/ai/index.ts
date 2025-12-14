import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type UIMessage,
} from "ai";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { buildMessages, buildSystemMessage } from "@/lib/ai/build-message";
import { getModelById } from "@/lib/ai/get-model";
import { getTextFromMessage } from "@/lib/ai/get-text-from-message";
import { tools } from "@/lib/ai/tools";
import {
  trackedGenerateText,
  trackedStreamText,
} from "@/lib/ai/tracked-generation";
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

        if (!chatId) {
          throw new Error("chatId is required");
        }
        if (!modelId) {
          throw new Error("modelId is required");
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
          getModelById(modelId),
        ]);

        if (!model) {
          throw new Error(`Invalid modelId: ${modelId}`);
        }

        const [systemMessage] = await Promise.all([
          buildSystemMessage({
            userId: session.user.id,
            openedPdfIds,
            pdfId,
            viewingPage,
          }),
          db.insert(messagesTable).values({
            id: generateId(),
            chatId,
            role: "user",
            parts: lastMessage.parts,
            metadata: lastMessage.metadata,
          }),
        ]);
        const messagesWithContext = buildMessages(messages, contexts);

        const stream = createUIMessageStream<MyUIMessage>({
          execute: async ({ writer }) => {
            const assistantMessageId = generateId();
            await db.insert(messagesTable).values({
              id: assistantMessageId,
              chatId,
              role: "assistant",
              parts: null,
              metadata: null,
            });

            const result = trackedStreamText({
              model: modelId,
              userId,
              pdfId,
              chatId,
              messageId: assistantMessageId,
              usageType: "chat",
              system: systemMessage,
              messages: messagesWithContext,
              tools: tools({ userId }),
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
                  await db
                    .update(messagesTable)
                    .set({
                      parts: responseMessage.parts,
                      metadata: responseMessage.metadata,
                    })
                    .where(eq(messagesTable.id, assistantMessageId));

                  if (chat.isNew && process.env.TITLE_SUMMARIZATION_MODEL_ID) {
                    const text = `User: ${getTextFromMessage(lastMessage)}\nAI: ${getTextFromMessage(responseMessage)}`;
                    const prompt = `Write a short title for the following text. Don't include any additional text.\n${text.slice(0, 512)}`;
                    const { text: title } = await trackedGenerateText({
                      model: process.env.TITLE_SUMMARIZATION_MODEL_ID,
                      userId,
                      pdfId,
                      chatId,
                      usageType: "chat_title",
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
