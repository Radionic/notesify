import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { z } from "zod";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { pdfPreviewAtom, pdfViewerOpenAtom } from "@/atoms/pdf/pdf-viewer";
import { audioRecorderOpenAtom } from "@/atoms/recording/audio-recorder";
import { AudioRecorder } from "@/components/audio-recorder/audio-recorder";
import { Chat } from "@/components/chat/chat";
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
import { protectRouteFn } from "@/server/auth";

const viewerSearchSchema = z.object({
  sid: z.string(),
  page: z.number().optional(),
  type: z.enum(["pdf", "webpage"]).optional().default("pdf"),
});

const Viewer = () => {
  const { sid: id, page, type } = Route.useSearch();

  const chatsOpen = useAtomValue(chatsOpenAtom);
  const pdfViewerOpen = useAtomValue(pdfViewerOpenAtom);
  const audioRecorderOpen = useAtomValue(audioRecorderOpenAtom);
  const pdfPreview = useAtomValue(pdfPreviewAtom);
  const isMobile = useIsMobile();

  if (!id) {
    toast.info("No file found");
    return <Navigate to="/library" />;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="relative flex-1 overflow-hidden">
          {type === "pdf" && pdfViewerOpen && id && (
            <div className="flex flex-col h-full">
              <PdfToolbar pdfId={id} />
              <div className="flex-1 relative">
                <PdfViewer pdfId={id} page={page} />
              </div>
            </div>
          )}

          {type !== "pdf" && (
            <div className="flex-1 h-full">
              <WebpageViewer webpageId={id} />
            </div>
          )}

          {chatsOpen && (
            <div className="absolute inset-0 z-50 bg-background">
              <Chat />
            </div>
          )}

          {audioRecorderOpen && !chatsOpen && (
            <div className="absolute inset-0 z-50 bg-background">
              <AudioRecorder />
            </div>
          )}

          {pdfPreview && !chatsOpen && !audioRecorderOpen && type === "pdf" && (
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
        {type === "pdf" && pdfViewerOpen && id && (
          <>
            <ResizablePanel
              minSize={30}
              className="relative"
              defaultSize={60}
              order={1}
            >
              <div className="flex flex-col h-full">
                <PdfToolbar pdfId={id} />
                <div className="flex-1 relative">
                  <PdfViewer pdfId={id} page={page} />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {type !== "pdf" && (
          <>
            <ResizablePanel
              minSize={30}
              className="relative"
              defaultSize={60}
              order={1}
            >
              <WebpageViewer webpageId={id} />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {pdfPreview && type === "pdf" && (
          <>
            <ResizablePanel minSize={20} defaultSize={30} order={2}>
              <PdfPagePreview />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {chatsOpen && (
          <>
            <ResizablePanel minSize={25} defaultSize={40} order={3}>
              <Chat />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {audioRecorderOpen && (
          <ResizablePanel minSize={25} order={4}>
            <AudioRecorder />
          </ResizablePanel>
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
