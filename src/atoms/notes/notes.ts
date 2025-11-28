import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const notesOpenAtom = atom<boolean>(false);

export const generatingNotesAtom = atomFamily((notesId?: string) =>
  atom<AbortController>(),
);
