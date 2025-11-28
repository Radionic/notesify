import "./index.css";
import { GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./components/theme-provider";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const Root = () => {
  const { theme } = useTheme();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" invert={theme === "dark"} expand />
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={100}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Root />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>,
);
