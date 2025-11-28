import type { Rect } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  calculatePosition,
  toPercentageStyle,
} from "../../../lib/pdf/position";
import { Card } from "../../ui/card";
import { Layer } from "../layer/layer";

type Props = {
  children: React.ReactNode;
  anchor?: Rect;
  className?: string;
  placement?: "top-center" | "bottom-end";
  pdfId: string;
};

export const Menu = ({
  children,
  anchor,
  className,
  placement,
  pdfId,
}: Props) => {
  const menuPosition = calculatePosition(anchor, placement);
  if (!menuPosition) return null;

  return (
    <Layer pdfId={pdfId} pageNumber={menuPosition.page}>
      <Card
        className={cn(
          "absolute -translate-x-1/2 translate-y-1 pointer-events-auto z-30",
          className,
        )}
        style={toPercentageStyle(menuPosition)}
      >
        {children}
      </Card>
    </Layer>
  );
};
