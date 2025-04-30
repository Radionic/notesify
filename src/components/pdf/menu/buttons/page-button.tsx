import { currentPageAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { useAtomValue } from "jotai";
import { PagesDialog } from "../../dialog/pages-dialog";
import { useState } from "react";
import { usePdf } from "@/queries/pdf/use-pdf";

export const PageButton = ({ pdfId }: { pdfId: string }) => {
  const [open, setOpen] = useState(false);
  const currentPage = useAtomValue(currentPageAtomFamily(pdfId));
  const { data: pdf } = usePdf({ pdfId });

  return (
    <>
      <TooltipButton
        tooltip="View pages"
        onClick={() => setOpen(true)}
        className="gap-1 leading-4"
      >
        <span className="hidden md:block">Page</span>
        {currentPage} / {pdf?.pageCount}
      </TooltipButton>
      {open && <PagesDialog pdfId={pdfId} onOpenChange={setOpen} />}
    </>
  );
};
