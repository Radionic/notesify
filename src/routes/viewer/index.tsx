import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
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
  fo: z.boolean().optional().default(false), // file open
  co: z.boolean().optional().default(true), // chat open
  fid: z.string().optional(), // file id
  cid: z.string().optional(), // chat id
  type: z.enum(["pdf", "webpage", "image"]).optional(), // file type
  page: z.number().optional(), // pdf page
});

const Viewer = () => {
  const { fid, type, cid, fo, co } = Route.useSearch();
  const navigate = useNavigate({ from: "/viewer/" });

  const pdfPreview = useAtomValue(pdfPreviewAtom);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && fo && co) {
      navigate({
        search: (prev) => ({ ...prev, co: false }),
        replace: true,
      });
      return;
    }

    if (!fo && !co) {
      navigate({
        search: (prev) => ({ ...prev, co: true }),
        replace: true,
      });
    }
  }, [isMobile, fo, co, navigate]);

  const handleChatIdChange = (chatId?: string) => {
    navigate({ search: (prev) => ({ ...prev, cid: chatId }), replace: true });
  };

  const handleLibraryCollapse = (collapsed: boolean) => {
    if (collapsed && !co) return;
    navigate({
      search: (prev) => ({ ...prev, fo: !collapsed }),
      replace: true,
    });
  };

  const handleChatCollapse = (collapsed: boolean) => {
    if (collapsed && !fo) return;
    navigate({
      search: (prev) => ({ ...prev, co: !collapsed }),
      replace: true,
    });
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="relative flex-1 overflow-hidden">
          {fid && type === "pdf" && (
            <div className={cn("flex flex-col h-full", !fo && "hidden")}>
              <PdfToolbar pdfId={fid} />
              <div className="flex-1 relative">
                <PdfViewer pdfId={fid} />
              </div>
            </div>
          )}

          {fid && type === "webpage" && (
            <div className={cn("flex-1 h-full", !fo && "hidden")}>
              <WebpageViewer webpageId={fid} />
            </div>
          )}

          {fid && type === "image" && (
            <div className={cn("flex-1 h-full", !fo && "hidden")}>
              <ImageViewer imageId={fid} />
            </div>
          )}

          <div className={cn("h-full overflow-y-auto p-4", fid && "hidden")}>
            <FileBrowser />
          </div>

          <div
            className={cn(
              "absolute inset-0 z-50 bg-background",
              !co && "hidden",
            )}
          >
            <Chat
              chatId={cid}
              onChatIdChange={handleChatIdChange}
              centered={!cid}
              minimal={!!cid}
            />
          </div>

          {pdfPreview && !co && type === "pdf" && (
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
        <ResizablePanel
          collapsed={!fo}
          onCollapse={() => handleLibraryCollapse(true)}
          onExpand={() => handleLibraryCollapse(false)}
          minSize={25}
          className="relative"
          defaultSize={50}
          order={1}
        >
          {fid && type === "pdf" && (
            <div className="flex flex-col h-full">
              <PdfToolbar pdfId={fid} />
              <div className="flex-1 relative">
                <PdfViewer pdfId={fid} />
              </div>
            </div>
          )}

          {fid && type === "webpage" && <WebpageViewer webpageId={fid} />}

          {fid && type === "image" && <ImageViewer imageId={fid} />}

          {!fid && (
            <div className="h-full overflow-y-auto p-4">
              <FileBrowser />
            </div>
          )}
        </ResizablePanel>
        {fo && <ResizableHandle withHandle />}

        {pdfPreview && type === "pdf" && (
          <>
            <ResizablePanel minSize={25} defaultSize={30} order={2}>
              <PdfPagePreview />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        <ResizablePanel
          collapsed={!co}
          onCollapse={() => handleChatCollapse(true)}
          onExpand={() => handleChatCollapse(false)}
          minSize={25}
          defaultSize={50}
          order={3}
        >
          <Chat
            chatId={cid}
            onChatIdChange={handleChatIdChange}
            centered={!fo && !cid}
            minimal={!fo && !!cid}
          />
        </ResizablePanel>
        {co && <ResizableHandle withHandle />}
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
