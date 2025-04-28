import { useAtomValue, useSetAtom } from "jotai";
import { History, Plus, X } from "lucide-react";

import { createNewChatAtom } from "@/actions/chat/chats";
import {
  activeChatIdAtom,
  chatAtomFamilyLoadable,
  chatsOpenAtom,
  threadFinderOpenAtom,
} from "@/atoms/chat/chats";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/chat/use-chat";
import { useAction } from "@/hooks/state/use-action";

export const ChatHeader = () => {
  const activeChatId = useAtomValue(activeChatIdAtom);
  const activeChat = useAtomValue(chatAtomFamilyLoadable(activeChatId));
  const [createNewChat] = useAction(createNewChatAtom);
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);
  const setChatsOpen = useSetAtom(chatsOpenAtom);
  const { status } = useChat({ chatId: activeChatId });
  const isLoading = status === "submitted" || status === "streaming";

  if (activeChat.state !== "hasData") return null;
  return (
    <Card className="sticky top-0 flex flex-col px-2 border-2 border-transparent z-30 rounded-none bg-header">
      <div className="flex flex-row items-center gap-0.5 justify-between">
        <span className="truncate max-w-96 min-w-32 mr-2">
          {activeChat?.data.title || "New Chat"}
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
