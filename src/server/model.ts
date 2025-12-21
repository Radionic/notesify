import { createServerFn } from "@tanstack/react-start";
import { and, eq, getTableColumns, ne, or } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { modelsTable } from "@/db/schema";

const getLlmModelsSchema = z.undefined();

export const getLlmModelsFn = createServerFn()
  .inputValidator(getLlmModelsSchema)
  .handler(async () => {
    const { providerOptions, modelId, ...rest } = getTableColumns(modelsTable);
    const models = await db
      .select(rest)
      .from(modelsTable)
      .where(
        and(
          or(eq(modelsTable.type, "llm"), eq(modelsTable.type, "vlm")),
          ne(modelsTable.scope, "internal"),
        ),
      );

    return models;
  });
