import { useAtomValue, useSetAtom } from "jotai";
import { ChevronLeft } from "lucide-react";

import { activeChatIdAtom, threadFinderOpenAtom } from "@/atoms/chat/chats";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { useChat } from "@/queries/chat/use-chat";

export const ThreadHeader = () => {
  const activeChatId = useAtomValue(activeChatIdAtom);
  const { data: activeChat } = useChat({ id: activeChatId });
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);

  return (
    <div
      className="flex items-center gap-2 mb-2 w-fit max-w-full"
      onClick={() => setThreadFinderOpen(false)}
    >
      <TooltipButton tooltip="Back">
        <ChevronLeft className="h-4 w-4" />
      </TooltipButton>
      <span className="font-medium hover:underline cursor-pointer truncate">
        {activeChat?.title}
      </span>
    </div>
  );
};
