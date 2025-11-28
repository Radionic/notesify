import { generateId } from "ai";
import { eq } from "drizzle-orm";
import { type Notes, notesTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";

export const getNotesForPdf = async ({ pdfId }: { pdfId: string }) => {
  const db = await getDB();
  const notes = await db.query.notesTable.findFirst({
    where: eq(notesTable.pdfId, pdfId),
  });
  return notes || (await createNotes({ pdfId }));
};

export const getNotes = async ({ notesId }: { notesId: string }) => {
  const db = await getDB();
  return await db.query.notesTable.findFirst({
    where: eq(notesTable.id, notesId),
  });
};

export const createNotes = async ({ pdfId }: { pdfId: string }) => {
  const notesId = generateId();
  const newNotes = {
    id: notesId,
    pdfId,
    title: "",
    content: JSON.stringify([
      {
        children: [{ text: "" }],
        type: "h1",
      },
      {
        children: [{ text: "" }],
        type: "p",
      },
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Notes;

  const db = await getDB();
  await db.insert(notesTable).values(newNotes).onConflictDoUpdate({
    target: notesTable.id,
    set: newNotes,
  });
  return newNotes;
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
