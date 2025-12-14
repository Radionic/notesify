import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { modelsTable } from "@/db/schema";

export const getModelById = async (modelId: string) =>
  db.query.modelsTable.findFirst({
    columns: {
      id: true,
    },
    where: and(eq(modelsTable.id, modelId), ne(modelsTable.scope, "internal")),
  });
