import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";

export const recordingsTable = pgTable(
  "recordings",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("recordings_duration_idx").on(table.duration),
    index("recordings_created_at_idx").on(table.createdAt),
    index("recordings_user_id_idx").on(table.userId),
  ],
);

export type Recording = typeof recordingsTable.$inferSelect;
