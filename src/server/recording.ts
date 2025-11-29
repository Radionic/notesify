import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type Recording, recordingsTable } from "@/db/schema";

const getRecordingsSchema = z.object({});

export const getRecordingsFn = createServerFn()
  .inputValidator(getRecordingsSchema)
  .handler(async () => {
    return await db.query.recordingsTable.findMany({
      orderBy: (recordings, { desc }) => [desc(recordings.createdAt)],
    });
  });

const getRecordingSchema = z.object({
  id: z.string(),
});

export const getRecordingFn = createServerFn()
  .inputValidator(getRecordingSchema)
  .handler(async ({ data }) => {
    const result = await db.query.recordingsTable.findFirst({
      where: (recordings) => eq(recordings.id, data.id),
    });
    return result;
  });

const addRecordingSchema = z.object({
  recording: z.any(),
});

export const addRecordingFn = createServerFn()
  .inputValidator(addRecordingSchema)
  .handler(async ({ data }) => {
    await db
      .insert(recordingsTable)
      .values(data.recording as Recording);
  });

const removeRecordingSchema = z.object({
  id: z.string(),
});

export const removeRecordingFn = createServerFn()
  .inputValidator(removeRecordingSchema)
  .handler(async ({ data }) => {
    await db.delete(recordingsTable).where(eq(recordingsTable.id, data.id));
  });

const updateRecordingSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const updateRecordingFn = createServerFn()
  .inputValidator(updateRecordingSchema)
  .handler(async ({ data }) => {
    await db
      .update(recordingsTable)
      .set({ name: data.name })
      .where(eq(recordingsTable.id, data.id));
  });
