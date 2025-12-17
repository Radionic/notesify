import { useAtom, useSetAtom } from "jotai";
import { Copy, Sparkles, Trash } from "lucide-react";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { activeHighlightAtom } from "@/atoms/pdf/pdf-viewer";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Separator } from "@/components/ui/separator";
import { useChatContext } from "@/hooks/chat/use-chat-context";
import { generateId } from "@/lib/id";
import { calcBoundingRect } from "@/lib/pdf/rects";
import {
  useChangeHighlightColor,
  useCopyHighlight,
  useDeleteHighlight,
} from "@/queries/pdf/use-highlight";
import { BoundingRect } from "./bounding-rect";
import { HighlightOptions } from "./highlight-options";
import { Menu } from "./menu";

export const HighlightMenu = ({ pdfId }: { pdfId: string }) => {
  const [activeHighlight, setActiveHighlight] = useAtom(activeHighlightAtom);
  const setChatsOpen = useSetAtom(chatsOpenAtom);
  const { addContext } = useChatContext();
  const { mutateAsync: deleteHighlight } = useDeleteHighlight();
  const { mutateAsync: copyHighlight } = useCopyHighlight();
  const { mutateAsync: changeHighlightColor } = useChangeHighlightColor();
  const dismissMenu = () => setActiveHighlight(undefined);

  if (!activeHighlight?.rects || activeHighlight.pdfId !== pdfId) {
    return null;
  }

  const handleCopy = () => {
    if (!activeHighlight.text) return;
    copyHighlight(activeHighlight.text);
    dismissMenu();
  };

  const handleDelete = () => {
    deleteHighlight({ pdfId, highlightId: activeHighlight.id });
    dismissMenu();
  };

  const handleColorChange = (color: string) => {
    changeHighlightColor({ pdfId, highlightId: activeHighlight.id, color });
    dismissMenu();
  };

  const anchor = calcBoundingRect(activeHighlight.rects);
  return (
    <>
      <BoundingRect
        pdfId={pdfId}
        rects={activeHighlight.rects}
        onDismiss={dismissMenu}
      />
      <Menu
        pdfId={pdfId}
        anchor={anchor}
        placement="top-center"
        className="mb-6"
      >
        <div
          className="flex gap-1 items-center p-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <TooltipButton
            tooltip="Ask AI"
            shortcut="Ctrl 1"
            className="text-blue-500 hover:text-blue-600"
            onPointerDown={() => {
              addContext({
                id: generateId(),
                type: "text",
                content: activeHighlight.text,
                rects: activeHighlight.rects,
                page: activeHighlight.rects[0].page,
                pdfId,
              });
              setChatsOpen(true);
            }}
          >
            <Sparkles />
            Ask AI
          </TooltipButton>

          <Separator orientation="vertical" className="h-6" />

          <TooltipButton tooltip="Highlight color">
            <HighlightOptions
              value={activeHighlight.color}
              onChange={handleColorChange}
            />
          </TooltipButton>

          <TooltipButton tooltip="Copy" onPointerDown={handleCopy}>
            <Copy />
          </TooltipButton>

          <TooltipButton tooltip="Delete" onPointerDown={handleDelete}>
            <Trash />
          </TooltipButton>
        </div>
      </Menu>
    </>
  );
};
