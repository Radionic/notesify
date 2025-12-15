import { useAtomValue, useSetAtom } from "jotai";
import { ArrowRight, X } from "lucide-react";
import { pdfPreviewAtom, viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import type { ExplicitDest } from "@/lib/pdf/link-service";

export const PdfPagePreviewToolbar = ({
  pageNumber,
  pdfId,
  destArray,
}: {
  pageNumber: number;
  pdfId: string;
  destArray: ExplicitDest;
}) => {
  const setPreview = useSetAtom(pdfPreviewAtom);
  const viewer = useAtomValue(viewerAtomFamily(pdfId));

  const handleClose = () => {
    setPreview(null);
  };

  const handleGo = () => {
    if (viewer) {
      viewer.scrollPageIntoView({
        pageNumber,
        destArray,
      });
    }
    setPreview(null);
  };

  return (
    <Card className="sticky top-0 h-9 flex flex-row items-center gap-0.5 border-2 border-transparent z-30 rounded-none bg-header scrollbar-hide overflow-x-auto overflow-y-hidden touch-pan-x md:overflow-visible">
      <span className="px-2 text-sm text-muted-foreground">
        Preview: Page {pageNumber}
      </span>

      <span className="grow" />

      <TooltipButton tooltip="Go to page" onClick={handleGo}>
        <ArrowRight className="h-4 w-4" />
      </TooltipButton>
      <TooltipButton tooltip="Close preview" onClick={handleClose}>
        <X className="h-4 w-4" />
      </TooltipButton>
    </Card>
  );
};
