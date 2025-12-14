import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const modelTypeEnum = pgEnum("model_type", [
  "llm",
  "vlm",
  "embedding",
  "ocr",
]);

export const modelScopeEnum = pgEnum("model_scope", [
  "basic",
  "advanced",
  "internal",
]);

export const modelProviderEnum = pgEnum("model_provider", [
  "Alibaba",
  "Anthropic",
  "DeepSeek",
  "Google",
  "Moonshot",
  "OpenAI",
  "xAI",
]);

export const modelsTable = pgTable("models", {
  id: text("id").primaryKey(),
  provider: modelProviderEnum("provider").notNull(),
  name: text("name").notNull(),
  type: modelTypeEnum("type").notNull(),
  scope: modelScopeEnum("scope").notNull().default("basic"),
});

export type Model = typeof modelsTable.$inferSelect;
