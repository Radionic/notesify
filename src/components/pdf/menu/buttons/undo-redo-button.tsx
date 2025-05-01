import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { useUndoRedo } from "@/queries/pdf/use-pdf-history";
import { Redo2, Undo2 } from "lucide-react";

export const UndoRedoButton = ({ pdfId }: { pdfId: string }) => {
  const { canUndo, canRedo, undo, redo } = useUndoRedo({ pdfId });

  return (
    <>
      <TooltipButton
        tooltip="Undo"
        disabled={!canUndo}
        onClick={() => {
          undo();
        }}
      >
        <Undo2 />
      </TooltipButton>
      <TooltipButton
        tooltip="Redo"
        disabled={!canRedo}
        onClick={() => {
          redo();
        }}
      >
        <Redo2 />
      </TooltipButton>
    </>
  );
};
