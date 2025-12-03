import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type Recording, recordingsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

const getRecordingsSchema = z.object({});

export const getRecordingsFn = createServerFn()
  .inputValidator(getRecordingsSchema)
  .handler(async () => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return await db.query.recordingsTable.findMany({
      where: (recordings) => eq(recordings.userId, session.user.id),
      orderBy: (recordings, { desc }) => [desc(recordings.createdAt)],
    });
  });

const getRecordingSchema = z.object({
  id: z.string(),
});

export const getRecordingFn = createServerFn()
  .inputValidator(getRecordingSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const result = await db.query.recordingsTable.findFirst({
      where: (recordings) =>
        and(eq(recordings.id, data.id), eq(recordings.userId, session.user.id)),
    });
    return result;
  });

const addRecordingSchema = z.object({
  recording: z.any(),
});

export const addRecordingFn = createServerFn()
  .inputValidator(addRecordingSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db.insert(recordingsTable).values({
      ...(data.recording as Recording),
      userId: session.user.id,
    });
  });

const removeRecordingSchema = z.object({
  id: z.string(),
});

export const removeRecordingFn = createServerFn()
  .inputValidator(removeRecordingSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(recordingsTable)
      .where(
        and(
          eq(recordingsTable.id, data.id),
          eq(recordingsTable.userId, session.user.id),
        ),
      );
  });

const updateRecordingSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const updateRecordingFn = createServerFn()
  .inputValidator(updateRecordingSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(recordingsTable)
      .set({ name: data.name })
      .where(
        and(
          eq(recordingsTable.id, data.id),
          eq(recordingsTable.userId, session.user.id),
        ),
      );
  });
