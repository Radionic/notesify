import { cn } from "@/lib/utils";

import { ChatMessage } from "./chat-message";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { ChatGuide } from "./chat-guide";
import { useAtomValue } from "jotai";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { useAutoScroll } from "@/hooks/chat/use-auto-scroll";
import { useEffect } from "react";
import { useCreateNewChat } from "@/queries/chat/use-chat";
import { Badge } from "../badge";

export const ChatMessageList = ({ className }: { className?: string }) => {
  const pdfId = useAtomValue(activePdfIdAtom);
  const chatId = useAtomValue(activeChatIdAtom);

  const { messages, status, error } = useChatAI({ chatId, pdfId });

  const lastMessage = messages[messages.length - 1];
  const lastPart = lastMessage?.parts[lastMessage?.parts.length - 1];
  const isRunningTool =
    lastPart?.type === "tool-invocation" &&
    lastPart.toolInvocation.state !== "result";
  const showLoading =
    (status === "submitted" || status === "streaming") && !isRunningTool;

  const { mutateAsync: createNewChat } = useCreateNewChat();

  useEffect(() => {
    if (chatId === "TMP") {
      createNewChat();
    }
  }, [chatId]);

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
        const contexts = JSON.parse(message.data ?? ("{}" as any))?.contexts;
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

      {showLoading && (
        <ChatMessage
          message={{
            id: "loading",
            role: "assistant",
            content: "",
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
