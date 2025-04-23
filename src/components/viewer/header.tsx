import {
  AudioLines,
  FileText,
  Moon,
  PanelLeft,
  Sparkles,
  SquarePen,
  Sun,
} from "lucide-react";

import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { pdfViewerOpenAtom } from "@/atoms/pdf/pdf-viewer";
import { Separator } from "../ui/separator";
import { notesOpenAtom } from "@/atoms/notes/notes";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { useNavigatePdf } from "@/hooks/pdf/use-navigate-pdf";
import { openSettingsDialogAtom } from "@/atoms/setting/providers";
import { fileSystemOpenAtom } from "@/atoms/file-system/file-system";
import {
  audioRecorderOpenAtom,
  recordingStateAtom,
} from "@/atoms/recording/audio-recorder";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";

export const Header = ({ pdfId }: { pdfId: string }) => {
  const [fileSystemOpen, setFileSystemOpen] = useAtom(fileSystemOpenAtom);
  const [chatsOpen, setChatsOpen] = useAtom(chatsOpenAtom);
  const [pdfOpen, setPdfOpen] = useAtom(pdfViewerOpenAtom);
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const [audioRecorderOpen, setAudioRecorderOpen] = useAtom(
    audioRecorderOpenAtom
  );
  const recordingState = useAtomValue(recordingStateAtom);

  const setOpenSettings = useSetAtom(openSettingsDialogAtom);
  const { navigatePdf } = useNavigatePdf();

  const { theme, setTheme } = useTheme()

  // Toggle a panel while ensuring at least one remains open
  const togglePanel = (
    panel: "notes" | "pdf" | "chats" | "audio-recorder",
    currentlyOpen: boolean
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
    <Card className="sticky flex flex-row w-full px-0.5 py-1 border-2 border-transparent border-b-neutral-50 justify-between z-30 rounded-none">
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
          tooltip="Toggle Notes"
          active={notesOpen}
          onClick={async () => {
            const shouldOpen = togglePanel("notes", notesOpen);
            setNotesOpen(shouldOpen);
            if (shouldOpen) {
              navigatePdf({ pdfId, openNotes: true });
            }
          }}
        >
          <SquarePen />
        </TooltipButton>

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
            recordingState === "recording" &&
              "bg-red-100 text-red-500 hover:text-red-600 hover:bg-red-100"
          )}
          onClick={() =>
            setAudioRecorderOpen((open) => togglePanel("audio-recorder", open))
          }
        >
          <AudioLines />
        </TooltipButton>
      </div>

      <div className="flex flex-row items-center gap-0.5">
      <Button variant="ghost" size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "light" ? <Sun /> : <Moon />}
          </Button>
        <TooltipButton
          tooltip="Manage AI Models"
          onClick={() => setOpenSettings(true)}
        >
          <Sparkles />
          Manage AI Models
        </TooltipButton>
      </div>
    </Card>
  );
};
