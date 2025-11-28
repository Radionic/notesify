import type { Message } from "ai";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { chatsTable } from "@/db/schema/chat/chats";

export const messagesTable = sqliteTable(
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
    data: text("data", { mode: "json" }).$type<Message["data"]>(),
    annotations: text("annotations", { mode: "json" }).$type<
      Message["annotations"]
    >(),
    parts: text("parts", { mode: "json" }).$type<Message["parts"]>(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("messages_created_at_idx").on(table.createdAt)],
);

export type MessageDB = typeof messagesTable.$inferSelect;
