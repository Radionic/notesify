import { atom } from "jotai";

import type { Rect } from "@/lib/types";

export type Context = {
  id: string;
  type: "text" | "area" | "page" | "viewing-page";
  content?: string;
  rects: Rect[];
  page: number;
  pdfId: string;
};

export const activeContextsAtom = atom<Context[]>([]);
export const activePreviewContextAtom = atom<Context>();
export const activeBoundingContextAtom = atom<Context>();
