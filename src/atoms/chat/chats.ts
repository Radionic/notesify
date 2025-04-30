import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const chatsOpenAtom = atom<boolean>(false);
export const threadFinderOpenAtom = atom<boolean>(false);
export const activeChatIdAtom = atom<string>("TMP");

export const withThinkingAtom = atomWithStorage<boolean>(
  "with-thinking",
  false
);
