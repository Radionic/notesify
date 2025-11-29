import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { useAutoScroll } from "@/hooks/chat/use-auto-scroll";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { cn } from "@/lib/utils";
import { useCreateNewChat } from "@/queries/chat/use-chat";
import { Badge } from "../badge";
import { ChatGuide } from "./chat-guide";
import { ChatMessage } from "./chat-message";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";

export const ChatMessageList = ({ className }: { className?: string }) => {
  const chatId = useAtomValue(activeChatIdAtom);
  const { messages, error, isLoading } = useChatAI({ chatId });
  const { mutateAsync: createNewChat } = useCreateNewChat();

  useEffect(() => {
    if (chatId === "TMP") {
      createNewChat();
    }
  }, [chatId, createNewChat]);

  const { containerRef, messagesEndRef, handleScroll } =
    useAutoScroll(messages);

  if (messages?.length === 0) {
    return <ChatGuide />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("overflow-y-auto flex flex-col p-2", className)}
    >
      {messages.map((message, i) => {
        const contexts = message.metadata?.contexts;
        const showHeader =
          message.role === "assistant" && messages[i - 1]?.role === "user";
        return message.role === "user" ? (
          <div key={message.id} className="flex flex-col gap-1">
            <TextContextsPreview contexts={contexts} />
            <ImageContextsPreview contexts={contexts} />
            <ChatMessage message={message} />
          </div>
        ) : (
          <ChatMessage
            key={message.id}
            message={message}
            showHeader={showHeader}
          />
        );
      })}

      {isLoading && (
        <ChatMessage
          message={{
            id: "loading",
            role: "assistant",
            parts: [],
          }}
          isLoading
        />
      )}

      {error && (
        <Badge variant="red" className="w-fit p-2">
          Something went wrong. Please start a new chat instead.
        </Badge>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
