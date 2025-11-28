import { useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { activePdfIdAtom } from "@/atoms/pdf/pdf-viewer";
import { useUndoRedo } from "@/queries/pdf/use-pdf-history";

export const useHistoryShortcuts = () => {
  const activePdfId = useAtomValue(activePdfIdAtom);
  const { history, undo, redo } = useUndoRedo({ pdfId: activePdfId });

  // Undo
  useHotkeys(
    "mod+z",
    () => {
      undo();
    },
    { preventDefault: true },
    [history, activePdfId],
  );

  // Redo
  useHotkeys(
    "mod+shift+z",
    () => {
      redo();
    },
    { preventDefault: true },
    [history, activePdfId],
  );
};
