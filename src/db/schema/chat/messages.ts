import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { chatsTable } from "@/db/schema/chat/chats";
import type { MyUIMessage } from "@/routes/api/ai";

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
    parts: jsonb("parts").$type<MyUIMessage["parts"]>(),
    metadata: jsonb("metadata").$type<MyUIMessage["metadata"]>(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_chat_id_idx").on(table.chatId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);

export type Message = typeof messagesTable.$inferSelect;
