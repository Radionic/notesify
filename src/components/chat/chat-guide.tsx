import { BookOpen, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatAI } from "@/hooks/chat/use-chat-ai";

const actions = [
  {
    label: "Summary",
    Icon: FileText,
    prompt: "Summarize the PDF",
  },
  {
    label: "Flashcards",
    Icon: BookOpen,
    prompt: "Create flashcards from the PDF",
  },
  {
    label: "Mini quiz",
    Icon: HelpCircle,
    prompt: "Create a mini quiz from the PDF",
  },
] as const;

export const ChatGuide = ({ chatId }: { chatId?: string }) => {
  const { messages, isLoadingMessages, handleSubmit } = useChatAI({ chatId });
  if (messages.length > 0 || isLoadingMessages) return null;

  return (
    <div className="@container flex flex-col grow w-full p-2">
      <div className="w-full max-w-xl mx-auto flex grow items-center">
        <div className="grid grid-cols-1 @min-[280px]:grid-cols-2 @min-[480px]:grid-cols-3 gap-2 justify-items-center">
          {actions.map(({ label, Icon, prompt }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              className="w-full max-w-[240px] justify-start"
              onClick={() => handleSubmit(prompt)}
            >
              <Icon />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
