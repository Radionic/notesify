import { useAtomValue, useSetAtom } from "jotai";
import { Sparkles } from "lucide-react";
import { LuHighlighter } from "react-icons/lu";
import { MdTranslate } from "react-icons/md";

import { selectedHighlightColorAtom } from "@/atoms/pdf/highlight-options";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Separator } from "@/components/ui/separator";

import { useTextSelection } from "@/hooks/pdf/use-text-selection";
import { HighlightOptions } from "./highlight-options";
import { Menu } from "./menu";
import { toast } from "sonner";
import { generateId } from "@/lib/id";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { useCreateHighlight } from "@/queries/pdf/use-highlight";
import { useChatContext } from "@/hooks/chat/use-chat-context";

export const TextMenu = ({
  pdfId,
  container,
}: {
  pdfId: string;
  container: HTMLDivElement | null;
}) => {
  const setChatsOpen = useSetAtom(chatsOpenAtom);
  const { addContext } = useChatContext();
  const { mutateAsync: createHighlight } = useCreateHighlight();
  const selectedColor = useAtomValue(selectedHighlightColorAtom);
  const { isSelecting, activeTextSelection, clearSelection } = useTextSelection(
    { pdfId, container }
  );
  const dismissMenu = clearSelection;
  if (isSelecting || !activeTextSelection || !pdfId) return null;

  const { rects, text } = activeTextSelection;
  const anchor = rects[rects.length - 1];

  return (
    <Menu pdfId={pdfId} anchor={anchor} placement="bottom-end">
      <div className="flex gap-1 items-center p-1">
        <TooltipButton
          id="ask-ai-button"
          tooltip="Ask AI"
          shortcut="Ctrl 1"
          className="text-blue-500 hover:text-blue-600"
          onPointerDown={() => {
            addContext({
              id: generateId(),
              type: "text",
              content: text,
              rects,
              page: rects[0].page,
              pdfId,
            });
            setChatsOpen(true);
            dismissMenu();
          }}
        >
          <Sparkles />
          Ask AI
        </TooltipButton>

        <Separator orientation="vertical" className="h-6" />

        <TooltipButton
          tooltip="Highlight"
          onPointerDown={() => {
            createHighlight({
              highlight: {
                pdfId,
                text,
                rects,
                color: selectedColor,
                pageNumber: rects[0].page,
              },
            });
            dismissMenu();
          }}
        >
          <LuHighlighter />
          <HighlightOptions
            onChange={(color) => {
              createHighlight({
                highlight: {
                  pdfId,
                  text,
                  rects,
                  color,
                  pageNumber: rects[0].page,
                },
              });
              dismissMenu();
            }}
          />
        </TooltipButton>

        <TooltipButton
          tooltip="Translate"
          onPointerDown={(e) => {
            // Avoid text selection collapses
            e.preventDefault();
            e.stopPropagation();
            toast.info("🚧 Under construction");
          }}
        >
          <MdTranslate />
        </TooltipButton>
      </div>
    </Menu>
  );
};
