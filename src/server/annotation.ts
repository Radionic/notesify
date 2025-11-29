import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type Annotation, annotationsTable } from "@/db/schema";

const getAnnotationSchema = z.object({
  id: z.string(),
});

export const getAnnotationFn = createServerFn()
  .inputValidator(getAnnotationSchema)
  .handler(async ({ data }) => {
    const annotation = await db.query.annotationsTable.findFirst({
      where: eq(annotationsTable.id, data.id),
    });
    return annotation ?? null;
  });

const getAnnotationsSchema = z.object({
  pdfId: z.string(),
});

export const getAnnotationsFn = createServerFn()
  .inputValidator(getAnnotationsSchema)
  .handler(async ({ data }) => {
    const annotations = await db.query.annotationsTable.findMany({
      where: eq(annotationsTable.pdfId, data.pdfId),
    });
    return annotations;
  });

const createAnnotationsSchema = z.object({
  annotations: z.array(z.any()),
});

export const createAnnotationsFn = createServerFn()
  .inputValidator(createAnnotationsSchema)
  .handler(async ({ data }) => {
    await db.insert(annotationsTable).values(data.annotations as Annotation[]);
  });

const deleteAnnotationSchema = z.object({
  id: z.string(),
});

export const deleteAnnotationFn = createServerFn()
  .inputValidator(deleteAnnotationSchema)
  .handler(async ({ data }) => {
    await db.delete(annotationsTable).where(eq(annotationsTable.id, data.id));
  });

const deleteAnnotationsSchema = z.object({
  ids: z.array(z.string()),
});

export const deleteAnnotationsFn = createServerFn()
  .inputValidator(deleteAnnotationsSchema)
  .handler(async ({ data }) => {
    if (data.ids.length === 0) return;

    for (const id of data.ids) {
      await db.delete(annotationsTable).where(eq(annotationsTable.id, id));
    }
  });
