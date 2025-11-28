import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const DEFAULT_COLORS = ["#ffffbb", "#d6ffbb", "#bbbbff", "#ffd6bb", "#ffbbff"];
const DEFAULT_COLOR = "#ffffbb";

export const highlightColorsAtom = atom<string[]>(DEFAULT_COLORS);

export const selectedHighlightColorAtom = atomWithStorage<string>(
  "selected-highlight-color",
  DEFAULT_COLOR,
);
