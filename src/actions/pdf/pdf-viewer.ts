import { documentAtomFamily, viewerAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { ActionError } from "@/hooks/state/use-action";
import { atom } from "jotai";

export type PDFMetadata = {
  id: string;
  name: string;
  pageCount: number;
};

export const jumpToPageAtom = atom(
  null,
  async (get, set, pdfId: string, pageNumber: number) => {
    const viewer = get(viewerAtomFamily(pdfId));
    if (!viewer) return;

    const page = await viewer.getPageView(pageNumber - 1)?.div;
    if (!page) {
      throw new ActionError("Failed to jump to page");
    }
    page.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
);

export const getDocumentAtom = atom(null, (get, set, pdfId: string) => {
  return get(documentAtomFamily(pdfId));
});
