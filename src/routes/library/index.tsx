import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { FileBrowser } from "@/components/file-system/file-browser";
import { Header } from "@/components/landing/header";
import { protectRouteFn } from "@/server/auth";

const RouteComponent = () => {
  return (
    <div className="bg-panel min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <FileBrowser />
      </main>
    </div>
  );
};

export const Route = createFileRoute("/library/")({
  component: RouteComponent,
  ssr: "data-only",
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  beforeLoad: async ({ location }) => {
    await protectRouteFn({
      data: {
        redirect: location.href,
      },
    });
  },
});
