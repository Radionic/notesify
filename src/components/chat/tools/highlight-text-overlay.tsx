import { useAtom } from "jotai";
import { activeBoundingContextAtom } from "@/atoms/chat/contexts";
import { Layer } from "@/components/pdf/layer/layer";
import { toPercentageStyle } from "@/lib/pdf/position";
import { cn } from "@/lib/utils";

export const TextSearchHighlightTool = ({ pdfId }: { pdfId: string }) => {
  const [context] = useAtom(activeBoundingContextAtom);

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
        {rects.map((rect) => {
          const style = toPercentageStyle(rect);
          const rectKey = `${rect.page}-${rect.top}-${rect.left}-${rect.right}-${rect.bottom}`;
          return (
            <svg
              key={`ctx-highlight-${rectKey}`}
              className={cn("absolute z-1 mix-blend-multiply")}
              style={{
                left: style.left,
                top: style.top,
                width: style.width,
                height: style.height,
              }}
              aria-hidden="true"
              focusable="false"
              preserveAspectRatio="none"
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
