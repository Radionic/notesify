import { useRef } from "react";

import { useOnClickOutside } from "@/hooks/pdf/use-on-click-outside";
import { toPercentageStyle } from "@/lib/pdf/position";
import { calcBoundingRect } from "@/lib/pdf/rects";
import type { Rect } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Layer } from "../layer/layer";

type BoundingRectProps = {
  rects: Rect[];
  pdfId: string;
  className?: string;
  onDismiss?: () => void;
};

export const BoundingRect = ({
  rects,
  pdfId,
  className,
  onDismiss,
}: BoundingRectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onDismiss, "coordinates");

  const boudingRect = calcBoundingRect(rects);
  if (!boudingRect) return null;

  return (
    <Layer pageNumber={boudingRect.page} pdfId={pdfId}>
      <div
        ref={ref}
        className={cn(
          "absolute border border-neutral-200/50 rounded-md pointer-events-none",
          className,
        )}
        style={{
          ...toPercentageStyle(boudingRect, 10),
          boxShadow: "0px 0px 8px 2px rgba(0, 0, 0, 0.2)",
        }}
      />
    </Layer>
  );
};
