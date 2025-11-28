import { eq } from "drizzle-orm";
import { type Highlight, highlightsTable } from "@/db/schema/pdf/highlights";
import { getDB } from "@/db/sqlite";
import { generateId } from "../id";

export const getHighlight = async ({ id }: { id: string }) => {
  const db = await getDB();
  const highlight = await db.query.highlightsTable.findFirst({
    where: eq(highlightsTable.id, id),
  });
  return highlight ?? null;
};

export const getHighlights = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  const highlights = await db.query.highlightsTable.findMany({
    where: eq(highlightsTable.pdfId, pdfId),
  });
  return highlights;
};

export const addHighlight = async ({
  highlight,
}: {
  highlight: Omit<Highlight, "id">;
}) => {
  const db = await getDB();
  const newHighlight: Highlight = {
    id: generateId(),
    ...highlight,
  };
  await db.insert(highlightsTable).values(newHighlight);
  return newHighlight.id;
};

export const updateHighlight = async ({
  id,
  color,
  text,
}: {
  id: string;
  color?: string;
  text?: string;
}) => {
  const db = await getDB();
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
};

export const deleteHighlight = async ({ id }: { id: string }) => {
  const db = await getDB();
  await db.delete(highlightsTable).where(eq(highlightsTable.id, id));
};
