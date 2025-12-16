import { tool } from "ai";
import { and, asc, eq, inArray } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable, pdfsTable } from "@/db/schema";
import { extractVisualInfo } from "./ocr";
import { searchKeywords } from "./search-keywords";
import { highlightTextinPdf } from "./text-searching";
import { getOrExtractToC } from "./toc";

export const tools = ({ userId }: { userId: string }) => ({
  getTableOfContents: tool({
    description: "Get the overview (table of contents) of a PDF.",
    inputSchema: z.object({
      pdfId: z.string(),
    }),
    execute: async ({ pdfId }) => {
      return await getOrExtractToC({ pdfId, userId });
    },
  }),
  getPDFPageText: tool({
    description: "Get full text of specified PDF pages.",
    inputSchema: z.object({
      pdfId: z.string(),
      pages: z
        .array(z.number())
        .min(1)
        .describe("List of page numbers to read."),
      // previewCharsPerPage: z
      //   .number()
      //   .max(2000)
      //   .optional()
      //   .describe(
      //     "Maximum number of characters to read from each page for preview. Return all characters if undefined.",
      //   ),
    }),
    execute: async ({ pdfId, pages }) => {
      const items = await db.query.pdfIndexingTable.findMany({
        columns: {
          content: true,
          startPage: true,
        },
        where: and(
          eq(pdfIndexingTable.pdfId, pdfId),
          eq(pdfIndexingTable.type, "page"),
          inArray(pdfIndexingTable.startPage, pages),
        ),
        orderBy: [asc(pdfIndexingTable.startPage)],
      });
      if (items.length === 0) {
        const pdf = await db.query.pdfsTable.findFirst({
          columns: { id: true },
          where: eq(pdfsTable.id, pdfId),
        });
        if (!pdf) {
          throw Error(`PDF not found: ${pdfId}, check if pdf id is correct`);
        }
        return "No text found";
      }

      const text = items
        .map(
          (item) =>
            `<page_${item.startPage}>\n${item.content}\n</page_${item.startPage}>`,
        )
        .join("\n\n");
      // .map((item) =>
      //   previewCharsPerPage != null
      //     ? item.content.slice(0, previewCharsPerPage)
      //     : item.content,
      // )
      return text;
    },
  }),
  extractVisualInfoFromPDFPage: tool({
    description:
      "Extract visual info from a PDF page based on an instruction. Use this for extracting tables in Markdown, equations in KaTeX, describing/explaining images/figures/charts, or any visual content analysis.",
    inputSchema: z.object({
      pdfId: z.string(),
      page: z.number().describe("The 1-based page number to analyze."),
      instruction: z.string().describe("The instruction prompt for extraction"),
    }),
    execute: async ({ pdfId, page, instruction }) => {
      const result = await extractVisualInfo(pdfId, userId, page, instruction);
      return result || "No information extracted";
    },
  }),
  searchKeywords: tool({
    description:
      "Search keywords in PDF via exact match (case-insensitive). Return snippets of nearby text of the keywords.",
    inputSchema: z.object({
      pdfId: z.string(),
      keywords: z
        .array(z.string())
        .min(1)
        .max(5)
        .describe("1-5 keywords to search for."),
    }),
    execute: async ({ pdfId, keywords }) => {
      return await searchKeywords({ pdfId, keywords });
    },
  }),
  // Temporarily disabled until this feature is stable
  // highlightTextInPDF: tool({
  //   description:
  //     "Highlight text in a PDF page for user's reference. DO NOT explicitly ask user to provide pdfId, pdfPage, and originalPdfText, you should conclude them yourself by conversation context or other tools. This will return bounding boxes when the text is found.",
  //   inputSchema: z.object({
  //     pdfId: z.string(),
  //     pdfPage: z.number(),
  //     originalPdfText: z
  //       .string()
  //       .describe(
  //         "The complete sentence or paragraph to highlight in the page. No need to break by new lines or spaces.",
  //       ),
  //   }),

  //   execute: async ({ pdfId, pdfPage, originalPdfText }) => {
  //     return await highlightTextinPdf({ pdfId, pdfPage, originalPdfText });
  //   },
  // }),
  // searchPages: tool({
  //   description: "Search relevant PDF pages for the given query",
  //   inputSchema: z.object({
  //     pdfId: z.string().describe("The PDF ID"),
  //     query: z
  //       .string()
  //       .describe(
  //         "The query to search for. Must be detailed and specific, and in question format.",
  //       ),
  //   }),
  //   execute: async ({ pdfId, query }) => {
  //     // TODO: upsert text if not indexed yet, also wait some time before querying?
  //     await upsertText(
  //       pdfIndexingItems.map((item) => ({
  //         id: item.id,
  //         text: item.content.slice(0, 8000),
  //         metadata: {
  //           userId: session.user.id,
  //           pdfId: item.pdfId,
  //           type: "page" as const,
  //           text: item.content.slice(0, 8000),
  //           startPage: item.startPage,
  //           endPage: item.endPage,
  //         },
  //       })),
  //     );
  //     const result = await queryText(query, {
  //       topK: 20,
  //       filter: { pdfId, userId },
  //       returnMetadata: "all",
  //       // https://developers.cloudflare.com/vectorize/best-practices/query-vectors/#control-over-scoring-precision-and-query-accuracy
  //       returnValues: true,
  //     });
  //     return result
  //       .filter(
  //         ({ queryScore, rerankScore }) => (rerankScore || queryScore) >= 0.3,
  //       )
  //       .slice(0, 10)
  //       .map(({ metadata }) => ({
  //         page: metadata?.startPage,
  //         text: metadata?.text,
  //       }));
  //   },
  // }),
  calculate: tool({
    description:
      "Calculate Math expressions, using evaluate by MathJS. Supports standard math operations and derivatives (e.g. derivative('x^2', 'x')).",
    inputSchema: z.object({
      expressions: z
        .array(z.string())
        .describe("The expressions to calculate."),
    }),
    execute: async ({ expressions }) => {
      return expressions.map((expression) => {
        const result = evaluate(expression);
        return String(result);
      });
    },
  }),
});
