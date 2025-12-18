import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { modelsTable } from "@/db/schema";

export const getModelById = async ({
  id,
  internal,
}: {
  id: string;
  internal?: boolean;
}) => {
  const model = await db.query.modelsTable.findFirst({
    columns: {
      id: true,
      modelId: true,
      providerOptions: true,
    },
    where: internal
      ? eq(modelsTable.id, id)
      : and(eq(modelsTable.id, id), ne(modelsTable.scope, "internal")),
  });

  if (!model) {
    throw new Error(`Invalid model id: ${id}, internal: ${internal}`);
  }

  return {
    ...model,
    providerOptions: model.providerOptions ?? undefined,
  };
};
