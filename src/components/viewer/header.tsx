import { Link } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { AudioLines, Sparkles } from "lucide-react";
import { chatsOpenAtom } from "@/atoms/chat/chats";
import { notesOpenAtom } from "@/atoms/notes/notes";
import {
  audioRecorderOpenAtom,
  isRecordingAtom,
} from "@/atoms/recording/audio-recorder";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UserIcon } from "../auth/user-icon";
import { ThemeSwitch } from "../theme-switch";

export const Header = () => {
  const [chatsOpen, setChatsOpen] = useAtom(chatsOpenAtom);
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const [audioRecorderOpen, setAudioRecorderOpen] = useAtom(
    audioRecorderOpenAtom,
  );
  const isRecording = useAtomValue(isRecordingAtom);
  const isMobile = useIsMobile();

  const togglePanel = (
    panel: "notes" | "pdf" | "chats" | "audio-recorder",
    currentlyOpen: boolean,
  ) => {
    if (isMobile && !currentlyOpen) {
      if (panel === "chats") {
        setAudioRecorderOpen(false);
      } else if (panel === "audio-recorder") {
        setChatsOpen(false);
      }
    }
    return !currentlyOpen;
  };

  return (
    <Card className="sticky flex flex-row w-full px-0.5 py-1 border-2 border-transparent border-b-border justify-between z-30 rounded-none bg-header">
      <div className="flex flex-row items-center gap-0.5">
        <Link to="/library">
          <img
            src="/favicon.png"
            alt="Notesify Icon"
            className="w-6 h-6 rounded-sm mx-1"
          />
        </Link>

        <TooltipButton
          id="ask-ai-button"
          tooltip="Toggle AI Assistant"
          size="icon"
          className={cn(chatsOpen && "bg-secondary")}
          onClick={() => {
            setChatsOpen((open) => togglePanel("chats", open));
          }}
        >
          <Sparkles />
        </TooltipButton>

        <TooltipButton
          tooltip="Toggle Audio Recorder"
          size="icon"
          className={cn(
            audioRecorderOpen && "bg-secondary",
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
        <UserIcon />
      </div>
    </Card>
  );
};
