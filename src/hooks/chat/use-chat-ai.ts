import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { chatInstanceAtomFamily } from "@/atoms/chat/chats";
import { useMessages } from "@/queries/chat/use-messages";
import type { MessageMetadata, MyUIMessage } from "@/routes/api/ai";

export const useChatAI = ({ chatId }: { chatId: string }) => {
  const { data: initialMessages, isLoading: isLoadingInitMessages } =
    useMessages(chatId);
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
      setMessages(initialMessages as MyUIMessage[]);
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
    isLoadingInitMessages,
    isLoading,
    sendMessage,
    stop,
  };
};
