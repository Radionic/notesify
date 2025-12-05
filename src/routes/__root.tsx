import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import appCss from "../index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Notesify" },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "0434a434-24ff-4b0e-ad6b-2dabf5be145b",
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider delayDuration={100}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Toaster position="top-right" expand />
            <Outlet />
          </ThemeProvider>
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
}
