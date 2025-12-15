import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { activePdfIdAtom, viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { useUpdatePdf } from "@/queries/pdf/use-pdf";
import { useZoomGestures } from "./use-zoom-gestures";

export const useZoom = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const activePdfId = useAtomValue(activePdfIdAtom);
  const activeViewer = useAtomValue(viewerAtomFamily(activePdfId));
  const viewer = useAtomValue(viewerAtomFamily(pdfId));

  const { mutate: updatePdfMetadata } = useUpdatePdf();
  const debouncedUpdateZoom = useDebounceCallback(updatePdfMetadata, 500);

  const zoom = useCallback(
    ({
      activeTarget,
      scaleFactor,
      origin,
    }: {
      activeTarget?: boolean;
      scaleFactor: number;
      origin?: number[];
    }) => {
      if (activeTarget) {
        activeViewer?.updateScale({ scaleFactor, origin });
        debouncedUpdateZoom({
          pdfId,
          zoom: activeViewer?.currentScale || 1,
        });
      } else {
        viewer?.updateScale({ scaleFactor, origin });
        debouncedUpdateZoom({
          pdfId,
          zoom: viewer?.currentScale || 1,
        });
      }
    },
    [activeViewer, viewer, pdfId, debouncedUpdateZoom],
  );

  const handleZoom = useCallback(
    ({ scaleFactor, origin }: { scaleFactor: number; origin?: number[] }) => {
      if (!viewer) return;
      zoom({ scaleFactor, origin });
    },
    [viewer, zoom],
  );

  useZoomGestures(containerRef, handleZoom, { enableHotkeys: true });
};
