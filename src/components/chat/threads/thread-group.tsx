import { activeChatIdAtom, threadFinderOpenAtom } from "@/atoms/chat/chats";
import { Button } from "@/components/ui/button";
import { Chat } from "@/db/schema";
import { formatDistanceToNowStrict } from "date-fns";
import { useAtom, useSetAtom } from "jotai";

export const ThreadGroup = ({ chats }: { chats: Chat[] }) => {
  const [activeChatId, setActiveChatId] = useAtom(activeChatIdAtom);
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);

  return chats.map((chat) => {
    const isActive = chat.id === activeChatId;
    return (
      <Button
        key={chat.id}
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start h-9 px-2 py-1"
        onClick={() => {
          setActiveChatId(chat.id);
          setThreadFinderOpen(false);
        }}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <span className="truncate text-sm">{chat.title || "New Chat"}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatDistanceToNowStrict(chat.updatedAt, {
              addSuffix: true,
            })}
          </span>
        </div>
      </Button>
    );
  });
};
