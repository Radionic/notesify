import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { GlobalWorkerOptions } from "pdfjs-dist";
import { activeAnnotatorAtomFamily } from "@/atoms/pdf/annotator-options";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  viewerAtomFamily,
} from "@/atoms/pdf/pdf-viewer";
import { useHistoryShortcuts } from "@/hooks/pdf/use-history-shortcuts";
import { useScrollPosition } from "@/hooks/pdf/use-scroll-position";
import { cn } from "@/lib/utils";
import { useLoadPdf } from "@/queries/pdf/use-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import { useEffect, useRef } from "react";
import { useZoom } from "../../hooks/pdf/use-zoom";
import { ContextBoundingBox } from "../chat/contexts/context-bounding-box";
import { PreviewImageDialog } from "./dialog/preview-image-dialog";
import { AnnotatorLayer } from "./layer/annotator-layer";
import { HighlightLayer } from "./layer/highlight-layer";
import { Layer } from "./layer/layer";
import { Layers } from "./layer/layers";
import { SelectContextArea } from "./layer/select-context-layer";
import { HighlightMenu } from "./menu/highlight-menu";
import { TextMenu } from "./menu/text-menu";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const PdfViewer = ({
  pdfId,
  page,
}: {
  pdfId: string;
  page?: number;
}) => {
  const navigate = useNavigate();
  const inited = !!useAtomValue(currentPageAtomFamily(pdfId));
  const annotator = useAtomValue(activeAnnotatorAtomFamily(pdfId));
  const containerRef = useRef<HTMLDivElement>(null);
  const { loadPdf, unloadPdf } = useLoadPdf();
  const setActivePdfId = useSetAtom(activePdfIdAtom);
  const viewer = useAtomValue(viewerAtomFamily(pdfId));

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

  useEffect(() => {
    if (inited && viewer && page) {
      viewer.getPageView(page - 1)?.div?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [inited, viewer, page]);

  useHistoryShortcuts();
  useZoom(pdfId, containerRef);
  useScrollPosition(pdfId, containerRef);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 mx-auto w-full bg-neutral-100 dark:bg-panel overflow-y-auto h-full touch-pan-x touch-pan-y",
        annotator && "select-none",
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
