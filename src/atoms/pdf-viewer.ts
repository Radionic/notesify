import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PDFViewer } from "pdfjs-dist/types/web/pdf_rendering_queue";

import { TextSelection } from "@/lib/types";

export const pdfViewerOpenAtom = atom<boolean>(true);

export const documentAtomFamily = atomFamily((pdfId?: string) =>
  atom<PDFDocumentProxy>()
);
export const viewerAtomFamily = atomFamily((pdfId?: string) =>
  atom<PDFViewer>()
);
export const renderedPagesAtomFamily = atomFamily((pdfId?: string) =>
  atom<number[]>([])
);
export const currentPageAtomFamily = atomFamily((pdfId?: string) =>
  atom<number>()
);


export const openedPdfIdsAtom = atom<string[]>([]);
export const activePdfIdAtom = atom<string>();
export const activeTextSelectionAtomFamily = atomFamily((pdfId?: string) =>
  atom<TextSelection>()
);
export const selectContextModeAtom = atom<"area" | "page">();
