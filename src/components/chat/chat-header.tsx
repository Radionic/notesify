import { useAtomValue, useSetAtom } from "jotai";
import { History, Plus, X } from "lucide-react";

import {
  activeChatIdAtom,
  chatsOpenAtom,
  threadFinderOpenAtom,
} from "@/atoms/chat/chats";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { useChat, useCreateNewChat } from "@/queries/chat/use-chat";
import { useChatAI } from "@/hooks/chat/use-chat-ai";

export const ChatHeader = () => {
  const activeChatId = useAtomValue(activeChatIdAtom);
  const { data: activeChat } = useChat({ id: activeChatId });
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);
  const setChatsOpen = useSetAtom(chatsOpenAtom);
  const { mutate: createNewChat } = useCreateNewChat();

  const { status } = useChatAI({ chatId: activeChatId });
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <Card className="sticky top-0 flex flex-col px-2 border-2 border-transparent z-30 rounded-none bg-header">
      <div className="flex flex-row items-center gap-0.5 justify-between">
        <span className="truncate max-w-96 min-w-32 mr-2">
          {activeChat?.title || "New Chat"}
        </span>

        <span className="grow" />

        <TooltipButton
          tooltip="New thread"
          disabled={isLoading}
          onClick={() => createNewChat()}
        >
          <Plus />
        </TooltipButton>

        <TooltipButton
          tooltip="History"
          disabled={isLoading}
          onClick={() => setThreadFinderOpen(true)}
        >
          <History />
        </TooltipButton>

        <TooltipButton tooltip="Close" onClick={() => setChatsOpen(false)}>
          <X />
        </TooltipButton>
      </div>
    </Card>
  );
};
