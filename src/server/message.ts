import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type MessageDB, messagesTable } from "@/db/schema";

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

const saveMessageSchema = z.object({
  message: z.any(),
});

export const saveMessageFn = createServerFn()
  .inputValidator(saveMessageSchema)
  .handler(async ({ data }) => {
    await db.insert(messagesTable).values(data.message as MessageDB);
  });
