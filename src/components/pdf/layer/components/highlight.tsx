import { useAtom } from "jotai";

import { Highlight as HighlightType } from "@/db/schema";
import { cn } from "@/lib/utils";

import { toPercentageStyle } from "../../../../lib/pdf/position";
import { activeHighlightAtom } from "@/atoms/pdf/pdf-viewer";

type Props = {
  highlight: HighlightType;
  disabled?: boolean;
};

export const Highlight = ({ highlight, disabled }: Props) => {
  const [activeHighlight, setActiveHighlight] = useAtom(activeHighlightAtom);
  const isSelected = activeHighlight?.id === highlight.id;

  return (
    <div onClick={() => setActiveHighlight(highlight)}>
      {highlight.rects.map((rect, index) => {
        const style = toPercentageStyle(rect);
        return (
          <svg
            key={`${highlight.id}-${index}`}
            className={cn(
              "absolute z-1 mix-blend-multiply cursor-pointer",
              isSelected ? "pointer-events-none" : "pointer-events-auto",
              disabled && "pointer-events-none"
            )}
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
            }}
            preserveAspectRatio="none"
          >
            <rect width="100%" height="100%" fill={highlight.color} />
          </svg>
        );
      })}
    </div>
  );
};
