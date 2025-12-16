// @ts-ignore
import { waitUntil } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendMessage } from "@/lib/discord";
import { sendVerifyEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      waitUntil(
        sendVerifyEmail({
          email: user.email,
          redirectUrl: url,
        }),
      );
    },
    afterEmailVerification: async (user) => {
      waitUntil(
        sendMessage({
          type: "user-register",
          name: user.name,
          email: user.email,
        }),
      );
    },
  },
});

export const getSession = () =>
  auth.api.getSession({
    headers: getRequest().headers,
  });
