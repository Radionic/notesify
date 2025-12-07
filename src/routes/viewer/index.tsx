import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import { z } from "zod";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { pdfViewerOpenAtom } from "@/atoms/pdf/pdf-viewer";
import { audioRecorderOpenAtom } from "@/atoms/recording/audio-recorder";
import { AudioRecorder } from "@/components/audio-recorder/audio-recorder";
import { Chat } from "@/components/chat/chat";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Header } from "@/components/viewer/header";
import { PdfToolbar } from "@/components/viewer/toolbars/pdf-toolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { protectRouteFn } from "@/server/auth";

const viewerSearchSchema = z.object({
  // id: z.union([z.string().array(), z.string()]),
  sid: z.string(),
  // nid: z.string().optional(),
  page: z.number().optional(),
});

const Viewer = () => {
  const { sid: pdfId, page } = Route.useSearch();

  const chatsOpen = useAtomValue(chatsOpenAtom);
  const pdfViewerOpen = useAtomValue(pdfViewerOpenAtom);
  const audioRecorderOpen = useAtomValue(audioRecorderOpenAtom);
  const isMobile = useIsMobile();

  if (!pdfId) {
    toast.info("No PDF found");
    return <Navigate to="/library" />;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="relative flex-1 overflow-hidden">
          {pdfViewerOpen && pdfId && (
            <div className="flex flex-col h-full">
              <PdfToolbar pdfId={pdfId} />
              <div className="flex-1 relative">
                <PdfViewer pdfId={pdfId} page={page} />
              </div>
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
        {pdfViewerOpen && pdfId && (
          <>
            <ResizablePanel minSize={40} className="relative" order={1}>
              <div className="flex flex-col h-full">
                <PdfToolbar pdfId={pdfId} />
                <div className="flex-1 relative">
                  <PdfViewer pdfId={pdfId} page={page} />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {chatsOpen && (
          <>
            <ResizablePanel minSize={25} order={2}>
              <Chat />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {audioRecorderOpen && (
          <ResizablePanel minSize={25} order={3}>
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
});
