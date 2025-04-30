import "pdfjs-dist/web/pdf_viewer.css";
import { ContextBoundingBox } from "../chat/contexts/context-bounding-box";
import { PreviewImageDialog } from "./dialog/preview-image-dialog";
import { HighlightLayer } from "./layer/highlight-layer";
import { Layer } from "./layer/layer";
import { Layers } from "./layer/layers";
import { SelectContextArea } from "./layer/select-context-layer";
import { HighlightMenu } from "./menu/highlight-menu";
import { TextMenu } from "./menu/text-menu";
import { useZoom } from "../../hooks/pdf/use-zoom";
import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useScrollPosition } from "@/hooks/pdf/use-scroll-position";
import { AnnotatorLayer } from "./layer/annotator-layer";
import { useHistoryShortcuts } from "@/hooks/pdf/use-history-shortcuts";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { activeAnnotatorAtomFamily } from "@/atoms/pdf/annotator-options";
import { activePdfIdAtom, currentPageAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { useLoadPdf } from "@/queries/pdf/use-pdf";

export const PdfViewer = ({ pdfId }: { pdfId: string }) => {
  const navigate = useNavigate();
  const inited = !!useAtomValue(currentPageAtomFamily(pdfId));
  const annotator = useAtomValue(activeAnnotatorAtomFamily(pdfId));
  const containerRef = useRef<HTMLDivElement>(null);
  const { loadPdf, unloadPdf } = useLoadPdf();
  const setActivePdfId = useSetAtom(activePdfIdAtom);

  useEffect(() => {
    if (!containerRef.current) return;
    loadPdf({
      pdfId,
      container: containerRef.current,
    }).catch(() => {
      navigate({ to: "/library" });
    });
    return () => {
      unloadPdf({ pdfId });
    };
  }, [pdfId]);

  useHistoryShortcuts();
  useZoom(pdfId, containerRef);
  useScrollPosition(pdfId, containerRef);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 mx-auto w-full bg-neutral-100 dark:bg-panel overflow-y-auto h-full touch-pan-x touch-pan-y",
        annotator && "select-none"
      )}
      ref={containerRef}
      key={pdfId}
      onClick={() => setActivePdfId(pdfId)}
    >
      <div className="pdfViewer" />
      <div
        className={
          inited
            ? "pointer-events-none hidden"
            : "absolute top-0 left-0 h-full w-full bg-neutral-100 dark:bg-panel overflow-hidden"
        }
      />
      <TextMenu pdfId={pdfId} container={containerRef.current} />
      <HighlightMenu pdfId={pdfId} />
      <Layers pdfId={pdfId}>
        {(pageNumber) => (
          <Layer
            key={`${pdfId}-${pageNumber}`}
            pdfId={pdfId}
            pageNumber={pageNumber}
          >
            <AnnotatorLayer pdfId={pdfId} pageNumber={pageNumber} />
            <HighlightLayer
              pdfId={pdfId}
              pageNumber={pageNumber}
              disabled={annotator !== undefined}
            />
            <SelectContextArea pdfId={pdfId} pageNumber={pageNumber} />
          </Layer>
        )}
      </Layers>

      <ContextBoundingBox pdfId={pdfId} />

      <PreviewImageDialog />
    </div>
  );
};
