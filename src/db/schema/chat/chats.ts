import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chatsTable = sqliteTable(
  "chats",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("chats_updated_at_idx").on(table.updatedAt),
    index("chats_created_at_idx").on(table.createdAt),
  ],
);

export type Chat = typeof chatsTable.$inferSelect;
