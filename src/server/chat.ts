import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

const getChatsSchema = z.object({
  searchTerm: z.string().optional(),
});

export const getChatsFn = createServerFn()
  .inputValidator(getChatsSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const values = await db.query.chatsTable.findMany({
      where: and(
        eq(chatsTable.userId, session.user.id),
        data.searchTerm
          ? ilike(chatsTable.title, `%${data.searchTerm}%`)
          : undefined,
      ),
      orderBy: [desc(chatsTable.updatedAt)],
    });
    return values;
  });

const getChatSchema = z.object({
  id: z.string(),
});

export const getChatFn = createServerFn()
  .inputValidator(getChatSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const value = await db.query.chatsTable.findFirst({
      where: and(
        eq(chatsTable.id, data.id),
        eq(chatsTable.userId, session.user.id),
      ),
    });
    return value;
  });

const updateChatTitleSchema = z.object({
  chatId: z.string(),
  title: z.string(),
});

export const updateChatTitleFn = createServerFn()
  .inputValidator(updateChatTitleSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(chatsTable)
      .set({ title: data.title })
      .where(
        and(
          eq(chatsTable.id, data.chatId),
          eq(chatsTable.userId, session.user.id),
        ),
      );
  });
