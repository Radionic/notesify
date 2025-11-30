import { useAtom, useAtomValue } from "jotai";
import { AudioLines, FileText, PanelLeft, Sparkles } from "lucide-react";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { fileSystemOpenAtom } from "@/atoms/file-system/file-system";
import { notesOpenAtom } from "@/atoms/notes/notes";
import { pdfViewerOpenAtom } from "@/atoms/pdf/pdf-viewer";
import {
  audioRecorderOpenAtom,
  isRecordingAtom,
} from "@/atoms/recording/audio-recorder";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";
import { ThemeSwitch } from "../theme-switch";
import { Separator } from "../ui/separator";

export const Header = ({ pdfId }: { pdfId: string }) => {
  const [fileSystemOpen, setFileSystemOpen] = useAtom(fileSystemOpenAtom);
  const [chatsOpen, setChatsOpen] = useAtom(chatsOpenAtom);
  const [pdfOpen, setPdfOpen] = useAtom(pdfViewerOpenAtom);
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const [audioRecorderOpen, setAudioRecorderOpen] = useAtom(
    audioRecorderOpenAtom,
  );
  const isRecording = useAtomValue(isRecordingAtom);

  const { navigatePdf } = useNavigatePdf();

  // Toggle a panel while ensuring at least one remains open
  const togglePanel = (
    panel: "notes" | "pdf" | "chats" | "audio-recorder",
    currentlyOpen: boolean,
  ) => {
    if (currentlyOpen) {
      const atLeastOneOtherOpen =
        (panel !== "notes" && notesOpen) ||
        (panel !== "pdf" && pdfOpen) ||
        (panel !== "chats" && chatsOpen) ||
        (panel !== "audio-recorder" && audioRecorderOpen);

      if (!atLeastOneOtherOpen) {
        return true;
      }
    }
    return !currentlyOpen;
  };

  return (
    <Card className="sticky flex flex-row w-full px-0.5 py-1 border-2 border-transparent border-b-border justify-between z-30 rounded-none bg-header">
      <div className="flex flex-row items-center gap-0.5">
        <TooltipButton
          tooltip="Toggle Library"
          active={fileSystemOpen}
          onClick={() => {
            setFileSystemOpen((open) => !open);
          }}
        >
          <PanelLeft />
        </TooltipButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <TooltipButton
          tooltip="Toggle Sources"
          active={pdfOpen}
          onClick={() => {
            setPdfOpen((open) => togglePanel("pdf", open));
          }}
        >
          <FileText />
        </TooltipButton>

        <TooltipButton
          id="ask-ai-button"
          tooltip="Toggle AI Assistant"
          active={chatsOpen}
          onClick={() => {
            setChatsOpen((open) => togglePanel("chats", open));
          }}
        >
          <Sparkles />
        </TooltipButton>

        <TooltipButton
          tooltip="Toggle Audio Recorder"
          active={audioRecorderOpen}
          className={cn(
            isRecording &&
              "bg-red-100 text-red-500 hover:text-red-600 hover:bg-red-100",
          )}
          onClick={() =>
            setAudioRecorderOpen((open) => togglePanel("audio-recorder", open))
          }
        >
          <AudioLines />
        </TooltipButton>
      </div>

      <div className="flex flex-row items-center gap-0.5">
        <ThemeSwitch />
      </div>
    </Card>
  );
};
