import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFLinkService } from "pdfjs-dist/web/pdf_viewer.mjs";

export type ExplicitDest = [
  { num: number; gen: number } | number,
  { name: string },
  ...number[],
];

export type InternalLinkClickHandler = (dest: {
  pageNumber: number;
  destArray: ExplicitDest;
}) => void;

export class CustomLinkService extends PDFLinkService {
  private onInternalLinkClick: InternalLinkClickHandler | null = null;

  setInternalLinkClickHandler(handler: InternalLinkClickHandler) {
    this.onInternalLinkClick = handler;
  }

  async goToDestination(dest: string | ExplicitDest) {
    const pdfDoc = this.pdfDocument as PDFDocumentProxy | null;
    if (!pdfDoc || !dest) return;

    const explicitDest =
      typeof dest === "string"
        ? ((await pdfDoc.getDestination(dest)) as ExplicitDest | null)
        : dest;

    if (!explicitDest || !Array.isArray(explicitDest)) {
      console.error("Invalid destination:", dest);
      return;
    }

    const destRef = explicitDest[0];
    const pageIndex =
      typeof destRef === "number"
        ? destRef
        : typeof destRef === "object"
          ? await pdfDoc.getPageIndex(destRef)
          : null;

    if (pageIndex == null) {
      console.error("Invalid destination reference:", destRef);
      return;
    }

    const pageNumber = pageIndex + 1;
    if (this.onInternalLinkClick) {
      this.onInternalLinkClick({ pageNumber, destArray: explicitDest });
    } else {
      super.goToDestination(dest);
    }
  }
}
