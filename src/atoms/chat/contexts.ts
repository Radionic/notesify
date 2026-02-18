import { atom } from "jotai";

import type { Rect } from "@/lib/types";

export type TextContext = {
  id: string;
  type: "text";
  content?: string;
  fileId?: string;
  rects?: Rect[];
  page?: number;
};

export type ImageContext = {
  type: "image";
  fileId: string;
};

export type PdfContext = {
  type: "pdf";
  fileId: string;
};

export type Context = TextContext | ImageContext | PdfContext;

export const activeContextsAtom = atom<Context[]>([]);
export const activeBoundingContextAtom = atom<TextContext>();
