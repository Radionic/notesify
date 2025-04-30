import { atom } from "jotai";

export const audioRecorderOpenAtom = atom<boolean>(false);
export const isRecordingAtom = atom<boolean>(false);
export const selectedRecordingIdAtom = atom<string | null>(null);
