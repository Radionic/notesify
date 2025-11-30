import type { UIMessage } from "ai";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { chatsTable } from "@/db/schema/chat/chats";

export const messagesTable = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chatsTable.id),
    role: text("role", {
      enum: ["system", "user", "assistant", "tool", "data"],
    }).notNull(),
    parts: jsonb("parts").$type<UIMessage["parts"]>(),
    metadata: jsonb("metadata").$type<UIMessage["metadata"]>(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("messages_created_at_idx").on(table.createdAt)],
);

export type Message = typeof messagesTable.$inferSelect;
