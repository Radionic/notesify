import { useAtom } from "jotai";

import { activeBoundingContextAtom } from "@/atoms/chat/contexts";

import { BoundingRect } from "../../pdf/menu/bounding-rect";

export const ContextBoundingBox = ({ pdfId }: { pdfId: string }) => {
  const [context, setContext] = useAtom(activeBoundingContextAtom);
  if (!context || context.pdfId !== pdfId) return null;

  return (
    <BoundingRect
      pdfId={pdfId}
      rects={context.rects}
      onDismiss={() => setContext(undefined)}
    />
  );
};
