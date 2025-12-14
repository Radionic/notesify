import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { chatsTable } from "@/db/schema/chat/chats";
import { messagesTable } from "@/db/schema/chat/messages";
import { modelsTable } from "@/db/schema/model";
import { pdfsTable } from "@/db/schema/pdf/pdfs";

export const modelUsageTypeEnum = pgEnum("model_usage_type", [
  "chat",
  "chat_title",
  "pdf_toc",
  "pdf_ocr_page",
  "pdf_ocr_visual_info",
]);
export type ModelUsageType = (typeof modelUsageTypeEnum.enumValues)[number];

export const modelFinishReasonEnum = pgEnum("model_finish_reason", [
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "other",
  "unknown",
]);
export type FinishReason = (typeof modelFinishReasonEnum.enumValues)[number];

export const modelUsagesTable = pgTable(
  "model_usages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    modelId: text("model_id")
      .notNull()
      .references(() => modelsTable.id, { onDelete: "restrict" }),
    pdfId: text("pdf_id").references(() => pdfsTable.id, {
      onDelete: "set null",
    }),
    chatId: text("chat_id").references(() => chatsTable.id, {
      onDelete: "set null",
    }),
    messageId: text("message_id").references(() => messagesTable.id, {
      onDelete: "set null",
    }),
    type: modelUsageTypeEnum("type").notNull(),
    promptTokens: integer("prompt_tokens"),
    cachedInputTokens: integer("cached_input_tokens"),
    completionTokens: integer("completion_tokens"),
    reasoningTokens: integer("reasoning_tokens"),
    totalTokens: integer("total_tokens"),
    cost: numeric("cost", { precision: 10, scale: 8 }),
    finishReason: modelFinishReasonEnum("finish_reason"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("model_usages_user_id_idx").on(table.userId),
    index("model_usages_model_id_idx").on(table.modelId),
    index("model_usages_pdf_id_idx").on(table.pdfId),
    index("model_usages_chat_id_idx").on(table.chatId),
    index("model_usages_message_id_idx").on(table.messageId),
    index("model_usages_created_at_idx").on(table.createdAt),
  ],
);

export type ModelUsage = typeof modelUsagesTable.$inferSelect;
