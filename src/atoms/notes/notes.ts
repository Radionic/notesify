import { atomFamily } from "jotai/utils";
import { atom } from "jotai";

export const notesOpenAtom = atom<boolean>(false);

export const generatingNotesAtom = atomFamily((notesId?: string) =>
  atom<AbortController>()
);
