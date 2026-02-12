import { History, Plus, X } from "lucide-react";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { cn } from "@/lib/utils";
import { useChat } from "@/queries/chat/use-chat";
import { getRouter } from "@/router";

export const ChatHeader = ({
  chatId,
  onNewThread,
  onOpenHistory,
  minimal,
}: {
  chatId?: string;
  onNewThread: () => void;
  onOpenHistory: () => void;
  minimal?: boolean;
}) => {
  const { data: activeChat } = useChat({ id: chatId });
  const { isStreaming } = useChatAI({ chatId });

  return (
    <Card
      className={cn(
        "sticky top-0 flex flex-col px-2 z-30 rounded-none bg-header",
        minimal ? "border-0 shadow-none py-1" : "border-2 border-transparent",
      )}
    >
      <div className="flex flex-row items-center gap-0.5 justify-between">
        <span className="truncate max-w-96 min-w-32 mr-2">
          {activeChat?.title || "New Chat"}
        </span>

        <span className="grow" />

        <TooltipButton
          tooltip="New thread"
          disabled={isStreaming}
          onClick={onNewThread}
        >
          <Plus />
        </TooltipButton>

        <TooltipButton
          tooltip="History"
          disabled={isStreaming}
          onClick={onOpenHistory}
        >
          <History />
        </TooltipButton>

        {!minimal && (
          <TooltipButton
            tooltip="Close"
            onClick={() =>
              getRouter().navigate({
                to: "/viewer",
                search: (prev) => ({ ...prev, co: false }),
                replace: true,
              })
            }
          >
            <X />
          </TooltipButton>
        )}
      </div>
    </Card>
  );
};
