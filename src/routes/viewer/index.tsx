import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";

import { pdfViewerOpenAtom } from "@/atoms/pdf/pdf-viewer";
import { PlateEditor } from "@/components/editor/plate-editor";
import { Chat } from "@/components/chat/chat";
import { PdfCommandDialog } from "@/components/pdf/dialog/command-dialog";
import { ProviderSettingsDialog } from "@/components/pdf/dialog/provider-settings-dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { FileSystemSidebar } from "@/components/file-system/sidebar";
import { z } from "zod";
import { toast } from "sonner";
import { Suspense, useEffect } from "react";
import { PDFViewerDroppable } from "@/components/dnd/pdf-viewer-droppable";
import { PdfViewerDndProvider } from "@/components/dnd/pdf-viewer-dnd-context";
import { isTauri } from "@/lib/tauri";
import { PdfToolbar } from "@/components/viewer/toolbars/pdf-toolbar";
import { Header } from "@/components/viewer/header";
import { notesOpenAtom } from "@/atoms/notes/notes";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { fileSystemOpenAtom } from "@/atoms/file-system/file-system";
import { audioRecorderOpenAtom } from "@/atoms/recording/audio-recorder";
import { AudioRecorder } from "@/components/audio-recorder/audio-recorder";

const viewerSearchSchema = z.object({
  // id: z.union([z.string().array(), z.string()]),
  sid: z.string(),
  nid: z.string().optional(),
  page: z.number().optional(),
});

const Viewer = () => {
  useEffect(() => {
    if (!isTauri) {
      toast.warning(
        "Warning: This is a demo app. Data is discarded when the app is closed.",
        {
          position: "bottom-right",
          action: {
            label: "Ok",
            onClick: () => {},
          },
          duration: 5000,
        }
      );
    }
  }, []);

  const { sid: pdfId, nid: notesId, page } = Route.useSearch();

  const fileSystemOpen = useAtomValue(fileSystemOpenAtom);
  const chatsOpen = useAtomValue(chatsOpenAtom);
  const pdfViewerOpen = useAtomValue(pdfViewerOpenAtom);
  const notesOpen = useAtomValue(notesOpenAtom);
  const audioRecorderOpen = useAtomValue(audioRecorderOpenAtom);

  // const draggingItemId = useAtomValue(draggingItemIdAtom);

  if (!pdfId) {
    toast.info("No PDF found");
    return <Navigate to="/library" />;
  }

  return (
    // <PdfViewerDndProvider>
    <div className="flex flex-col h-dvh">
      <Header pdfId={pdfId} />
      <ResizablePanelGroup
        autoSaveId="viewer"
        direction="horizontal"
        className="flex-1 overflow-hidden [&>[data-resize-handle]:last-child]:hidden"
      >
        {fileSystemOpen && (
          <>
            <ResizablePanel minSize={15} order={1}>
              <FileSystemSidebar withUpload />
              {/* <FileSystemSidebar withUpload draggingItemId={draggingItemId} /> */}
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {notesOpen && notesId && (
          <>
            <ResizablePanel minSize={25} order={2}>
              <PlateEditor notesId={notesId} />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {pdfViewerOpen && pdfId && (
          <>
            <ResizablePanel minSize={25} className="relative" order={3}>
              <Suspense>
                <div className="flex flex-col h-full">
                  <PdfToolbar pdfId={pdfId} />
                  <div className="flex-1 relative">
                    <PdfViewer pdfId={pdfId} page={page} />
                  </div>
                </div>
              </Suspense>

              {/* {draggingItemId && <PDFViewerDroppable pdfId={pdfId} />} */}
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {chatsOpen && (
          <>
            <ResizablePanel minSize={25} order={4}>
              <Chat />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {audioRecorderOpen && (
          <ResizablePanel minSize={25} order={5}>
            <AudioRecorder />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <ProviderSettingsDialog />
      {/* <PdfCommandDialog /> */}
      {/* </PdfViewerDndProvider> */}
    </div>
  );
};

export const Route = createFileRoute("/viewer/")({
  component: Viewer,
  validateSearch: viewerSearchSchema,
});
