import { dotPulse } from "ldrs";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useChatAI, useShowChatLoading } from "@/hooks/chat/use-chat-ai";
import { Badge } from "../badge";
import { Spinner } from "../ui/spinner";
import { ChatMessage } from "./chat-message";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";

dotPulse.register();

export const ChatMessageList = ({ chatId }: { chatId?: string }) => {
  const {
    messages,
    error,
    isStreaming,
    isLoadingMessages,
    regenerate,
    sendMessage,
  } = useChatAI({ chatId });

  const showChatLoading = useShowChatLoading({
    messages,
    isStreaming,
  });

  if (messages.length === 0) {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center gap-2 grow">
          <Spinner className="w-6 h-6 text-muted-foreground" />
        </div>
      );
    }
    return null;
  }

  return (
    <Conversation className="grow">
      <ConversationContent className="gap-2">
        {messages.map((message, i) => {
          const contexts = message.metadata?.contexts;
          const previousMessage = messages[i - 1];
          const modelId =
            previousMessage?.role === "user" && message.role === "assistant"
              ? previousMessage.metadata?.modelId
              : undefined;
          const isLast = i === messages.length - 1;

          const canContinue =
            message.role === "assistant" &&
            message.metadata?.finishReason === "length" &&
            isLast &&
            !isStreaming;
          const continueMetadata =
            previousMessage?.role === "user"
              ? previousMessage.metadata
              : undefined;

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
              modelId={modelId}
              isLoading={isLast && isStreaming}
              isLast={isLast}
              onRegenerate={regenerate}
              canContinue={canContinue}
              onContinue={() => {
                if (!continueMetadata) return;
                sendMessage({ text: "Continue", metadata: continueMetadata });
              }}
            />
          );
        })}

        {showChatLoading && (
          <l-dot-pulse size="24" speed="1.25" color="#525252" />
        )}

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
