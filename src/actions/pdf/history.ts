import { historyAtomFamily, HistoryRecord } from "@/atoms/pdf/history";
import { atom } from "jotai";

const MAX_HISTORY_SIZE = 50; // Maximum number of actions to keep in history

export const pushActionAtom = atom(null, (get, set, record: HistoryRecord) => {
  const history = get(historyAtomFamily(record.pdfId));

  set(historyAtomFamily(record.pdfId), {
    past: [...history.past, record].slice(-MAX_HISTORY_SIZE),
    future: [], // Clear future when new action is pushed
  });
});
