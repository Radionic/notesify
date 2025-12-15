import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "@/db";
import { sendMessage } from "@/lib/discord";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith("/sign-up")) {
        return;
      }

      const newSession = ctx.context.newSession;
      if (!newSession?.user) {
        return;
      }

      await sendMessage({
        type: "user-register",
        name: newSession.user.name,
        email: newSession.user.email,
      });
    }),
  },
});

export const getSession = () =>
  auth.api.getSession({
    headers: getRequest().headers,
  });
