import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { getPage } from "@/lib/pdf/pages";

export interface LayerSize {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const useLayer = (pageNumber: number) => {
  const pdfId = useAtomValue(activePdfIdAtom);
  const [overlaySize, setOverlaySize] = useState<LayerSize>();

  useEffect(() => {
    const docEl = document.querySelector(".pdfViewer");
    const pageEl = getPage(pageNumber);
    if (!docEl || !pageEl) return;

    const updateOverlayPosition = () => {
      const rect = pageEl.getBoundingClientRect();
      setOverlaySize({
        top: pageEl.offsetTop,
        left: pageEl.offsetLeft,
        width: rect.width,
        height: rect.height,
      });
    };

    updateOverlayPosition();

    const resizeObserver = new ResizeObserver(updateOverlayPosition);
    resizeObserver.observe(docEl);
    resizeObserver.observe(pageEl);
    return () => {
      resizeObserver.disconnect();
    };
  }, [pdfId, pageNumber]);

  return overlaySize;
};
