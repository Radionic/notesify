import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { routeTree } from "./routeTree.gen";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "./components/theme-provider";

// const memoryHistory = createMemoryHistory({
//   initialEntries: ["/"],
// });
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
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={100}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Root />
        <Toaster position="top-right" expand />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
