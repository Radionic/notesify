import { useAtomValue, useSetAtom } from "jotai";
import { Sparkles } from "lucide-react";
import { LuHighlighter } from "react-icons/lu";
import { MdTranslate } from "react-icons/md";
import { toast } from "sonner";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { selectedHighlightColorAtom } from "@/atoms/pdf/highlight-options";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useChatContext } from "@/hooks/chat/use-chat-context";
import { useTextSelection } from "@/hooks/pdf/use-text-selection";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateId } from "@/lib/id";
import { useCreateHighlight } from "@/queries/pdf/use-highlight";
import { HighlightOptions } from "./highlight-options";
import { Menu } from "./menu";

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
    { pdfId, container },
  );
  const isMobile = useIsMobile();
  const dismissMenu = clearSelection;
  if (isSelecting || !activeTextSelection || !pdfId) return null;

  const { rects, text } = activeTextSelection;
  const anchor = rects[rects.length - 1];
  const menuContent = (
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
              id: generateId(),
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
                id: generateId(),
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
  );

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <Card className="pointer-events-auto mb-4">{menuContent}</Card>
      </div>
    );
  }

  return (
    <Menu pdfId={pdfId} anchor={anchor} placement="bottom-end">
      {menuContent}
    </Menu>
  );
};
