import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const penSizes = [0.4, 0.6, 0.8, 1.0];
export const penColors = [
  "#000000", // Black
  "#FFC300", // Yellow
  "#32CD32", // Green
  "#4169E1", // Blue
  "#DA70D6", // Plum
  "#FF69B4", // Pink
  "#FF4500", // Red
];

export const highlighterSizes = [1, 2, 3, 4];
export const highlighterColors = [
  "#FFC30080", // Yellow with opacity
  "#32CD3280", // Green with opacity
  "#4169E180", // Blue with opacity
  "#DA70D680", // Plum with opacity
  "#FF69B480", // Pink with opacity
  "#FF450080", // Red with opacity
];

export const activeAnnotatorAtomFamily = atomFamily((pdfId: string) =>
  atom<"pen" | "highlighter" | "eraser">(),
);

export const selectedPenSizeAtomFamily = atomFamily((pdfId: string) =>
  atom<number>(penSizes[1]),
);
export const selectedPenColorAtomFamily = atomFamily((pdfId: string) =>
  atom<string>(penColors[0]),
);

export const selectedHighlighterSizeAtomFamily = atomFamily((pdfId: string) =>
  atom<number>(highlighterSizes[1]),
);
export const selectedHighlighterColorAtomFamily = atomFamily((pdfId: string) =>
  atom<string>(highlighterColors[0]),
);
