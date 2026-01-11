import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useEmailSignIn = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      callbackURL,
    }: {
      email: string;
      password: string;
      callbackURL?: string;
    }) => {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Unable to sign in. Please try again.",
        );
      }

      return result;
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async ({
      email,
      redirectTo,
    }: {
      email: string;
      redirectTo?: string;
    }) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo,
      });

      if (result.error) {
        throw new Error(
          result.error.message ??
            "Unable to request password reset. Please try again.",
        );
      }

      return result;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({
      newPassword,
      token,
    }: {
      newPassword: string;
      token: string;
    }) => {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Unable to reset password. Please try again.",
        );
      }

      return result;
    },
  });
};

export const useEmailSignUp = () => {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      callbackURL,
    }: {
      name: string;
      email: string;
      password: string;
      callbackURL?: string;
    }) => {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Unable to create account. Please try again.",
        );
      }

      return result;
    },
  });
};

export const useGoogleSignIn = () => {
  return useMutation({
    mutationFn: async ({ callbackURL }: { callbackURL?: string }) => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (result.error) {
        throw new Error(
          result.error.message ??
            "Unable to sign in with Google. Please try again.",
        );
      }

      return result;
    },
  });
};
