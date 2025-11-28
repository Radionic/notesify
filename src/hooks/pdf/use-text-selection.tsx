import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { activeTextSelectionAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { getRectsFromRange } from "../../lib/pdf/rects";

export function useTextSelection({
  pdfId,
  container,
}: {
  pdfId: string;
  container: HTMLDivElement | null;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTextSelection, setActiveTextSelection] = useAtom(
    activeTextSelectionAtomFamily(pdfId),
  );

  useEffect(() => {
    if (!container) return;

    const onMouseUp = () => {
      setIsSelecting(false);
      // Add a small delay to ensure selection is properly captured
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0);
          const rects = getRectsFromRange(container, range);
          setActiveTextSelection(() => ({
            text: selection.toString(),
            rects,
          }));
        } else {
          setActiveTextSelection(undefined);
        }
      }, 50);
    };
    const onTouchMove = () => {
      // Dismiss menu when user moves their finger
      setIsSelecting(true);
    };

    container?.addEventListener("pointerup", onMouseUp);
    container?.addEventListener("touchmove", onTouchMove);
    return () => {
      container?.removeEventListener("pointerup", onMouseUp);
      container?.removeEventListener("touchmove", onTouchMove);
    };
  }, [container]);

  const clearSelection = () => {
    setActiveTextSelection(undefined);
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
  };

  return {
    isSelecting,
    activeTextSelection,
    clearSelection,
  };
}
