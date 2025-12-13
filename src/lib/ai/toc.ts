import { generateObject, NoObjectGeneratedError } from "ai";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pdfIndexingTable, pdfsTable } from "@/db/schema";
import { aiProvider } from "@/lib/ai/provider";
import { generateId } from "@/lib/id";
import { getFileFromStorage } from "@/lib/storage";
import { upsertText } from "./vectorize";

export const extractToC = async ({
  pdfId,
  userId,
  pagesPerBatch = 25,
}: {
  pdfId: string;
  userId: string;
  pagesPerBatch?: number;
}) => {
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

  if (!pdf) {
    throw Error("pdf not found, check if pdf id is correct");
  }

  const totalPages = pdf.pageCount;
  if (!totalPages || totalPages <= 0) {
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
  ).filter((item): item is { type: "image"; image: string } => item !== null);

  try {
    const sectionSchema = z.object({
      startPage: z.number().int().min(1),
      endPage: z
        .number()
        .int()
        .max(totalPages)
        .describe(
          "The end page must be less than or equal to the total number of pages.",
        ),
      title: z.string(),
      summary: z.string().describe("Detailed section summary in 1 paragraph."),
    });

    const batchSchema = z.object({
      replaceLastSection: z.boolean().optional().default(false),
      sections: z.array(sectionSchema),
    });

    type TocSection = z.infer<typeof sectionSchema>;

    const allSections: TocSection[] = [];

    for (
      let startPage = 1;
      startPage <= totalPages;
      startPage += pagesPerBatch
    ) {
      const endPage = Math.min(startPage + pagesPerBatch - 1, totalPages);
      const batchImages = imageContents.slice(startPage - 1, endPage);

      const previousSectionsText =
        allSections.length === 0
          ? "There are no previously identified sections yet."
          : `Previously identified sections so far:\n${allSections
              .map(
                (section) =>
                  `- Pages ${section.startPage}-${section.endPage}: ${section.title} — ${section.summary}`,
              )
              .join("\n")}`;

      const instruction =
        `You are given the page images of a PDF. The PDF has ${totalPages} pages. Each image is a page of the PDF in reading order. ` +
        `You are now processing pages ${startPage} to ${endPage} (inclusive). ` +
        "Your task is to identify the logical sections and then generate a clear table of contents for this PDF in its original language. " +
        "If there are crucial figures/images/tables, breifly describe them in the summary. " +
        "If the document already has clear sections/headers, use them as section titles. Otherwise, infer short, descriptive titles from the content. " +
        "Pages may overlap between sections. " +
        "Use the previously identified sections as context to keep the overall structure consistent. " +
        "If the first section you generate for the current pages is actually a continuation or refinement of the last previously identified section, set replaceLastSection to true and return the fully merged last section as the first item in sections. " +
        "Otherwise, set replaceLastSection to false. " +
        "Return JSON in this format: { replaceLastSection: boolean, sections: [{ startPage: number, endPage: number, title: string, summary: string }, ...] }.";

      const { object } = await generateObject({
        model: aiProvider.chatModel(process.env.PDF_TOC_MODEL_ID),
        schema: batchSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${instruction}\n\n${previousSectionsText}`,
              },
              ...batchImages,
            ],
          },
        ],
      });

      // console.log("object", object);

      const { replaceLastSection = false, sections } = object;

      let batchSections = sections;

      if (
        replaceLastSection &&
        allSections.length > 0 &&
        batchSections.length > 0
      ) {
        allSections[allSections.length - 1] = batchSections[0];
        batchSections = batchSections.slice(1);
      }

      allSections.push(...batchSections);
    }

    return allSections.map(({ summary, ...rest }) => ({
      ...rest,
      content: summary,
    }));
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.log("NoObjectGeneratedError");
      console.log("Cause:", error.cause);
      console.log("Text:", error.text);
    }
    throw error;
  }
};

export const getOrExtractToC = async ({
  pdfId,
  userId,
}: {
  pdfId: string;
  userId: string;
}) => {
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

  const extractedSections = await extractToC({ pdfId, userId });

  if (extractedSections.length > 0) {
    const sectionItems = extractedSections.map((section) => ({
      id: generateId(),
      pdfId,
      type: "section" as const,
      ...section,
    }));

    await Promise.all([
      db.insert(pdfIndexingTable).values(sectionItems),
      upsertText(
        sectionItems.map((item) => {
          const combinedText = [item.title, item.content]
            .filter((part) => !!part && part.length > 0)
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

  return extractedSections;
};
