import { useAtomValue } from "jotai";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

import { documentAtomFamily } from "@/atoms/pdf/pdf-viewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type PageDimensions, renderPageToCanvas } from "@/lib/pdf/canvas";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

const PageThumbnail = ({
  pdfDocument,
  pageNumber,
  pixelRatio,
  onClick,
}: {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  pixelRatio: number;
  onClick: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<PageDimensions>({
    width: 0,
    height: 0,
    scale: 1,
  });

  useEffect(() => {
    const renderThumbnail = async () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const scale = container.clientWidth / originalViewport.width;
        const pageDimensions = await renderPageToCanvas(
          page,
          canvas,
          scale,
          pixelRatio,
        );
        setDimensions(pageDimensions);
      } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
      }
    };

    renderThumbnail();
  }, [pdfDocument, pageNumber, pixelRatio]);

  const aspectRatio = dimensions.width / dimensions.height;

  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onClick={onClick}
    >
      <div
        ref={containerRef}
        className="w-full relative border rounded-lg overflow-hidden group-hover:ring-2 ring-primary bg-white"
        style={{
          aspectRatio,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-label={`Preview of page ${pageNumber}`}
        />
      </div>
      <span className="text-sm text-muted-foreground">Page {pageNumber}</span>
    </div>
  );
};

export const PagesDialog = ({
  pdfId,
  onOpenChange,
}: {
  pdfId: string;
  onOpenChange: (open: boolean) => void;
}) => {
  const pdfDocument = useAtomValue(documentAtomFamily(pdfId));
  const { navigatePdf } = useNavigatePdf();

  if (!pdfDocument) return null;

  const pageCount = pdfDocument.numPages;

  const handlePageClick = (pageNumber: number) => {
    navigatePdf({ pdfId, page: pageNumber });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!pdfId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pages</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(
            (pageNumber) => (
              <PageThumbnail
                key={pageNumber}
                pageNumber={pageNumber}
                pdfDocument={pdfDocument}
                pixelRatio={2}
                onClick={() => handlePageClick(pageNumber)}
              />
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
