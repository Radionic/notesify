import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  chatsTable,
  type Message,
  messagesTable,
  modelsTable,
} from "@/db/schema";
import { buildMessages, buildSystemMessage } from "@/lib/ai/build-message";
import { aiProvider } from "@/lib/ai/provider";
import { generateId } from "@/lib/id";

export const Route = createFileRoute("/api/ai/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const lastMessage = messages[messages.length - 1];
        const { openedPdfs, pdfId, viewingPage, contexts, modelId, chatId } =
          lastMessage.metadata ?? {};

        const [, model] = await Promise.all([
          db
            .insert(chatsTable)
            .values({
              id: chatId,
              title: undefined,
            })
            .onConflictDoUpdate({
              target: chatsTable.id,
              set: { updatedAt: new Date() },
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

        const system = buildSystemMessage(openedPdfs, pdfId, viewingPage);
        const messagesWithContext = buildMessages(messages, contexts);

        const stream = createUIMessageStream({
          execute: async ({ writer }) => {
            const result = streamText({
              model: aiProvider.chatModel(modelId),
              system,
              messages: messagesWithContext,
            });

            writer.merge(
              result.toUIMessageStream({
                sendFinish: false,
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
                },
              }),
            );
          },
        });

        return createUIMessageStreamResponse({
          stream,
        });
      },
    },
  },
});
