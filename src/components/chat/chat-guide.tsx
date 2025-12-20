import { useAtomValue, useSetAtom } from "jotai";
import { BookOpen, FileText, HelpCircle } from "lucide-react";
import { useMemo, useRef } from "react";
import { activeChatIdAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  openedPdfIdsAtom,
} from "@/atoms/pdf/pdf-viewer";
import { selectedModelAtom } from "@/atoms/setting/providers";
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

export const ChatGuide = ({ chatId }: { chatId: string }) => {
  const { sendMessage, status, error } = useChatAI({ chatId });
  const setActiveChatId = useSetAtom(activeChatIdAtom);

  const selectedModel = useAtomValue(selectedModelAtom);
  const contexts = useAtomValue(activeContextsAtom);
  const pdfId = useAtomValue(activePdfIdAtom);
  const openedPdfIds = useAtomValue(openedPdfIdsAtom);
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));

  const isLoading = status === "submitted" || status === "streaming";
  const disableActions = isLoading || !!error || !selectedModel;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(containerRef);

  const gridColsClass = useMemo(() => {
    const columns = containerWidth < 280 ? 1 : containerWidth < 480 ? 2 : 3;
    return `grid-cols-${columns}`;
  }, [containerWidth]);

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
              disabled={disableActions}
              onClick={() => {
                if (!selectedModel) return;
                setActiveChatId(chatId);
                sendMessage({
                  text: prompt,
                  metadata: {
                    openedPdfIds,
                    pdfId,
                    viewingPage,
                    contexts,
                    modelId: selectedModel.id,
                    chatId,
                  },
                });
              }}
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
