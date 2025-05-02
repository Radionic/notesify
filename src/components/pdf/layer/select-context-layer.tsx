import { useAtom, useAtomValue } from "jotai";
import React, { useCallback, useRef, useState } from "react";

import {
  selectContextModeAtom,
  viewerAtomFamily,
} from "@/atoms/pdf/pdf-viewer";
import { captureScreenshot } from "@/lib/pdf/canvas";
import { useHotkeys } from "react-hotkeys-hook";
import { generateId } from "@/lib/id";
import { useChatContext } from "@/hooks/chat/use-chat-context";

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const SelectContextArea = ({
  pageNumber,
  pdfId,
}: {
  pageNumber: number;
  pdfId: string;
}) => {
  const viewer = useAtomValue(viewerAtomFamily(pdfId));
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionArea>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useAtom(selectContextModeAtom);
  const { addContext } = useChatContext();

  useHotkeys("esc", () => setMode(undefined));

  const handleScreenshot = useCallback(
    async ({ area, type }: { area?: SelectionArea; type: "area" | "page" }) => {
      if (!pdfId) return;

      const pdfCanvas = viewer?.getPageView(pageNumber - 1)?.canvas;
      if (!pdfCanvas) return;

      const { width, height } = pdfCanvas.getBoundingClientRect();
      const screenshotArea = area ?? {
        startX: 0,
        startY: 0,
        endX: width,
        endY: height,
      };

      const base64Image = await captureScreenshot(pdfCanvas, screenshotArea);
      if (base64Image) {
        // Convert coordinates to percentages
        const rect = {
          page: pageNumber,
          top: screenshotArea.startY / height,
          right: screenshotArea.endX / width,
          bottom: screenshotArea.endY / height,
          left: screenshotArea.startX / width,
        };

        addContext({
          id: generateId(),
          type,
          content: base64Image,
          rects: [rect],
          page: pageNumber,
          pdfId,
        });
      }
    },
    [pageNumber]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode === "area") {
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        setIsSelecting(true);
        setSelection({
          startX,
          startY,
          endX: startX,
          endY: startY,
        });
      } else if (mode === "page") {
        handleScreenshot({ type: "page" });
        setMode(undefined);
      }
    },
    [mode, handleScreenshot, setMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selection || mode !== "area") return;

      const rect = e.currentTarget.getBoundingClientRect();
      setSelection({
        ...selection,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
    },
    [isSelecting, selection, mode]
  );

  const handleMouseUp = useCallback(async () => {
    if (!selection || mode !== "area") return;

    setIsSelecting(false);

    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);

    // Ensure minimum selection size
    if (width < 10 || height < 10) {
      setSelection(undefined);
      return;
    }

    // Normalize coordinates (handle selection in any direction)
    const normalizedSelection = {
      startX: Math.min(selection.startX, selection.endX),
      startY: Math.min(selection.startY, selection.endY),
      endX: Math.max(selection.startX, selection.endX),
      endY: Math.max(selection.startY, selection.endY),
    };

    await handleScreenshot({
      area: normalizedSelection,
      type: "area",
    });
    setMode(undefined);
    setSelection(undefined);
  }, [selection, mode, handleScreenshot, setMode]);

  if (!mode) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      style={{
        cursor: mode === "area" ? "crosshair" : "pointer",
        background: mode ? "rgba(0, 0, 0, 0.2)" : "transparent",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {mode === "area" && selection && (
        <div
          className="absolute bg-primary/20 border border-primary"
          style={{
            left: Math.min(selection.startX, selection.endX),
            top: Math.min(selection.startY, selection.endY),
            width: Math.abs(selection.endX - selection.startX),
            height: Math.abs(selection.endY - selection.startY),
          }}
        />
      )}
    </div>
  );
};
