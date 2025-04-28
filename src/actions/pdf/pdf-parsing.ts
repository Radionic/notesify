import { pdfDataAtomFamily } from "@/atoms/pdf/pdf";
import { pdfParsingAtomFamily } from "@/atoms/pdf/pdf-parsing";
import { documentAtomFamily } from "@/atoms/pdf/pdf-viewer";
import {
  configuredProvidersAtom,
  openSettingsDialogAtom,
} from "@/atoms/setting/providers";
import { ActionError } from "@/hooks/state/use-action";
import { ParsedPDF, parsePdf, parsePdfWithOcr } from "@/lib/pdf/parsing";
import { atom } from "jotai";

export const parsePdfAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      method,
    }: {
      pdfId: string;
      method?: "ocr" | "pdfjs";
    }
  ): Promise<ParsedPDF> => {
    const parsedPdf = await get(pdfParsingAtomFamily(pdfId));
    if (parsedPdf && parsedPdf.length > 0) {
      console.log("Cached parsed PDF", parsedPdf);
      return parsedPdf;
    }

    const apiKey = get(configuredProvidersAtom).find(
      (p) => p.type === "mistral"
    )?.settings.apiKey;
    // Default to ocr if no method is specified and API key is available
    method = method || (apiKey ? "ocr" : "pdfjs");
    console.log("Parsing PDF: ", method);

    if (method === "pdfjs") {
      const pdfDocument = get(documentAtomFamily(pdfId));
      if (!pdfDocument) {
        throw new ActionError("Failed to get PDF");
      }

      const result = await parsePdf({ pdfId, pdfDocument });
      set(pdfParsingAtomFamily(pdfId), result);
      return result;
    } else {
      const pdf = await get(pdfDataAtomFamily(pdfId));
      if (!pdf) {
        throw new ActionError("PDF not found");
      }

      if (!apiKey) {
        set(openSettingsDialogAtom, true);
        throw new ActionError("Please configure the Mistral provider");
      }

      const result = await parsePdfWithOcr({
        apiKey,
        pdfId,
        pdfData: pdf.data,
      });
      set(pdfParsingAtomFamily(pdfId), result);
      return result;
    }
  }
);

export const getPdftextAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      pages,
      startPage = 1,
      endPage,
    }: { pdfId: string; pages?: number[]; startPage?: number; endPage?: number }
  ): Promise<string> => {
    const parsedPdf = await set(parsePdfAtom, { pdfId });
    const maxPage = parsedPdf.length;

    // Validate input parameters
    if (startPage > (endPage ?? maxPage)) {
      throw new ActionError(`Invalid page range: ${startPage} - ${endPage}`);
    }
    if (startPage < 1 || startPage > maxPage) {
      throw new ActionError(`Invalid start page: ${startPage}`);
    }
    if (endPage && (endPage < 1 || endPage > maxPage)) {
      throw new ActionError(`Invalid end page: ${endPage}`);
    }

    return parsedPdf
      .filter((p) => {
        const inRange = p.page >= startPage && p.page <= (endPage ?? maxPage);
        const inSpecifiedPages = !pages || pages.includes(p.page);
        return inRange && inSpecifiedPages;
      })
      .map((p) => `<page_${p.page}>\n${p.text}\n</page_${p.page}>`)
      .join("\n\n");
  }
);
