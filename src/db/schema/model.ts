import { integer, jsonb, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

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
  "Xiaomi",
]);

export const modelThinkingEnum = pgEnum("model_thinking", [
  "unspecified",
  "low",
  "medium",
  "high",
]);

export const modelsTable = pgTable("models", {
  id: text("id").primaryKey(),
  modelId: text("model_id").notNull(),
  provider: modelProviderEnum("provider").notNull(),
  providerOptions: jsonb("provider_options"),
  name: text("name").notNull(),
  type: modelTypeEnum("type").notNull(),
  scope: modelScopeEnum("scope").notNull().default("basic"),
  thinking: modelThinkingEnum("thinking"),
  credits: integer("credits").notNull().default(0),
  maxInputChars: integer("max_input_chars"),
  maxOutputTokens: integer("max_output_tokens"),
});

export type Model = typeof modelsTable.$inferSelect;
