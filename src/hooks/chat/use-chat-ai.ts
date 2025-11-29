import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { z } from "zod";
import { chatInstanceAtomFamily } from "@/atoms/chat/chats";
import { useMessages } from "@/queries/chat/use-messages";

export const messageMetadataSchema = z.object({
  openedPdfs: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        pageCount: z.number(),
      }),
    )
    .optional(),
  viewingPage: z.number().optional(),
  contexts: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["text", "area", "page", "viewing-page"]),
        content: z.string().optional(),
        rects: z.array(
          z.object({
            page: z.number(),
            top: z.number(),
            right: z.number(),
            bottom: z.number(),
            left: z.number(),
          }),
        ),
        page: z.number(),
        pdfId: z.string(),
      }),
    )
    .optional(),
  modelId: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export const useChatAI = ({ chatId }: { chatId: string }) => {
  const { data: initialMessages } = useMessages(chatId);
  const chat = useAtomValue(chatInstanceAtomFamily(chatId));

  const { messages, status, error, setMessages, sendMessage, stop } = useChat({
    chat,
  });

  useEffect(() => {
    if (
      initialMessages &&
      initialMessages.length > 0 &&
      messages.length === 0
    ) {
      setMessages(initialMessages as UIMessage<MessageMetadata>[]);
    }
  }, [initialMessages, messages, setMessages]);

  const lastMessage = messages[messages.length - 1];
  const lastPart = lastMessage?.parts[lastMessage?.parts.length - 1];
  const isRunningTool =
    lastPart?.type === "dynamic-tool" && lastPart?.state === "input-streaming";
  const isLoading = status === "submitted" || status === "streaming";

  return {
    messages: messages as UIMessage<MessageMetadata>[],
    status,
    error,
    isRunningTool,
    isLoading,
    sendMessage,
    stop,
  };
};
