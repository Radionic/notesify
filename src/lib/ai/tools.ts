import { tool } from "ai";
import { and, asc, eq, inArray } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable } from "@/db/schema";
import { searchKeywords } from "./search-keywords";
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
    description: "Get the text of specified PDF pages.",
    inputSchema: z.object({
      pdfId: z.string(),
      pages: z
        .array(z.number())
        .min(1)
        .describe("The 1-based page numbers to read."),
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

      const text = items
        ?.map(
          (item) =>
            `<page_${item.startPage}>\n${item.content}\n</page_${item.startPage}>`,
        )
        .join("\n\n");
      // .map((item) =>
      //   previewCharsPerPage != null
      //     ? item.content.slice(0, previewCharsPerPage)
      //     : item.content,
      // )
      return text || "No text found";
    },
  }),
  searchKeywords: tool({
    description:
      "Get the nearby text of the keywords via exact match (case-insensitive).",
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
    description: "Calculate a Math expression, using evaluate by MathJS.",
    inputSchema: z.object({
      expression: z.string().describe("The expression to calculate."),
    }),
    execute: async ({ expression }) => {
      return await evaluate(expression);
    },
  }),
});
