import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { draggingItemIdAtom } from "@/atoms/file-system/file-system";
import { openedPdfIdsAtom } from "@/atoms/pdf/pdf-viewer";

export function PdfViewerDndProvider({ children }: { children: ReactNode }) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );
  const openedPdfIds = useAtomValue(openedPdfIdsAtom);
  const setDraggingItemId = useSetAtom(draggingItemIdAtom);
  const navigate = useNavigate();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setDraggingItemId(e.active.id)}
      onDragEnd={(e) => {
        setDraggingItemId(undefined);
        if (!e.over?.id || !e.active.id) return;

        const [targetPdfId, side] = e.over.id.toString().split("-");
        const newPdfId = e.active.id.toString();
        // console.log("Dropping PDF", newPdfId, "on", targetPdfId, "side", side);

        // Check for duplicates
        for (const pdfId of openedPdfIds) {
          if (pdfId === newPdfId) {
            toast.info("Currently not supported: Cannot view the same PDF");
            return;
          }
        }

        const newOpenedPdfIds = [...openedPdfIds];
        const draggedIndex = openedPdfIds.indexOf(targetPdfId);
        if (draggedIndex === -1) return;

        // Insert the new PDF ID relative to the dragged item
        if (side === "left") {
          newOpenedPdfIds.splice(draggedIndex, 0, newPdfId);
        } else {
          newOpenedPdfIds.splice(draggedIndex + 1, 0, newPdfId);
        }
        navigate({
          to: "/viewer",
          search: { sid: newOpenedPdfIds[0] },
          // search: { sid: newOpenedPdfIds },
        });
      }}
    >
      {children}
    </DndContext>
  );
}
