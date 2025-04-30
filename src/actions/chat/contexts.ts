import { atom } from "jotai";

import {
  activeBoundingContextAtom,
  activeContextsAtom,
  Context,
} from "@/atoms/chat/contexts";
import { jumpToPageAtom } from "../pdf/pdf-viewer";

export const addContextAtom = atom(null, (get, set, context: Context) => {
  set(activeContextsAtom, (currentContexts) => [...currentContexts, context]);
});

export const removeContextAtom = atom(null, (get, set, id: string) => {
  set(activeContextsAtom, (currentContexts) =>
    currentContexts.filter((context) => context.id !== id)
  );
});

export const jumpToContextAtom = atom(null, (get, set, context: Context) => {
  const pdfId = context.pdfId;
  set(activeBoundingContextAtom, context);
  set(jumpToPageAtom, pdfId, context.page);
});
