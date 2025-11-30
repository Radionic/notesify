import { createServerFn } from "@tanstack/react-start";
import { eq, or } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { modelsTable } from "@/db/schema";

const getLlmModelsSchema = z.object({});

export const getLlmModelsFn = createServerFn()
  .inputValidator(getLlmModelsSchema)
  .handler(async () => {
    const models = await db
      .select({
        id: modelsTable.id,
        name: modelsTable.name,
        type: modelsTable.type,
        provider: modelsTable.provider,
      })
      .from(modelsTable)
      .where(or(eq(modelsTable.type, "llm"), eq(modelsTable.type, "vlm")));

    return models;
  });
