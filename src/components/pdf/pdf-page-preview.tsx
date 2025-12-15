import { useAtomValue } from "jotai";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { documentAtomFamily, pdfPreviewAtom } from "@/atoms/pdf/pdf-viewer";
import { Spinner } from "@/components/ui/spinner";
import { PdfPagePreviewToolbar } from "@/components/viewer/toolbars/pdf-page-preview-toolbar";
import { useZoomGestures } from "@/hooks/pdf/use-zoom-gestures";
import { renderPageToCanvas } from "@/lib/pdf/canvas";

const MIN_SCALE = 0.8;
const MAX_SCALE = 4;
const PADDING = 16;

export const PdfPagePreview = () => {
  const preview = useAtomValue(pdfPreviewAtom);
  const pdfDocument = useAtomValue(documentAtomFamily(preview?.pdfId));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const zoomTargetRef = useRef<{
    pointOnCanvas: { x: number; y: number };
    mouseInViewport: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!preview || !pdfDocument || !containerRef.current || !canvasRef.current)
      return;

    const renderPage = async () => {
      setIsLoading(true);
      setZoom(1);

      try {
        const page = await pdfDocument.getPage(preview.pageNumber);
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth - PADDING * 2;
        const baseScale = containerWidth / page.getViewport({ scale: 1 }).width;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dims = await renderPageToCanvas(
          page,
          canvas,
          baseScale * 2,
          window.devicePixelRatio || 1,
        );
        canvas.style.width = `${dims.width / 2}px`;
        canvas.style.height = `${dims.height / 2}px`;
        setCanvasSize({ width: dims.width / 2, height: dims.height / 2 });
      } catch (error) {
        console.error("Error rendering preview page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();
  }, [preview, pdfDocument]);

  const handleZoom = useCallback(
    ({ scaleFactor, origin }: { scaleFactor: number; origin?: number[] }) => {
      setZoom((currentZoom) => {
        const newZoom = Math.min(
          Math.max(currentZoom * scaleFactor, MIN_SCALE),
          MAX_SCALE,
        );
        if (origin && wrapperRef.current) {
          const wrapperRect = wrapperRef.current.getBoundingClientRect();
          zoomTargetRef.current = {
            pointOnCanvas: {
              x: (origin[0] - wrapperRect.left) / currentZoom,
              y: (origin[1] - wrapperRect.top) / currentZoom,
            },
            mouseInViewport: { x: origin[0], y: origin[1] },
          };
        }
        return newZoom;
      });
    },
    [],
  );

  useLayoutEffect(() => {
    const target = zoomTargetRef.current;
    const container = containerRef.current;
    if (!target || !container) return;
    zoomTargetRef.current = null;

    const containerRect = container.getBoundingClientRect();
    container.scrollLeft =
      containerRect.left +
      PADDING +
      target.pointOnCanvas.x * zoom -
      target.mouseInViewport.x;
    container.scrollTop =
      containerRect.top +
      PADDING +
      target.pointOnCanvas.y * zoom -
      target.mouseInViewport.y;
  }, [zoom]);

  useZoomGestures(containerRef, handleZoom);

  if (!preview) return null;

  return (
    <div className="flex flex-col h-full">
      <PdfPagePreviewToolbar
        pageNumber={preview.pageNumber}
        pdfId={preview.pdfId}
        destArray={preview.destArray}
      />
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-800 p-4"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-6" />
          </div>
        )}
        <div
          ref={wrapperRef}
          className="relative shadow-lg m-auto"
          style={{
            opacity: isLoading ? 0 : 1,
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              transformOrigin: "top left",
              transform: `scale(${zoom})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
