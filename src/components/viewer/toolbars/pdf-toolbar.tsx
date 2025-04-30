import { Eraser, Highlighter, Pen } from "lucide-react";

import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { activeAnnotatorAtomFamily } from "@/atoms/pdf/annotator-options";
import { AnnotatorOptions } from "@/components/pdf/menu/annotator-options";
import { UndoRedoButton } from "@/components/pdf/menu/buttons/undo-redo-button";
import { PageButton } from "@/components/pdf/menu/buttons/page-button";
import { useFile } from "@/queries/file-system/use-file-system";

export const PdfToolbar = ({ pdfId }: { pdfId: string }) => {
  const { data: pdfFile } = useFile({ id: pdfId });
  const [activeAnnotator, setActiveAnnotator] = useAtom(
    activeAnnotatorAtomFamily(pdfId)
  );

  return (
    <Card className="sticky top-0 h-9 flex flex-row items-center gap-0.5 px-2 border-2 border-transparent z-30 rounded-none overflow-y-scroll scrollbar-hide bg-header">
      <span className="truncate max-w-96 min-w-32 mr-2">
        {pdfFile?.name || "Unknown PDF"}
      </span>

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
            activeAnnotator === "highlighter" ? undefined : "highlighter"
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
            activeAnnotator === "eraser" ? undefined : "eraser"
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
