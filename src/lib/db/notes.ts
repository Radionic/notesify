import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";
import { notesTable, Notes } from "@/db/schema";

export const getNotesForPdf = async (pdfId: string) => {
  const db = await getDB();
  const notes = await db.query.notesTable.findFirst({
    where: eq(notesTable.pdfId, pdfId),
  });
  return notes?.id;
};

export const getNotes = async ({ notesId }: { notesId: string }) => {
  const db = await getDB();
  return await db.query.notesTable.findFirst({
    where: eq(notesTable.id, notesId),
  });
};

export const addNotes = async ({ notes }: { notes: Notes }) => {
  const db = await getDB();
  await db.insert(notesTable).values(notes).onConflictDoUpdate({
    target: notesTable.id,
    set: notes,
  });
};

export const updateNotes = async ({
  notesId,
  content,
}: {
  notesId: string;
  content: any;
}) => {
  const db = await getDB();
  await db
    .update(notesTable)
    .set({ content })
    .where(eq(notesTable.id, notesId));
};

export const removeNotes = async ({ notesId }: { notesId: string }) => {
  const db = await getDB();
  await db.delete(notesTable).where(eq(notesTable.id, notesId));
};
