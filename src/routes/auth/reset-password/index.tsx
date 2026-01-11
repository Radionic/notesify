import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { Header } from "@/components/landing/header";
import { ResetPasswordForm } from "../../../components/auth/reset-password-form";

function ResetPasswordPage() {
  return (
    <div className="bg-panel min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <ResetPasswordForm />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/auth/reset-password/")({
  component: ResetPasswordPage,
  validateSearch: z.object({
    token: z.string().optional(),
    error: z.string().optional(),
  }),
  head: () => ({
    meta: [
      {
        title: "Reset Password | Notesify",
      },
    ],
  }),
});
