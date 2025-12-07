import { tool } from "ai";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable } from "@/db/schema";
import { queryText } from "./vectorize";

export const tools = ({ userId }: { userId: string }) => ({
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
      previewCharsPerPage: z
        .number()
        .max(2000)
        .optional()
        .describe(
          "Maximum number of characters to read from each page for preview. Return all characters if undefined.",
        ),
    }),
    execute: async ({ pdfId, startPage, endPage, previewCharsPerPage }) => {
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

      const text = items
        .map((item) =>
          previewCharsPerPage != null
            ? item.text.slice(0, previewCharsPerPage)
            : item.text,
        )
        .join("\n\n");
      return text;
    },
  }),
  searchPages: tool({
    description: "Search relevant PDF pages for the given query",
    inputSchema: z.object({
      pdfId: z.string().describe("The PDF ID"),
      query: z
        .string()
        .describe(
          "The query to search for. Must be detailed and specific, and in question format.",
        ),
    }),
    execute: async ({ pdfId, query }) => {
      const result = await queryText(query, {
        topK: 5,
        filter: { pdfId, userId },
        returnMetadata: "all",
        // https://developers.cloudflare.com/vectorize/best-practices/query-vectors/#control-over-scoring-precision-and-query-accuracy
        returnValues: true,
      });
      return result
        .filter(({ score }) => score >= 0.5)
        .map(({ metadata }) => ({
          page: metadata?.startPage,
          text: metadata?.text,
        }));
    },
  }),
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
