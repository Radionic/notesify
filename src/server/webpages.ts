import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { webpagesTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

const getWebpageSchema = z.object({
  id: z.string(),
});

export const getWebpageFn = createServerFn()
  .inputValidator(getWebpageSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const webpage = await db.query.webpagesTable.findFirst({
      where: eq(webpagesTable.id, data.id),
      with: {
        file: true,
      },
    });

    if (!webpage?.file || webpage.file.userId !== session.user.id) {
      return null;
    }

    return webpage;
  });
