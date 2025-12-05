import { useAtom } from "jotai";
import { ChevronDown, Eraser, Highlighter, Pen } from "lucide-react";
import { useState } from "react";
import { activeAnnotatorAtomFamily } from "@/atoms/pdf/annotator-options";
import { FileBrowser } from "@/components/file-system/file-browser";
import { AnnotatorOptions } from "@/components/pdf/menu/annotator-options";
import { PageButton } from "@/components/pdf/menu/buttons/page-button";
import { UndoRedoButton } from "@/components/pdf/menu/buttons/undo-redo-button";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useFile } from "@/queries/file-system/use-file-system";

export const PdfToolbar = ({ pdfId }: { pdfId: string }) => {
  const { data: pdfFile } = useFile({ id: pdfId });
  const [activeAnnotator, setActiveAnnotator] = useAtom(
    activeAnnotatorAtomFamily(pdfId),
  );
  const [browserOpen, setBrowserOpen] = useState(false);

  return (
    <Card className="sticky top-0 h-9 flex flex-row items-center gap-0.5 border-2 border-transparent z-30 rounded-none overflow-y-scroll scrollbar-hide bg-header">
      <Button
        variant="ghost"
        onClick={() => setBrowserOpen(true)}
        className="cursor-pointer px-2"
      >
        <span className="truncate">{pdfFile?.name || "Unknown PDF"}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
      </Button>

      <Dialog open={browserOpen} onOpenChange={setBrowserOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Open a PDF</DialogTitle>
          </DialogHeader>
          <FileBrowser readOnly onPdfSelected={() => setBrowserOpen(false)} />
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <TooltipButton
        tooltip="Pen"
        onClick={() =>
          setActiveAnnotator(activeAnnotator === "pen" ? undefined : "pen")
        }
        className={cn(activeAnnotator === "pen" && "bg-secondary")}
      >
        <Pen />
      </TooltipButton>
      <TooltipButton
        tooltip="Highlighter"
        onClick={() =>
          setActiveAnnotator(
            activeAnnotator === "highlighter" ? undefined : "highlighter",
          )
        }
        className={cn(activeAnnotator === "highlighter" && "bg-secondary")}
      >
        <Highlighter />
      </TooltipButton>
      <TooltipButton
        tooltip="Eraser"
        onClick={() =>
          setActiveAnnotator(
            activeAnnotator === "eraser" ? undefined : "eraser",
          )
        }
        className={cn(activeAnnotator === "eraser" && "bg-secondary")}
      >
        <Eraser />
      </TooltipButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <UndoRedoButton pdfId={pdfId} />

      {(activeAnnotator === "pen" || activeAnnotator === "highlighter") && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <AnnotatorOptions pdfId={pdfId} type={activeAnnotator} />
        </>
      )}

      <span className="grow" />

      <PageButton pdfId={pdfId} />
    </Card>
  );
};
