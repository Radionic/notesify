import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  type FileNode,
  filesTable,
  type IndexedPDFPage,
  type ParsedPDFPage,
  type Pdf,
  pdfIndexingTable,
  pdfParsingTable,
  pdfsTable,
  type ScrollPosition,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/id";

const getPdfSchema = z.object({
  id: z.string(),
});

export const getPdfFn = createServerFn()
  .inputValidator(getPdfSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const file = await db.query.filesTable.findFirst({
      where: and(
        eq(filesTable.id, data.id),
        eq(filesTable.userId, session.user.id),
      ),
    });

    if (!file) {
      return null;
    }

    const pdf = await db.query.pdfsTable.findFirst({
      where: eq(pdfsTable.id, data.id),
    });
    return pdf ?? null;
  });

const addPdfSchema = z.object({
  name: z.string(),
  parentId: z.string().nullable(),
});

export const addPdfFn = createServerFn()
  .inputValidator(addPdfSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const id = generateId();
    const newPdf: Pdf = {
      id,
      pageCount: 0,
      scroll: { x: 0, y: 0 },
      zoom: 1,
    };
    const newFile: FileNode = {
      id,
      name: data.name,
      type: "pdf",
      parentId: data.parentId,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(filesTable).values(newFile);
    await db.insert(pdfsTable).values(newPdf);
    return { newPdf, newFile };
  });

const updatePdfSchema = z.object({
  id: z.string(),
  pageCount: z.number().optional(),
  scroll: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  zoom: z.number().optional(),
});

export const updatePdfFn = createServerFn()
  .inputValidator(updatePdfSchema)
  .handler(async ({ data }) => {
    const { id, pageCount, scroll, zoom } = data;
    const updateValues: Partial<Pdf> = {};

    if (pageCount !== undefined) updateValues.pageCount = pageCount;
    if (scroll !== undefined) updateValues.scroll = scroll as ScrollPosition;
    if (zoom !== undefined) updateValues.zoom = zoom;

    if (Object.keys(updateValues).length > 0) {
      await db.update(pdfsTable).set(updateValues).where(eq(pdfsTable.id, id));
    }
    return updateValues;
  });

const getParsedPdfSchema = z.object({
  pdfId: z.string(),
});

export const getParsedPdfFn = createServerFn()
  .inputValidator(getParsedPdfSchema)
  .handler(async ({ data }) => {
    return await db.query.pdfParsingTable.findMany({
      where: eq(pdfParsingTable.pdfId, data.pdfId),
      orderBy: (pdfParsing, { asc }) => [asc(pdfParsing.page)],
    });
  });

const addParsedPdfSchema = z.object({
  parsedPdf: z.array(z.any()),
});

export const addParsedPdfFn = createServerFn()
  .inputValidator(addParsedPdfSchema)
  .handler(async ({ data }) => {
    await db.insert(pdfParsingTable).values(data.parsedPdf as ParsedPDFPage[]);
  });

const removeParsedPdfSchema = z.object({
  pdfId: z.string(),
});

export const removeParsedPdfFn = createServerFn()
  .inputValidator(removeParsedPdfSchema)
  .handler(async ({ data }) => {
    await db
      .delete(pdfParsingTable)
      .where(eq(pdfParsingTable.pdfId, data.pdfId));
  });

const getIndexedPdfSchema = z.object({
  pdfId: z.string(),
});

export const getIndexedPdfFn = createServerFn()
  .inputValidator(getIndexedPdfSchema)
  .handler(async ({ data }) => {
    return await db.query.pdfIndexingTable.findMany({
      where: eq(pdfIndexingTable.pdfId, data.pdfId),
      orderBy: (pdfIndexing, { asc }) => [asc(pdfIndexing.startPage)],
    });
  });

const addIndexedPdfSchema = z.object({
  indexedPdf: z.any(),
});

export const addIndexedPdfFn = createServerFn()
  .inputValidator(addIndexedPdfSchema)
  .handler(async ({ data }) => {
    await db.insert(pdfIndexingTable).values(data.indexedPdf as IndexedPDFPage);
  });

const removeIndexedPdfSchema = z.object({
  pdfId: z.string(),
});

export const removeIndexedPdfFn = createServerFn()
  .inputValidator(removeIndexedPdfSchema)
  .handler(async ({ data }) => {
    await db
      .delete(pdfIndexingTable)
      .where(eq(pdfIndexingTable.pdfId, data.pdfId));
  });
