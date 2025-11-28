import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

export const PDFViewerDroppable = ({ pdfId }: { pdfId: string }) => {
  const { isOver: isOverLeft, setNodeRef: setLeftRef } = useDroppable({
    id: `${pdfId}-left`,
  });

  const { isOver: isOverRight, setNodeRef: setRightRef } = useDroppable({
    id: `${pdfId}-right`,
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full flex">
      <div
        ref={setLeftRef}
        className={cn(
          `w-1/2 h-full transition-all duration-200`,
          isOverLeft && "bg-blue-500/20",
        )}
      />
      <div
        ref={setRightRef}
        className={cn(
          `w-1/2 h-full transition-all duration-200`,
          isOverRight && "bg-blue-500/20",
        )}
      />
    </div>
  );
};
