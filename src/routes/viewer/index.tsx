import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { z } from "zod";
import { pdfPreviewAtom } from "@/atoms/pdf/pdf-viewer";
import { Chat } from "@/components/chat/chat";
import { FileBrowser } from "@/components/file-system/file-browser";
import { ImageViewer } from "@/components/images/image-viewer";
import { PdfPagePreview } from "@/components/pdf/pdf-page-preview";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Header } from "@/components/viewer/header";
import { PdfToolbar } from "@/components/viewer/toolbars/pdf-toolbar";
import { WebpageViewer } from "@/components/webpages/webpage-viewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { protectRouteFn } from "@/server/auth";

const viewerSearchSchema = z.object({
  so: z.boolean().optional(), // source open
  co: z.boolean().optional(), // chat open
  sid: z.string().optional(), // source id
  cid: z.string().optional(), // chat id
  type: z.enum(["pdf", "webpage", "image"]).optional(), // source type
  page: z.number().optional(), // pdf page
});

const Viewer = () => {
  const { sid, type, cid, so, co } = Route.useSearch();
  const navigate = useNavigate({ from: "/viewer/" });

  const pdfPreview = useAtomValue(pdfPreviewAtom);
  const isMobile = useIsMobile();

  const sourceOpen = so ?? !!sid;
  const chatOpen = isMobile && sourceOpen ? false : (co ?? !sourceOpen);

  const handleChatIdChange = (chatId?: string) => {
    navigate({ search: (prev) => ({ ...prev, cid: chatId }), replace: true });
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="relative flex-1 overflow-hidden">
          {sid && type === "pdf" && (
            <div
              className={cn("flex flex-col h-full", !sourceOpen && "hidden")}
            >
              <PdfToolbar pdfId={sid} />
              <div className="flex-1 relative">
                <PdfViewer pdfId={sid} />
              </div>
            </div>
          )}

          {sid && type === "webpage" && (
            <div className={cn("flex-1 h-full", !sourceOpen && "hidden")}>
              <WebpageViewer webpageId={sid} />
            </div>
          )}

          {sid && type === "image" && (
            <div className={cn("flex-1 h-full", !sourceOpen && "hidden")}>
              <ImageViewer imageId={sid} />
            </div>
          )}

          {sourceOpen && !sid && (
            <div className="h-full overflow-y-auto p-4">
              <FileBrowser />
            </div>
          )}

          {chatOpen && !sourceOpen && (
            <div className="absolute inset-0 z-50 bg-background">
              <Chat
                chatId={cid}
                onChatIdChange={handleChatIdChange}
                isCentered={!cid}
                minimal={!!cid}
              />
            </div>
          )}

          {pdfPreview && !chatOpen && type === "pdf" && (
            <div className="absolute inset-0 z-50 bg-background">
              <PdfPagePreview />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh">
      <Header />
      <ResizablePanelGroup
        autoSaveId="viewer"
        direction="horizontal"
        className="flex-1 overflow-hidden [&>[data-resize-handle]:last-child]:hidden"
      >
        {sid && type === "pdf" && (
          <>
            <ResizablePanel
              collapsed={!sourceOpen}
              minSize={30}
              className="relative"
              defaultSize={50}
              order={1}
            >
              <div className="flex flex-col h-full">
                <PdfToolbar pdfId={sid} />
                <div className="flex-1 relative">
                  <PdfViewer pdfId={sid} />
                </div>
              </div>
            </ResizablePanel>
            {sourceOpen && <ResizableHandle withHandle />}
          </>
        )}

        {sid && type === "webpage" && (
          <>
            <ResizablePanel
              collapsed={!sourceOpen}
              minSize={30}
              className="relative"
              defaultSize={50}
              order={1}
            >
              <WebpageViewer webpageId={sid} />
            </ResizablePanel>
            {sourceOpen && <ResizableHandle withHandle />}
          </>
        )}

        {sid && type === "image" && (
          <>
            <ResizablePanel
              collapsed={!sourceOpen}
              minSize={30}
              className="relative"
              defaultSize={50}
              order={1}
            >
              <ImageViewer imageId={sid} />
            </ResizablePanel>
            {sourceOpen && <ResizableHandle withHandle />}
          </>
        )}

        {sourceOpen && !sid && (
          <>
            <ResizablePanel
              minSize={30}
              className="relative"
              defaultSize={50}
              order={1}
            >
              <div className="h-full overflow-y-auto p-4">
                <FileBrowser />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {pdfPreview && type === "pdf" && (
          <>
            <ResizablePanel minSize={30} defaultSize={30} order={2}>
              <PdfPagePreview />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {chatOpen && (
          <>
            <ResizablePanel minSize={30} defaultSize={50} order={3}>
              <Chat
                chatId={cid}
                onChatIdChange={handleChatIdChange}
                isCentered={!sourceOpen && !cid}
                minimal={!sourceOpen && !!cid}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export const Route = createFileRoute("/viewer/")({
  component: Viewer,
  validateSearch: viewerSearchSchema,
  ssr: "data-only",
  beforeLoad: async ({ location }) => {
    await protectRouteFn({
      data: {
        redirect: location.href,
      },
    });
  },
  head: () => ({
    meta: [
      {
        title: "Viewer | Notesify",
      },
    ],
  }),
});
