import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { cn } from "@/lib/utils";

export const ChatBranding = ({
  chatId,
  className,
}: {
  chatId?: string;
  className?: string;
}) => {
  const { messages, isLoadingMessages } = useChatAI({ chatId });
  if (messages.length > 0 || isLoadingMessages) return null;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <img
        src="/favicon.png"
        alt="Notesify Icon"
        className="w-10 h-10 rounded-sm"
      />
      <span className="font-ebg text-2xl">Notesify AI</span>
    </div>
  );
};
