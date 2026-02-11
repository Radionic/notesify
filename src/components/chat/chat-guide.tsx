import { BookOpen, FileText, HelpCircle } from "lucide-react";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useChatAI } from "@/hooks/chat/use-chat-ai";
import { useElementWidth } from "@/hooks/use-element-width";

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

export const ChatGuide = ({
  chatId,
}: {
  chatId: string;
}) => {
  const { messages, isLoadingMessages, handleSubmit } = useChatAI({ chatId });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(containerRef);

  const gridColsClass = useMemo(() => {
    const columns = containerWidth < 280 ? 1 : containerWidth < 480 ? 2 : 3;
    return `grid-cols-${columns}`;
  }, [containerWidth]);

  if (messages.length > 0 || isLoadingMessages) return null;

  return (
    <div ref={containerRef} className="flex flex-col grow w-full p-2">
      <div className="flex grow items-center justify-center gap-4">
        <img
          src="/favicon.png"
          alt="Notesify Icon"
          className="w-10 h-10 rounded-sm"
        />
        <span className="font-ebg text-2xl">Notesify AI</span>
      </div>

      <div className="w-full max-w-xl mx-auto">
        <div className={`grid ${gridColsClass} gap-2 justify-items-center`}>
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
