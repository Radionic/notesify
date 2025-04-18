import { Eraser, Highlighter, Pen } from "lucide-react";

import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { fileAtomFamily } from "@/atoms/file-system";
import { activeAnnotatorAtomFamily } from "@/atoms/annotator-options";
import { AnnotatorOptions } from "@/components/pdf/menu/annotator-options";
import { UndoRedoButton } from "@/components/pdf/menu/buttons/undo-redo-button";
import { PageButton } from "@/components/pdf/menu/buttons/page-button";

export const PdfToolbar = ({ pdfId }: { pdfId: string }) => {
  const pdf = useAtomValue(fileAtomFamily(pdfId));
  const pdfName = pdf?.name || "Unknown PDF";
  const [activeAnnotator, setActiveAnnotator] = useAtom(
    activeAnnotatorAtomFamily(pdfId)
  );

  return (
    <Card
      className={cn(
        "sticky top-0 flex flex-col w-full pointer-events-auto px-2 border-2 border-transparent z-30 rounded-none shadow"
      )}
    >
      <div className="flex flex-row items-center gap-0.5">
        <span className="truncate max-w-96 mr-2">{pdfName}</span>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <TooltipButton
          tooltip="Pen"
          onClick={() =>
            setActiveAnnotator(activeAnnotator === "pen" ? undefined : "pen")
          }
          className={cn(activeAnnotator === "pen" && "bg-neutral-200")}
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
          className={cn(activeAnnotator === "highlighter" && "bg-neutral-200")}
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
          className={cn(activeAnnotator === "eraser" && "bg-neutral-200")}
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

        <div className="flex-grow" />

        <PageButton pdfId={pdfId} />
      </div>
    </Card>
  );
};
