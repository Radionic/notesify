import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";

const getMessagesSchema = z.object({
  chatId: z.string(),
});

export const getMessagesFn = createServerFn()
  .inputValidator(getMessagesSchema)
  .handler(async ({ data }) => {
    const messages = await db.query.messagesTable.findMany({
      where: eq(messagesTable.chatId, data.chatId),
      orderBy: [asc(messagesTable.createdAt)],
    });
    return messages;
  });
