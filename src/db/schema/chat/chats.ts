import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";

export const chatsTable = pgTable(
  "chats",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("chats_updated_at_idx").on(table.updatedAt),
    index("chats_created_at_idx").on(table.createdAt),
    index("chats_user_id_idx").on(table.userId),
    index("chats_title_trgm_idx").using("gin", table.title.op("gin_trgm_ops")),
  ],
);

export type Chat = typeof chatsTable.$inferSelect;
