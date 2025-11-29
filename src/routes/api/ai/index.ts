import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { buildMessages, buildSystemMessage } from "@/lib/ai/build-message";
import { aiProvider } from "@/lib/ai/provider";

export const Route = createFileRoute("/api/ai/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const lastMessage = messages[messages.length - 1];
        const { openedPdfs, pdfId, viewingPage, contexts, modelId } =
          lastMessage.metadata ?? {};

        if (!modelId) {
          throw new Error("Chat modelId is missing from message metadata.");
        }

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
