import { atom } from "jotai";
import { atomFamily } from "jotai-family";

export const PEN_SIZES = [40, 60, 80, 100];
export const PEN_COLORS = [
  "#000000", // Black
  "#FFC300", // Yellow
  "#32CD32", // Green
  "#4169E1", // Blue
  "#DA70D6", // Plum
  "#FF69B4", // Pink
  "#FF4500", // Red
];

export const HIGHLIGHTER_SIZES = [100, 200, 300, 400];
export const HIGHLIGHTER_COLORS = [
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
  atom<number>(PEN_SIZES[1]),
);
export const selectedPenColorAtomFamily = atomFamily((pdfId: string) =>
  atom<string>(PEN_COLORS[0]),
);

export const selectedHighlighterSizeAtomFamily = atomFamily((pdfId: string) =>
  atom<number>(HIGHLIGHTER_SIZES[1]),
);
export const selectedHighlighterColorAtomFamily = atomFamily((pdfId: string) =>
  atom<string>(HIGHLIGHTER_COLORS[0]),
);
