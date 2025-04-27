import { createFileRoute } from "@tanstack/react-router";
import { PdfFileUploader } from "@/components/file-system/file-uploader";
import { FileSystemSidebar } from "@/components/file-system/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "react-responsive";

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
});
