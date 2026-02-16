import { useAtom } from "jotai";

import { activeBoundingContextAtom } from "@/atoms/chat/contexts";

import { BoundingRect } from "../../pdf/menu/bounding-rect";

export const ContextBoundingBox = ({ pdfId }: { pdfId: string }) => {
  const [context, setContext] = useAtom(activeBoundingContextAtom);
  if (
    !context ||
    !context.fileId ||
    context.fileId !== pdfId ||
    !context.rects ||
    !pdfId
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
