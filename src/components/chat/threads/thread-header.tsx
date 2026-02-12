import { ChevronLeft } from "lucide-react";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { useChat } from "@/queries/chat/use-chat";

export const ThreadHeader = ({
  chatId,
  onBack,
}: {
  chatId?: string;
  onBack: () => void;
}) => {
  const { data: activeChat } = useChat({ id: chatId });

  return (
    <div className="flex items-center gap-2 mb-2 w-full" onPointerDown={onBack}>
      <TooltipButton tooltip="Back">
        <ChevronLeft className="h-4 w-4" />
      </TooltipButton>
      <span className="font-medium hover:underline cursor-pointer truncate">
        {activeChat?.title || "Back"}
      </span>
    </div>
  );
};
