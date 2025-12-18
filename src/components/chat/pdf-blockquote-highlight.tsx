import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { activeBoundingContextAtom } from "@/atoms/chat/contexts";
import { documentAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { Layer } from "@/components/pdf/layer/layer";
import { extractPageTextData } from "@/lib/pdf/extract-pdf-data";
import { toPercentageStyle } from "@/lib/pdf/position";
import { searchInPage } from "@/lib/pdf/text-search";
import { cn } from "@/lib/utils";

export const PDFBlockquoteHighlight = ({ pdfId }: { pdfId: string }) => {
  const [context, setContext] = useAtom(activeBoundingContextAtom);
  const pdfDocument = useAtomValue(documentAtomFamily(pdfId));

  useEffect(() => {
    if (
      !context ||
      context.pdfId !== pdfId ||
      context.type !== "text" ||
      context.rects !== undefined
    ) {
      return;
    }

    const { page, content } = context;
    if (!content || page === undefined || !pdfDocument) return;

    const performSearch = async () => {
      try {
        const pdfPage = await pdfDocument.getPage(page);
        const { text, bboxes } = await extractPageTextData(pdfPage);
        const rects = searchInPage({
          text,
          bboxes,
          query: content,
          page: page,
        });

        setContext((prev) => (prev ? { ...prev, rects } : undefined));
      } catch (err) {
        console.error("Text search failed", err);
        setContext((prev) => (prev ? { ...prev, rects: [] } : undefined));
      }
    };

    performSearch();
  }, [context, pdfId, pdfDocument, setContext]);

  if (
    !context ||
    !context.pdfId ||
    context.pdfId !== pdfId ||
    context.type !== "text" ||
    !context.rects ||
    context.rects.length === 0
  ) {
    return null;
  }

  const rectsByPage = new Map<number, typeof context.rects>();
  for (const rect of context.rects) {
    const existing = rectsByPage.get(rect.page) ?? [];
    rectsByPage.set(rect.page, [...existing, rect]);
  }

  return Array.from(rectsByPage.entries()).map(([pageNumber, rects]) => (
    <Layer
      key={`ctx-highlight-${pdfId}-${pageNumber}`}
      pageNumber={pageNumber}
      pdfId={pdfId}
    >
      <div className="pointer-events-none">
        {rects.map((rect, index) => {
          const style = toPercentageStyle(rect);
          return (
            <svg
              key={`ctx-highlight-${rect.page}-${index}`}
              className={cn("absolute z-1 mix-blend-multiply")}
              style={{
                left: style.left,
                top: style.top,
                width: style.width,
                height: style.height,
              }}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect
                width="100%"
                height="100%"
                fill="rgba(250, 204, 21, 0.45)"
              />
            </svg>
          );
        })}
      </div>
    </Layer>
  ));
};
