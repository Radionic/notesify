import { Mistral } from "@mistralai/mistralai";
import { getDefaultStore } from "jotai";
import { getDocument } from "pdfjs-dist";
import { configuredProvidersAtom } from "@/atoms/setting/providers";
import type { ParsedPDFPage } from "@/db/schema";
import { dbService } from "../db";
import { readNativeFile } from "../tauri";

export const parsePdf = async ({
  pdfId,
  method,
}: {
  pdfId: string;
  method?: "pdfjs" | "ocr";
}) => {
  const parsedPdf = await dbService.pdf.getParsedPdf({ pdfId });
  if (parsedPdf.length > 0) {
    console.log("Cached parsed PDF: ", parsedPdf);
    return parsedPdf;
  }

  // Default to ocr if no method is specified and API key is available
  const apiKey = getDefaultStore()
    .get(configuredProvidersAtom)
    .find((p) => p.type === "mistral")?.settings.apiKey;
  method = method || (apiKey ? "ocr" : "pdfjs");
  console.log("Parsing PDF: ", method);

  const pdfData: Blob = await readNativeFile("pdfs", `${pdfId}.pdf`);

  const result: ParsedPDFPage[] =
    method === "pdfjs"
      ? await parsePdfWithPdfjs({ pdfId, pdfData })
      : await parsePdfWithOcr({
          pdfId,
          apiKey,
          pdfData,
        });
  await dbService.pdf.addParsedPdf({ parsedPdf: result });
  return result;
};

export const parsePdfWithPdfjs = async ({
  pdfId,
  pdfData,
}: {
  pdfId: string;
  pdfData: Blob;
}) => {
  const buffer = await pdfData.arrayBuffer();
  const pdfDocument = await getDocument(buffer).promise;

  const result: ParsedPDFPage[] = [];
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
  apiKey?: string;
  pdfId: string;
  pdfData: Blob;
}) => {
  if (!apiKey) {
    throw new Error("Please configure the Mistral API key");
  }

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

  const result: ParsedPDFPage[] = ocrResponse.pages.map((page) => ({
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
}) => {
  const parsedPdf = await parsePdf({ pdfId });
  const maxPage = parsedPdf.length;

  // Validate input parameters
  if (startPage > (endPage ?? maxPage)) {
    throw new Error(`Invalid page range: ${startPage} - ${endPage}`);
  }
  if (startPage < 1 || startPage > maxPage) {
    throw new Error(`Invalid start page: ${startPage}`);
  }
  if (endPage && (endPage < 1 || endPage > maxPage)) {
    throw new Error(`Invalid end page: ${endPage}`);
  }

  return parsedPdf
    .filter((p) => {
      const inRange = p.page >= startPage && p.page <= (endPage ?? maxPage);
      const inSpecifiedPages = !pages || pages.includes(p.page);
      return inRange && inSpecifiedPages;
    })
    .map((p) => `<page_${p.page}>\n${p.text}\n</page_${p.page}>`)
    .join("\n\n");
};
