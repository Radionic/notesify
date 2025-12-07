import { generateObject, tool } from "ai";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { evaluate } from "mathjs";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable, pdfsTable } from "@/db/schema";
import { aiProvider } from "@/lib/ai/provider";
import { generateId } from "@/lib/id";
import { getFileFromStorage } from "@/lib/storage";
import { upsertText } from "./vectorize";

export const tools = ({ userId }: { userId: string }) => ({
  getTableOfContents: tool({
    description: "Get the overview (table of contents) of a PDF.",
    inputSchema: z.object({
      pdfId: z
        .string()
        .describe("The PDF ID to generate the table of contents for."),
    }),
    execute: async ({ pdfId }) => {
      // Get table of contents from database if any
      const existingSections = await db.query.pdfIndexingTable.findMany({
        where: and(
          eq(pdfIndexingTable.pdfId, pdfId),
          eq(pdfIndexingTable.type, "section"),
        ),
        orderBy: [asc(pdfIndexingTable.startPage)],
      });

      if (existingSections.length > 0) {
        return existingSections;
      }

      // Generate table of contents
      if (!process.env.PDF_TOC_MODEL_ID) {
        throw Error("PDF_TOC_MODEL_ID not set");
      }

      const pdf = await db.query.pdfsTable.findFirst({
        columns: {
          pageCount: true,
        },
        where: eq(pdfsTable.id, pdfId),
      });

      const totalPages = pdf?.pageCount ?? 0;
      if (totalPages <= 0) {
        throw Error("totalPages not found");
      }

      const imageContents = (
        await Promise.all(
          Array.from({ length: totalPages }, async (_, index) => {
            const pageNumber = index + 1;
            const filename = `p-${pageNumber}.jpg`;

            const body = await getFileFromStorage({
              type: "pdf-images",
              userId,
              filename,
              subfolders: [pdfId],
            });

            if (!body) return null;

            const arrayBuffer = await new Response(body).arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");

            return {
              type: "image" as const,
              image: base64,
            };
          }),
        )
      ).filter(
        (item): item is { type: "image"; image: string } => item !== null,
      );

      const { object } = await generateObject({
        model: aiProvider.chatModel(process.env.PDF_TOC_MODEL_ID),
        schema: z.array(
          z.object({
            startPage: z.number().int().min(1),
            endPage: z.number().int().max(totalPages),
            title: z.string(),
            summary: z.string(),
          }),
        ),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "You are given the page images of a PDF. " +
                  `The document has ${totalPages} pages. ` +
                  "Your task is to identify the main logical sections and then generate a clear table of contents for this document. " +
                  "If the document already has clear sections/headers, use them as section titles. Otherwise, infer short, descriptive titles from the content. " +
                  "For each section, return: startPage, endPage, title, and a section summary. Pages may overlap between sections.",
              },
              ...imageContents,
            ],
          },
        ],
      });

      // Cache generated sections into pdfIndexingTable and upsert embeddings
      if (Array.isArray(object) && object.length > 0) {
        const sectionItems = object.map((section) => ({
          id: generateId(),
          pdfId,
          type: "section" as const,
          startPage: section.startPage,
          endPage: section.endPage,
          title: section.title,
          content: section.summary,
        }));

        await Promise.all([
          db.insert(pdfIndexingTable).values(sectionItems),
          upsertText(
            sectionItems.map((item) => {
              const combinedText = [item.title, item.content]
                .filter((part): part is string => !!part && part.length > 0)
                .join("\n\n");

              return {
                id: item.id,
                text: combinedText,
                metadata: {
                  userId,
                  pdfId: item.pdfId,
                  type: "section" as const,
                  text: `${item.title}\n${item.content}`,
                  startPage: item.startPage,
                  endPage: item.endPage,
                },
              };
            }),
          ),
        ]);
      }

      return object.map(({ summary, ...rest }) => ({
        ...rest,
        content: summary,
      }));
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
