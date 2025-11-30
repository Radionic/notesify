import type { ParsedPDFPage } from "@/db/schema";

export const parsePdf = async ({
  pdfId,
  method,
}: {
  pdfId: string;
  method?: "pdfjs" | "ocr";
}): Promise<ParsedPDFPage[]> => {
  console.warn("parsePdf is temporarily disabled", { pdfId, method });
  throw new Error("parsePdf is temporarily disabled");
};

export const getPdfTexts = async ({
  pdfId,
  pages,
  startPage = 1,
  endPage,
}: {
  pdfId: string;
  pages?: number[];
  startPage?: number;
  endPage?: number;
}): Promise<string> => {
  console.warn("getPdfTexts is temporarily disabled", {
    pdfId,
    pages,
    startPage,
    endPage,
  });
  throw new Error("getPdfTexts is temporarily disabled");
};
