import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { filesTable, webpagesTable } from "@/db/schema";

export const getWebpageContent = async ({
  webpageId,
  userId,
}: {
  webpageId: string;
  userId: string;
}) => {
  const webpage = await db
    .select({
      name: filesTable.name,
      content: webpagesTable.content,
    })
    .from(webpagesTable)
    .innerJoin(filesTable, eq(filesTable.id, webpagesTable.id))
    .where(and(eq(webpagesTable.id, webpageId), eq(filesTable.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!webpage) throw new Error(`Webpage not found: ${webpageId}`);
  return `${webpage.name}\n\n${webpage.content}`;
};
