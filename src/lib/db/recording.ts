import { Recording, recordingsTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";

export const getRecordings = async () => {
  const db = await getDB();
  return await db.query.recordingsTable.findMany({
    orderBy: (recordings, { desc }) => [desc(recordings.createdAt)],
  });
};

export const getRecording = async ({ id }: { id: string }) => {
  const db = await getDB();
  const result = await db.query.recordingsTable.findFirst({
    where: (recordings) => eq(recordings.id, id),
  });
  return result;
};

export const addRecording = async ({ recording }: { recording: Recording }) => {
  const db = await getDB();
  await db.insert(recordingsTable).values(recording);
};

export const removeRecording = async ({ id }: { id: string }) => {
  const db = await getDB();
  await db.delete(recordingsTable).where(eq(recordingsTable.id, id));
};

export const updateRecording = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const db = await getDB();
  await db
    .update(recordingsTable)
    .set({ name })
    .where(eq(recordingsTable.id, id));
};
