import { useMutation } from "@tanstack/react-query";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import {
  canRedoAtom,
  canUndoAtom,
  type HistoryRecord,
  historyAtomFamily,
} from "@/atoms/pdf/history";
import type { Annotation } from "@/db/schema";
import { useCreateAnnotations, useDeleteAnnotations } from "./use-annotation";
import {
  useChangeHighlightColor,
  useCreateHighlight,
  useDeleteHighlight,
} from "./use-highlight";

export const useUndoRedo = ({ pdfId }: { pdfId?: string }) => {
  const canUndo = useAtomValue(canUndoAtom(pdfId));
  const canRedo = useAtomValue(canRedoAtom(pdfId));
  const [history, setHistory] = useAtom(historyAtomFamily(pdfId));
  const { mutateAsync: handleAction } = useHandleAction();

  const undo = async () => {
    if (history.past.length === 0) return;

    const lastAction = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    // Create reverse record
    // @ts-expect-error
    const record: HistoryRecord = {
      ...lastAction,
      action:
        lastAction.action === "create"
          ? "delete"
          : lastAction.action === "delete"
            ? "create"
            : "update",
      data:
        lastAction.action === "update" && lastAction.oldData
          ? lastAction.oldData
          : lastAction.data,
      oldData: lastAction.action === "update" ? lastAction.data : undefined,
    };

    setHistory({
      past: newPast,
      future: [lastAction, ...history.future],
    });
    await handleAction({ record });
  };

  const redo = async () => {
    if (history.future.length === 0) return;

    const record = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, record],
      future: newFuture,
    });
    await handleAction({ record });
  };

  return { history, canUndo, canRedo, undo, redo };
};

const MAX_HISTORY_SIZE = 50; // Maximum number of actions to keep in history

export const usePushHistory = () => {
  const pushHistory = (record: HistoryRecord) => {
    const store = getDefaultStore();
    const history = store.get(historyAtomFamily(record.pdfId));
    store.set(historyAtomFamily(record.pdfId), {
      past: [...history.past, record].slice(-MAX_HISTORY_SIZE),
      future: [], // Clear future when new action is pushed
    });
  };
  return { pushHistory };
};

export const useHandleAction = () => {
  const { mutateAsync: createAnnotations } = useCreateAnnotations();
  const { mutateAsync: deleteAnnotations } = useDeleteAnnotations();
  const { mutateAsync: createHighlight } = useCreateHighlight();
  const { mutateAsync: deleteHighlight } = useDeleteHighlight();
  const { mutateAsync: updateHighlight } = useChangeHighlightColor();

  return useMutation({
    mutationFn: async ({ record }: { record: HistoryRecord }) => {
      const { action, type, data } = record;
      if (type === "annotation") {
        if (action === "create") {
          await createAnnotations({ annotations: data, saveHistory: false });
        } else if (action === "delete") {
          const ids = data.map((a: Annotation) => a.id);
          await deleteAnnotations({
            ids,
            pdfId: data[0].pdfId,
            saveHistory: false,
          });
        }
      } else if (type === "highlight") {
        if (action === "create") {
          await createHighlight({ highlight: data, saveHistory: false });
        } else if (action === "delete") {
          await deleteHighlight({
            pdfId: data.pdfId,
            highlightId: data.id,
            saveHistory: false,
          });
        } else if (action === "update") {
          await updateHighlight({
            pdfId: data.pdfId,
            highlightId: data.id,
            color: data.color,
            saveHistory: false,
          });
        }
      }
    },
  });
};
