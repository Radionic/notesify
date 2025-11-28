import { eq } from "drizzle-orm";
import { type Annotation, annotationsTable } from "@/db/schema/pdf/annotations";
import { getDB } from "@/db/sqlite";

export const getAnnotation = async (id: string) => {
  const db = await getDB();
  const annotation = await db.query.annotationsTable.findFirst({
    where: eq(annotationsTable.id, id),
  });
  return annotation ?? null;
};

export const getAnnotations = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  const annotations = await db.query.annotationsTable.findMany({
    where: eq(annotationsTable.pdfId, pdfId),
  });
  return annotations;
};

export const createAnnotations = async ({
  annotations,
}: {
  annotations: Annotation[];
}) => {
  const db = await getDB();
  await db.insert(annotationsTable).values(annotations);
};

export const deleteAnnotation = async ({ id }: { id: string }) => {
  const db = await getDB();
  await db.delete(annotationsTable).where(eq(annotationsTable.id, id));
};

export const deleteAnnotations = async ({ ids }: { ids: string[] }) => {
  if (ids.length === 0) return;

  const db = await getDB();
  for (const id of ids) {
    await db.delete(annotationsTable).where(eq(annotationsTable.id, id));
  }
};
