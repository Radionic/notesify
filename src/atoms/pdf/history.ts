import { atomFamily } from "jotai/utils";
import { atom } from "jotai";

import { Annotation } from "../../db/schema/pdf/annotations";
import { Highlight } from "../../db/schema/pdf/highlights";

interface BaseHistoryRecord {
  action: "create" | "update" | "delete";
  pdfId: string;
}
export type AnnotationHistoryRecord = BaseHistoryRecord & {
  type: "annotation";
  data: Annotation[];
  oldData?: Annotation[] | undefined;
};
export type HighlightHistoryRecord = BaseHistoryRecord & {
  type: "highlight";
  data: Highlight;
  oldData?: Highlight | undefined;
};
export type HistoryRecord = AnnotationHistoryRecord | HighlightHistoryRecord;

export interface HistoryState {
  past: HistoryRecord[];
  future: HistoryRecord[];
}

export const historyAtomFamily = atomFamily((pdfId?: string) =>
  atom<HistoryState>({
    past: [],
    future: [],
  })
);

export const canUndoAtom = atomFamily((pdfId?: string) =>
  atom((get) => {
    if (!pdfId) return false;
    const history = get(historyAtomFamily(pdfId));
    return history.past.length > 0;
  })
);

export const canRedoAtom = atomFamily((pdfId?: string) =>
  atom((get) => {
    if (!pdfId) return false;
    const history = get(historyAtomFamily(pdfId));
    return history.future.length > 0;
  })
);
