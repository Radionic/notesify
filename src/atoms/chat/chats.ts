import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const chatsOpenAtom = atom<boolean>(false);
export const threadFinderOpenAtom = atom<boolean>(false);
export const activeChatIdAtom = atom<string>("TMP");

export const withThinkingAtom = atomWithStorage<boolean>(
  "with-thinking",
  false,
);
