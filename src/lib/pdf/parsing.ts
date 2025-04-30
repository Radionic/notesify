import { Mistral } from "@mistralai/mistralai";
import { type PDFDocumentProxy } from "pdfjs-dist";

export type ParsedPDF = {
  id: string;
  pdfId: string;
  model: string;
  text: string;
  images: string[] | null;
  page: number;
}[];

export const parsePdf = async ({
  pdfId,
  pdfDocument,
}: {
  pdfId: string;
  pdfDocument: PDFDocumentProxy;
}): Promise<ParsedPDF> => {
  const result: ParsedPDF = [];
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(" ");
    result.push({
      id: `${pdfId}-${pageNum}`,
      pdfId,
      model: "pdfjs",
      text,
      images: null,
      page: pageNum,
    });
  }
  return result;
};

export const parsePdfWithOcr = async ({
  apiKey,
  pdfId,
  pdfData,
}: {
  apiKey: string;
  pdfId: string;
  pdfData: Blob;
}): Promise<ParsedPDF> => {
  const client = new Mistral({ apiKey });

  const uploadedPdf = await client.files.upload({
    file: {
      fileName: `${pdfId}.pdf`,
      content: pdfData,
    },
    purpose: "ocr",
  });
  console.log("uploadedPdf", uploadedPdf);

  const signedUrl = await client.files.getSignedUrl({
    fileId: uploadedPdf.id,
  });
  console.log("signedUrl", signedUrl);

  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: signedUrl.url,
    },
    includeImageBase64: true,
  });

  const result = ocrResponse.pages.map((page) => ({
    id: `${pdfId}-${page.index + 1}`,
    pdfId,
    model: "mistral-ocr-latest",
    text: page.markdown,
    images: page.images
      .map((image) => image.imageBase64)
      .filter((image) => image !== null && image !== undefined),
    page: page.index + 1,
  }));
  return result;
};

export const parsePageNumbers = (xmlString: string): number[] => {
  // Get all the page numbers in the text, each page is like <page_x> in the text

  // Regular expression to match page tags and capture the numbers
  const pageRegex = /<page_(\d+)>/g;

  // Find all matches
  const matches = [...xmlString.matchAll(pageRegex)];

  // Extract and convert the captured numbers to integers
  const pageNumbers = matches.map((match) => parseInt(match[1], 10));

  // Sort the numbers in ascending order
  return pageNumbers.sort((a, b) => a - b);
};
