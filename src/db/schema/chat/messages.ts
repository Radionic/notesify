import type { Message } from "ai";
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
    content: text("content").notNull(),
    data: jsonb("data").$type<Message["data"]>(),
    annotations: jsonb("annotations").$type<Message["annotations"]>(),
    parts: jsonb("parts").$type<Message["parts"]>(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (table) => [index("messages_created_at_idx").on(table.createdAt)],
);

export type MessageDB = typeof messagesTable.$inferSelect;
