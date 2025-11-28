import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recordingsTable = sqliteTable(
  "recordings",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("recordings_duration_idx").on(table.duration),
    index("recordings_created_at_idx").on(table.createdAt),
  ],
);

export type Recording = typeof recordingsTable.$inferSelect;
