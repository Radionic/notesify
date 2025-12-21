import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";
import { Header } from "@/components/landing/header";

export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Login | Notesify",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="bg-panel min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <LoginForm />
      </main>
    </div>
  );
}
