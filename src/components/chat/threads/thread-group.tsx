import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Chat } from "@/db/schema";

export const ThreadGroup = ({
  chats,
  chatId,
  onSelectChat,
}: {
  chats: Chat[];
  chatId?: string;
  onSelectChat: (chatId: string) => void;
}) => {
  return chats.map((chat) => {
    const isActive = chat.id === chatId;
    return (
      <Button
        key={chat.id}
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start h-9 px-2 py-1"
        onClick={() => onSelectChat(chat.id)}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <span className="truncate text-sm">{chat.title || "New Chat"}</span>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatDistanceToNowStrict(chat.updatedAt, {
              addSuffix: true,
            })}
          </span>
        </div>
      </Button>
    );
  });
};
