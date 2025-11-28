import { generateObject, type LanguageModelV1 } from "ai";
import { z } from "zod";
import type {
  IndexedPDFPage,
  ParsedPDFPage,
  PDFIndexingLevel,
} from "@/db/schema";
import { dbService } from "../db";
import { getPdfTexts, parsePdf } from "./parsing";

export const indexPages = async ({
  model,
  pdfId,
  pagesPerBatch = 5,
  maxConcurrentBatches = 3,
}: {
  model: LanguageModelV1;
  pdfId: string;
  pagesPerBatch?: number;
  maxConcurrentBatches?: number;
}): Promise<IndexedPDFPage[]> => {
  const indexedPdf = await dbService.pdf.getIndexedPdf({ pdfId });
  if (indexedPdf.length > 0) {
    return indexedPdf;
  }

  if (!model) {
    throw new Error("No model found");
  }

  const parsedPdf = await parsePdf({ pdfId });
  const pageCount = parsedPdf.length;
  const batchCount = Math.ceil(pageCount / pagesPerBatch);

  // Index pages by batches
  const results: IndexedPDFPage[] = [];
  for (let i = 0; i < batchCount; i += maxConcurrentBatches) {
    const batchPromises = [];

    // Create batch promises for concurrent execution
    for (let j = 0; j < maxConcurrentBatches && i + j < batchCount; j++) {
      const batchIndex = i + j;
      const startPage = batchIndex * pagesPerBatch;
      const endPage = Math.min(startPage + pagesPerBatch, pageCount);
      const pages = parsedPdf.filter(
        (p) => p.page >= startPage && p.page < endPage,
      );

      batchPromises.push(_indexPages(model, pages));
    }

    // Wait for this set of concurrent batches to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(
      ...batchResults.flat().map((r) => ({
        id: `${pdfId}-${r.page}`,
        pdfId,
        model: model.modelId,
        summary: r.summary,
        level: "page" as PDFIndexingLevel,
        startPage: r.page,
        endPage: null,
      })),
    );
  }
  console.log("All indexed pages", results);
  return results;
};

const _indexPages = async (model: LanguageModelV1, pages: ParsedPDFPage[]) => {
  const prompt = `Generate a concise summary for each of the following ${
    pages.length
  } PDF pages.
Focus on key information, main topics, and important details.

${pages.map((page) => `PAGE ${page.page}:\n${page.text}\n`).join("\n\n")}`;

  // TODO: add images
  const res = await generateObject({
    model,
    output: "array",
    schema: z.object({
      page: z.number(),
      summary: z.string(),
    }),
    prompt,
    maxTokens: 4096,
  });
  console.log("Indexed pages", res.object);
  return res.object;
};

export const searchPages = async ({
  model,
  pdfId,
  query,
}: {
  model?: LanguageModelV1;
  pdfId: string;
  query: string;
}) => {
  if (!model) {
    throw new Error("No model found");
  }
  const indexedPdf = await indexPages({ model, pdfId });

  const pageSummaries = indexedPdf
    .map((p) => `PAGE ${p.startPage}:\n${p.summary}`)
    .join("\n\n");
  // console.log("Page summaries", pageSummaries);

  const res = await generateObject({
    model,
    output: "array",
    schema: z.number().describe("Page number"),
    prompt: `Find at most 10 relevant pages for the following query. Return only page numbers.
  Query:
  ${query}
  
  Page summaries:
  ${pageSummaries}`,
    maxTokens: 64,
  });
  const pages = res.object;

  const pageTexts = await getPdfTexts({ pdfId, pages });
  // console.log("Search pages result", pages);
  return { pages, pageTexts };
};
