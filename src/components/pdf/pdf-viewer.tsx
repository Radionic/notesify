import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { activeAnnotatorAtomFamily } from "@/atoms/pdf/annotator-options";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  viewerAtomFamily,
} from "@/atoms/pdf/pdf-viewer";
import { useHistoryShortcuts } from "@/hooks/pdf/use-history-shortcuts";
import { useScrollPosition } from "@/hooks/pdf/use-scroll-position";
import { cn } from "@/lib/utils";
import { usePdf } from "@/queries/pdf/use-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import { useEffect, useRef } from "react";
import { useLoadPdf, useUnloadPdf } from "@/hooks/pdf/use-pdf-loading";
import { useFileData } from "@/queries/file-system/use-file-system";
import { useZoom } from "../../hooks/pdf/use-zoom";
import { ContextBoundingBox } from "../chat/contexts/context-bounding-box";
import { Spinner } from "../ui/spinner";
import { PreviewImageDialog } from "./dialog/preview-image-dialog";
import { AnnotatorLayer } from "./layer/annotator-layer";
import { HighlightLayer } from "./layer/highlight-layer";
import { Layer } from "./layer/layer";
import { Layers } from "./layer/layers";
import { SelectContextArea } from "./layer/select-context-layer";
import { HighlightMenu } from "./menu/highlight-menu";
import { TextMenu } from "./menu/text-menu";

export const PdfViewer = ({
  pdfId,
  page,
}: {
  pdfId: string;
  page?: number;
}) => {
  const navigate = useNavigate();
  const setActivePdfId = useSetAtom(activePdfIdAtom);
  const viewer = useAtomValue(viewerAtomFamily(pdfId));
  const inited = !!useAtomValue(currentPageAtomFamily(pdfId));
  const annotator = useAtomValue(activeAnnotatorAtomFamily(pdfId));
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedPdfIdRef = useRef<string | null>(null);

  const { data: pdf } = usePdf({ pdfId });
  const { data: pdfData, isLoading: isLoadingPdfData } = useFileData({
    id: pdfId,
    type: "pdfs",
  });

  const loadPdf = useLoadPdf();
  const unloadPdf = useUnloadPdf();

  useEffect(() => {
    if (
      !pdf ||
      !pdfData ||
      !containerRef.current ||
      loadedPdfIdRef.current === pdfId
    )
      return;

    loadedPdfIdRef.current = pdfId;
    loadPdf({
      pdf,
      pdfData,
      container: containerRef.current,
    }).catch(() => {
      navigate({ to: "/library" });
    });
  }, [pdf, pdfData]);

  useEffect(() => {
    return () => {
      if (loadedPdfIdRef.current === pdfId && inited) {
        unloadPdf({ pdfId });
      }
    };
  }, [pdfId, inited]);

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
          inited && !isLoadingPdfData
            ? "pointer-events-none hidden"
            : "absolute top-0 left-0 h-full w-full flex items-center justify-center text-muted-foreground bg-neutral-100 dark:bg-panel overflow-hidden"
        }
      >
        <Spinner className="size-6" />
      </div>
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
