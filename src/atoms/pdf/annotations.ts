import { atomFamily, atomWithDefault } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import { getDB } from "@/db/sqlite";
import { Annotation, annotationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const annotationAtomFamily = atomFamily((id: string) =>
  atomWithStorage<Annotation | null>(
    `annotations-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        // console.log("Getting annotation", id);
        const db = await getDB();
        const value = await db.query.annotationsTable.findFirst({
          where: eq(annotationsTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(annotationsTable).values(value).onConflictDoUpdate({
          target: annotationsTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(annotationsTable).where(eq(annotationsTable.id, id));
      },
    },
    {
      getOnInit: true,
    }
  )
);

export const annotationsAtomFamily = atomFamily((pdfId?: string) =>
  atomWithDefault(async (get) => {
    if (!pdfId) {
      return [];
    }
    const db = await getDB();
    const annos = await db.query.annotationsTable.findMany({
      where: eq(annotationsTable.pdfId, pdfId),
    });
    return annos;
  })
);
