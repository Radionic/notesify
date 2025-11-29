import { createServerFn } from "@tanstack/react-start";
import { generateId } from "ai";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type Notes, notesTable } from "@/db/schema";

const getNotesForPdfSchema = z.object({
  pdfId: z.string(),
});

export const getNotesForPdfFn = createServerFn()
  .inputValidator(getNotesForPdfSchema)
  .handler(async ({ data }) => {
    const notes = await db.query.notesTable.findFirst({
      where: eq(notesTable.pdfId, data.pdfId),
    });
    return notes || (await createNotes({ pdfId: data.pdfId }));
  });

const getNotesSchema = z.object({
  notesId: z.string(),
});

export const getNotesFn = createServerFn()
  .inputValidator(getNotesSchema)
  .handler(async ({ data }) => {
    return await db.query.notesTable.findFirst({
      where: eq(notesTable.id, data.notesId),
    });
  });

const createNotesSchema = z.object({
  pdfId: z.string(),
});

export const createNotesFn = createServerFn()
  .inputValidator(createNotesSchema)
  .handler(async ({ data }) => {
    return await createNotes({ pdfId: data.pdfId });
  });

const updateNotesSchema = z.object({
  notesId: z.string(),
  content: z.any(),
});

export const updateNotesFn = createServerFn()
  .inputValidator(updateNotesSchema)
  .handler(async ({ data }) => {
    await db
      .update(notesTable)
      .set({ content: data.content })
      .where(eq(notesTable.id, data.notesId));
  });

const removeNotesSchema = z.object({
  notesId: z.string(),
});

export const removeNotesFn = createServerFn()
  .inputValidator(removeNotesSchema)
  .handler(async ({ data }) => {
    await db.delete(notesTable).where(eq(notesTable.id, data.notesId));
  });

async function createNotes({ pdfId }: { pdfId: string }) {
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

  await db.insert(notesTable).values(newNotes).onConflictDoUpdate({
    target: notesTable.id,
    set: newNotes,
  });
  return newNotes;
}
