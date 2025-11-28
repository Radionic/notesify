import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PDFViewer } from "pdfjs-dist/types/web/pdf_rendering_queue";

// export type BBox = {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// };

// export type BBox = {
//   top: number;
//   right: number;
//   bottom: number;
//   left: number;
// };

export type PDFVIewerStore = {
  document?: PDFDocumentProxy;
  viewer?: PDFViewer;
  pageCount?: number;
  zoomScale: number;

  activeTextSelection?: TextSelection;
  activeHighlight?: Highlight;

  chatsOpen?: boolean;
  chatsSize: number;

  notesOpen?: boolean;
  notesSize: number;

  threadFinderOpen?: boolean;
};

export type Position = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type PagedPosition = Position & {
  page: number;
};

export type Rect = {
  page: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type PagedRect = Rect & {
  pageEl: HTMLElement;
};

export type TextSelection = {
  text: string;
  rects: Rect[];
};
