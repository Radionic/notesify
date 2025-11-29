import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type Highlight, highlightsTable } from "@/db/schema";
import { generateId } from "@/lib/id";

const getHighlightSchema = z.object({
  id: z.string(),
});

export const getHighlightFn = createServerFn()
  .inputValidator(getHighlightSchema)
  .handler(async ({ data }) => {
    const highlight = await db.query.highlightsTable.findFirst({
      where: eq(highlightsTable.id, data.id),
    });
    return highlight ?? null;
  });

const getHighlightsSchema = z.object({
  pdfId: z.string(),
});

export const getHighlightsFn = createServerFn()
  .inputValidator(getHighlightsSchema)
  .handler(async ({ data }) => {
    const highlights = await db.query.highlightsTable.findMany({
      where: eq(highlightsTable.pdfId, data.pdfId),
    });
    return highlights;
  });

const addHighlightSchema = z.object({
  highlight: z.any(),
});

export const addHighlightFn = createServerFn()
  .inputValidator(addHighlightSchema)
  .handler(async ({ data }) => {
    const newHighlight: Highlight = {
      id: generateId(),
      ...(data.highlight as Omit<Highlight, "id">),
    };
    await db.insert(highlightsTable).values(newHighlight);
    return newHighlight.id;
  });

const updateHighlightSchema = z.object({
  id: z.string(),
  color: z.string().optional(),
  text: z.string().optional(),
});

export const updateHighlightFn = createServerFn()
  .inputValidator(updateHighlightSchema)
  .handler(async ({ data }) => {
    const { id, color, text } = data;
    const updateValues: Partial<Highlight> = {};

    if (color !== undefined) updateValues.color = color;
    if (text !== undefined) updateValues.text = text;

    if (Object.keys(updateValues).length > 0) {
      await db
        .update(highlightsTable)
        .set(updateValues)
        .where(eq(highlightsTable.id, id));
    }
    return updateValues;
  });

const deleteHighlightSchema = z.object({
  id: z.string(),
});

export const deleteHighlightFn = createServerFn()
  .inputValidator(deleteHighlightSchema)
  .handler(async ({ data }) => {
    await db.delete(highlightsTable).where(eq(highlightsTable.id, data.id));
  });
