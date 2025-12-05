import { tool } from "ai";
import { inArray } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfsTable } from "@/db/schema";

export const tools = ({
  openedPdfIds,
  pdfId,
  viewingPage,
}: {
  openedPdfIds: string[];
  pdfId: string;
  viewingPage: number;
}) => ({
  calculate: tool({
    description: "Calculate a Math expression, using evaluate by MathJS.",
    inputSchema: z.object({
      expression: z.string().describe("The expression to calculate"),
    }),
    execute: async ({ expression }) => {
      return await evaluate(expression);
    },
  }),
  getViewingPdfMetadata: tool({
    description:
      "Get the currently viewing PDF metadata, including pdf id, name, viewing page, total pages.",
    inputSchema: z.object({}),
    execute: async () => {
      if (openedPdfIds.length === 0) {
        return "No PDFs opened";
      }

      const openedPdfs = await db.query.pdfsTable.findMany({
        with: {
          file: {
            columns: {
              name: true,
            },
          },
        },
        where: inArray(pdfsTable.id, openedPdfIds),
      });

      const openedPdfsContext = openedPdfs
        .map(
          (pdf) =>
            `{ name: "${pdf.file.name}", id: "${pdf.id}", totalPages: ${pdf.pageCount} }`,
        )
        .join(", ");
      const viewingPdfName = openedPdfs.find((pdf) => pdf.id === pdfId)?.file
        .name;
      const text = `The user is currently viewing page ${viewingPage} of "${viewingPdfName}". All opened PDFs info: ${openedPdfsContext}`;
      return text;
    },
  }),
  // getPDFPageText: tool({
  //   description: "Get the text of PDF pages",
  //   inputSchema: z.object({
  //     pdfId: z.string().describe("The PDF ID"),
  //     startPage: z.number().describe("The start page number (min: 1)"),
  //     endPage: z.number().describe("The end page number (min: 1)"),
  //   }),
  //   execute: async ({ pdfId, startPage, endPage }) => {
  //     console.log("getPDFPageText", { pdfId, startPage, endPage });
  //     const text = await getPdfTexts({
  //       pdfId,
  //       startPage,
  //       endPage,
  //     });
  //     console.log("getPDFPageText result", text);
  //     return text || "No text found";
  //   },
  // }),
  // searchPages: tool({
  //   description: "Search relevant PDF pages for the given query",
  //   inputSchema: z.object({
  //     pdfId: z.string().describe("The PDF ID"),
  //     query: z
  //       .string()
  //       .describe("The query to search for, in a short sentence"),
  //   }),
  //   execute: async ({ pdfId, query }) => {
  //     const result = await searchPages({ model, pdfId, query });
  //     console.log("searchPages result", result);
  //     return result;
  //   },
  // }),
});
