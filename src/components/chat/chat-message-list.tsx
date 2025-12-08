import type { DynamicToolUIPart } from "ai";
import { useAtomValue } from "jotai";
import { dotPulse } from "ldrs";
import { useEffect, useState } from "react";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { Badge } from "../badge";
import { Spinner } from "../ui/spinner";
import { ChatGuide } from "./chat-guide";
import { ChatMessage } from "./chat-message";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";

dotPulse.register();

export const ChatMessageList = () => {
  const chatId = useAtomValue(activeChatIdAtom);

  const { messages, error, isLoading, isLoadingInitMessages, regenerate } =
    useChatAI({
      chatId,
    });
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading || messages?.length === 0) {
      setShowLoading(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") {
      setShowLoading(false);
      return;
    }

    if (lastMessage.parts?.length === 0) {
      setShowLoading(true);
      return;
    }

    const parts = lastMessage.parts ?? [];
    const lastPart = parts[parts.length - 1] as DynamicToolUIPart | undefined;
    const isToolPart = lastPart?.type.startsWith("tool-");
    const toolState = lastPart?.state;
    const isToolFinished =
      isToolPart &&
      (toolState === "output-available" || toolState === "output-error");

    // Only apply the 5-second rule when the last part is a finished tool
    // and the chat is still loading. For non-tool parts, we only show
    // loading in the initial "no parts yet" phase.
    const shouldWaitForFiveSeconds = isToolFinished && isLoading;

    if (!shouldWaitForFiveSeconds) {
      setShowLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowLoading(true);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, isLoading]);

  if (messages?.length === 0) {
    if (isLoadingInitMessages) {
      return (
        <div className="flex items-center justify-center gap-2 grow">
          <Spinner />
          <p>Loading messages...</p>
        </div>
      );
    }
    return <ChatGuide />;
  }

  return (
    <Conversation className="grow">
      <ConversationContent className="gap-2">
        {messages.map((message, i) => {
          const contexts = message.metadata?.contexts;
          const showHeader =
            message.role === "assistant" && messages[i - 1]?.role === "user";
          const isLast = i === messages.length - 1;
          return message.role === "user" ? (
            <div key={message.id} className="flex flex-col gap-1 items-end">
              <TextContextsPreview contexts={contexts} className="items-end" />
              <ImageContextsPreview
                contexts={contexts}
                className="justify-end"
              />
              <ChatMessage message={message} />
            </div>
          ) : (
            <ChatMessage
              key={message.id}
              message={message}
              showHeader={showHeader}
              isLoading={isLast && isLoading}
              isLast={isLast}
              reload={regenerate}
            />
          );
        })}

        {showLoading && <l-dot-pulse size="24" speed="1.25" color="#525252" />}

        {error && (
          <Badge variant="red" className="w-fit p-2">
            Something went wrong. Please start a new chat instead.
          </Badge>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};
