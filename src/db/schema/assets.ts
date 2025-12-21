import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { messagesTable } from "@/db/schema/chat/messages";

export const assetTypeEnum = pgEnum("asset_type", ["flashcards", "mini_quiz"]);
export type AssetType = (typeof assetTypeEnum.enumValues)[number];

export const assetsTable = pgTable(
  "assets",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .references(() => messagesTable.id, { onDelete: "cascade" }),
    type: assetTypeEnum("type").notNull(),
    content: jsonb("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("assets_message_id_idx").on(table.messageId),
    index("assets_type_idx").on(table.type),
  ],
);

export type Asset = typeof assetsTable.$inferSelect;
