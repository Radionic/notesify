import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const chatsTable = pgTable(
  "chats",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("chats_updated_at_idx").on(table.updatedAt),
    index("chats_created_at_idx").on(table.createdAt),
  ],
);

export type Chat = typeof chatsTable.$inferSelect;
