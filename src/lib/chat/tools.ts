import { tool } from "ai";
import { z } from "zod";

export const tools = {
  calculate: tool({
    description: "Calculate a Math expression, using evaluate by MathJS",
    parameters: z.object({
      expression: z.string().describe("The expression to calculate"),
    }),
  }),
  getPDFPageText: tool({
    description: "Get the text of PDF pages",
    parameters: z.object({
      pdfId: z.string().describe("The PDF ID"),
      startPage: z.number().describe("The start page number (min: 1)"),
      endPage: z.number().describe("The end page number (min: 1)"),
    }),
  }),
  searchPages: tool({
    description: "Search relevant PDF pages for the given query",
    parameters: z.object({
      pdfId: z.string().describe("The PDF ID"),
      query: z
        .string()
        .describe("The query to search for, in a short sentence"),
    }),
  }),
  // searchText: tool({
  //   description: "Search keywords in a PDF and return corresponding page texts",
  //   parameters: z.object({
  //     pdfId: z.string().describe("The PDF ID"),
  //     texts: z
  //       .string()
  //       .array()
  //       .describe(
  //         "A list of keywords to search. Do not use complete sentences."
  //       ),
  //   }),
  // }),
};

export type CalculateParameters = z.infer<typeof tools.calculate.parameters>;
export type GetPDFPageTextParameters = z.infer<
  typeof tools.getPDFPageText.parameters
>;
export type SearchPagesParameters = z.infer<
  typeof tools.searchPages.parameters
>;
