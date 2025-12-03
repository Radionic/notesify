import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getSession } from "@/lib/auth";

const protectRouteSchema = z.object({
  redirect: z.string().optional(),
});

export const protectRouteFn = createServerFn()
  .inputValidator(protectRouteSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session?.user) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: data.redirect },
      });
    }
  });
