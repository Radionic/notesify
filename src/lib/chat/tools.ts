import { type LanguageModelV1, tool } from "ai";
import { evaluate } from "mathjs";
import { z } from "zod";
import { searchPages } from "../pdf/indexing";
import { getPdfTexts } from "../pdf/parsing";

export const tools = (model: LanguageModelV1) => ({
  calculate: tool({
    description: "Calculate a Math expression, using evaluate by MathJS",
    parameters: z.object({
      expression: z.string().describe("The expression to calculate"),
    }),
    execute: async ({ expression }) => {
      const result = await evaluate(expression);
      console.log("calculate result", expression, result);
      return result;
    },
  }),
  getPDFPageText: tool({
    description: "Get the text of PDF pages",
    parameters: z.object({
      pdfId: z.string().describe("The PDF ID"),
      startPage: z.number().describe("The start page number (min: 1)"),
      endPage: z.number().describe("The end page number (min: 1)"),
    }),
    execute: async ({ pdfId, startPage, endPage }) => {
      console.log("getPDFPageText", { pdfId, startPage, endPage });
      const text = await getPdfTexts({
        pdfId,
        startPage,
        endPage,
      });
      console.log("getPDFPageText result", text);
      return text || "No text found";
    },
  }),
  searchPages: tool({
    description: "Search relevant PDF pages for the given query",
    parameters: z.object({
      pdfId: z.string().describe("The PDF ID"),
      query: z
        .string()
        .describe("The query to search for, in a short sentence"),
    }),
    execute: async ({ pdfId, query }) => {
      const result = await searchPages({ model, pdfId, query });
      console.log("searchPages result", result);
      return result;
    },
  }),
});
