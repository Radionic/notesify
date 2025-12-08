import { tool } from "ai";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable } from "@/db/schema";
import { getOrExtractToC } from "./toc";

export const tools = ({ userId }: { userId: string }) => ({
  getTableOfContents: tool({
    description: "Get the overview (table of contents) of a PDF.",
    inputSchema: z.object({
      pdfId: z
        .string()
        .describe("The PDF ID to generate the table of contents for."),
    }),
    execute: async ({ pdfId }) => {
      return await getOrExtractToC({ pdfId, userId });
    },
  }),
  getPDFPageText: tool({
    description: "Get the text of specified PDF pages.",
    inputSchema: z.object({
      pdfId: z.string().describe("The PDF ID."),
      startPage: z.number().describe("The start page number (min: 1)."),
      endPage: z
        .number()
        .nullable()
        .describe(
          "The end page number. Return all pages starting from startPage, if null.",
        ),
      // previewCharsPerPage: z
      //   .number()
      //   .max(2000)
      //   .optional()
      //   .describe(
      //     "Maximum number of characters to read from each page for preview. Return all characters if undefined.",
      //   ),
    }),
    execute: async ({ pdfId, startPage, endPage }) => {
      const conditions = [
        eq(pdfIndexingTable.pdfId, pdfId),
        eq(pdfIndexingTable.type, "page"),
        gte(pdfIndexingTable.startPage, startPage),
      ];

      if (endPage !== null) {
        conditions.push(lte(pdfIndexingTable.endPage, endPage));
      }

      const items = await db.query.pdfIndexingTable.findMany({
        where: and(...conditions),
        orderBy: [asc(pdfIndexingTable.startPage)],
      });

      if (items.length === 0) {
        return "No text found";
      }

      const text = items.map((item) => item.content).join("\n\n");
      // .map((item) =>
      //   previewCharsPerPage != null
      //     ? item.content.slice(0, previewCharsPerPage)
      //     : item.content,
      // )
      return text;
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
