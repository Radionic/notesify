import { useAtom } from "jotai";

import { activeBoundingContextAtom } from "@/atoms/chat/contexts";

import { BoundingRect } from "../../pdf/menu/bounding-rect";

export const ContextBoundingBox = ({ pdfId }: { pdfId: string }) => {
  const [context, setContext] = useAtom(activeBoundingContextAtom);
  if (
    !context ||
    !context.pdfId ||
    context.pdfId !== pdfId ||
    !context.rects ||
    !pdfId ||
    context.type === "text"
  ) {
    return null;
  }

  return (
    <BoundingRect
      pdfId={pdfId}
      rects={context.rects}
      onDismiss={() => setContext(undefined)}
    />
  );
};
