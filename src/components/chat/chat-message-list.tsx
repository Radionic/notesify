import { useAtomValue } from "jotai";
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

export const ChatMessageList = () => {
  const chatId = useAtomValue(activeChatIdAtom);

  const { messages, error, isLoading, isLoadingInitMessages, regenerate } =
    useChatAI({
      chatId,
    });

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
