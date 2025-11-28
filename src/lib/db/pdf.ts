import { eq } from "drizzle-orm";
import {
  type IndexedPDFPage,
  type ParsedPDFPage,
  type Pdf,
  pdfIndexingTable,
  pdfParsingTable,
  pdfsTable,
  type ScrollPosition,
} from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { generateId } from "@/lib/id";
import { addFile } from "./file-system";

export const getPdf = async (id: string) => {
  const db = await getDB();
  const pdf = await db.query.pdfsTable.findFirst({
    where: eq(pdfsTable.id, id),
  });
  return pdf ?? null;
};

export const addPdf = async ({ name }: { name: string }) => {
  const id = generateId();
  const db = await getDB();
  const newPdf = {
    id,
    pageCount: 0,
    scroll: { x: 0, y: 0 },
    zoom: 1,
  };
  const newFile = await addFile({ name, parentId: null, pdfId: id });
  await db.insert(pdfsTable).values(newPdf);
  return { newPdf, newFile };
};

export const updatePdf = async ({
  id,
  pageCount,
  scroll,
  zoom,
}: {
  id: string;
  pageCount?: number;
  scroll?: ScrollPosition;
  zoom?: number;
}) => {
  const db = await getDB();
  const updateValues: Partial<Pdf> = {};

  if (pageCount !== undefined) updateValues.pageCount = pageCount;
  if (scroll !== undefined) updateValues.scroll = scroll;
  if (zoom !== undefined) updateValues.zoom = zoom;

  if (Object.keys(updateValues).length > 0) {
    await db.update(pdfsTable).set(updateValues).where(eq(pdfsTable.id, id));
  }
  return updateValues;
};

export const getParsedPdf = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  return await db.query.pdfParsingTable.findMany({
    where: eq(pdfParsingTable.pdfId, pdfId),
    orderBy: (pdfParsing, { asc }) => [asc(pdfParsing.page)],
  });
};

export const addParsedPdf = async ({
  parsedPdf,
}: {
  parsedPdf: ParsedPDFPage[];
}) => {
  const db = await getDB();
  await db.insert(pdfParsingTable).values(parsedPdf);
};

export const removeParsedPdf = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  await db.delete(pdfParsingTable).where(eq(pdfParsingTable.pdfId, pdfId));
};

export const getIndexedPdf = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  return await db.query.pdfIndexingTable.findMany({
    where: eq(pdfIndexingTable.pdfId, pdfId),
    orderBy: (pdfIndexing, { asc }) => [asc(pdfIndexing.startPage)],
  });
};

export const addIndexedPdf = async ({
  indexedPdf,
}: {
  indexedPdf: IndexedPDFPage;
}) => {
  const db = await getDB();
  await db.insert(pdfIndexingTable).values(indexedPdf);
};

export const removeIndexedPdf = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  await db.delete(pdfIndexingTable).where(eq(pdfIndexingTable.pdfId, pdfId));
};
