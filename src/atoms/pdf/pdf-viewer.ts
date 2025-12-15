import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFViewer } from "pdfjs-dist/types/web/pdf_rendering_queue";
import type { Highlight } from "@/db/schema";
import type { ExplicitDest } from "@/lib/pdf/link-service";
import type { TextSelection } from "@/lib/types";

export const pdfViewerOpenAtom = atom<boolean>(true);

export const documentAtomFamily = atomFamily((pdfId?: string) =>
  atom<PDFDocumentProxy>(),
);
export const viewerAtomFamily = atomFamily((pdfId?: string) =>
  atom<PDFViewer>(),
);
export const renderedPagesAtomFamily = atomFamily((pdfId?: string) =>
  atom<number[]>([]),
);
export const currentPageAtomFamily = atomFamily((pdfId?: string) =>
  atom<number>(),
);
export interface PdfPreviewState {
  pdfId: string;
  pageNumber: number;
  destArray: ExplicitDest;
}
export const pdfPreviewAtom = atom<PdfPreviewState | null>(null);

export const openedPdfIdsAtom = atom<string[]>([]);
export const activePdfIdAtom = atom<string>();
export const activeTextSelectionAtomFamily = atomFamily((pdfId?: string) =>
  atom<TextSelection>(),
);
export const activeHighlightAtom = atom<Highlight>();
export const selectContextModeAtom = atom<"area" | "page">();
