// @ts-ignore
import { waitUntil } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "@/db";
import { sendMessage } from "@/lib/discord";
import { sendVerifyEmail } from "./email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/callback/:id")) {
        // TODO: a better way to check new user registration
        const newSession = ctx.context.newSession;
        if (
          newSession &&
          Date.now() - newSession.user.createdAt.getTime() < 30 * 1000
        ) {
          waitUntil(
            sendMessage({
              type: "user-register",
              name: newSession.user.name,
              email: newSession.user.email,
              method: ctx.context.socialProviders[0].id,
            }),
          );
        }
      }
    }),
  },
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
          method: "email",
        }),
      );
    },
  },
});

export const getSession = () =>
  auth.api.getSession({
    headers: getRequest().headers,
  });
