import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMediaQuery } from "react-responsive";
import { PdfFileUploader } from "@/components/file-system/file-uploader";
import { FileSystemSidebar } from "@/components/file-system/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { authClient } from "@/lib/auth-client";

const RouteComponent = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  return (
    <ResizablePanelGroup direction="horizontal">
      {!isMobile && (
        <>
          <ResizablePanel order={1} defaultSize={20}>
            <FileSystemSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}
      <ResizablePanel
        order={2}
        className="min-h-dvh flex flex-col justify-center gap-4 bg-panel"
      >
        <PdfFileUploader />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export const Route = createFileRoute("/library/")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const { data } = await authClient.getSession();
    if (!data?.user) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
  },
});
