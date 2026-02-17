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
import { getTextFromMessage } from "@/lib/ai/get-text-from-message";
import { tools } from "@/lib/ai/tools";
import {
  trackedGenerateText,
  trackedStreamText,
} from "@/lib/ai/tracked-generation";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";

export const messageMetadataSchema = z.object({
  source: z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal("pdf"),
        pdfId: z.string(),
        viewingPage: z.number(),
      }),
    ])
    .optional(),
  contexts: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          id: z.string(),
          type: z.literal("text"),
          content: z.string().optional(),
          fileId: z.string().optional(),
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
        }),
        z.object({
          type: z.literal("image"),
          fileId: z.string(),
        }),
      ]),
    )
    .optional(),
  modelId: z.string().optional(),
  chatId: z.string().optional(),
  finishReason: z
    .enum([
      "stop",
      "length",
      "content-filter",
      "tool-calls",
      "error",
      "other",
      "unknown",
    ])
    .optional(),
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
        const { source, contexts, modelId, chatId } =
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

        const [systemMessage, chat] = await Promise.all([
          buildSystemMessage({
            userId: session.user.id,
            source,
          }),
          (async () => {
            const [chat] = await db
              .insert(chatsTable)
              .values({
                id: chatId,
                title: getTextFromMessage(lastMessage).slice(0, 64),
                userId,
              })
              .onConflictDoUpdate({
                target: chatsTable.id,
                set: { updatedAt: new Date() },
              })
              .returning({
                isNew: sql<boolean>`(xmax = 0)`,
              });

            await db.insert(messagesTable).values({
              id: generateId(),
              chatId,
              role: "user",
              parts: lastMessage.parts,
              metadata: lastMessage.metadata,
            });
            return chat;
          })(),
        ]);
        const messagesWithContext = await buildMessages(
          messages,
          contexts,
          userId,
        );

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

            const result = await trackedStreamText({
              model: modelId,
              userId,
              pdfId: source?.type === "pdf" ? source.pdfId : undefined,
              chatId,
              messageId: assistantMessageId,
              usageType: "chat",
              system: systemMessage,
              messages: messagesWithContext,
              tools: tools({ userId, chatId, messageId: assistantMessageId }),
              stopWhen: stepCountIs(20),
            });

            writer.merge(
              result.toUIMessageStream({
                sendFinish: false,
                sendReasoning: true,
                messageMetadata: ({ part }) => {
                  if (part.type === "start") {
                    return { modelId };
                  }
                  if (part.type === "finish-step" || part.type === "finish") {
                    return { finishReason: part.finishReason };
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
                      internal: true,
                      userId,
                      pdfId: source?.type === "pdf" ? source.pdfId : undefined,
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
