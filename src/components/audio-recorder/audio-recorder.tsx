import { useEffect } from "react";
import { useSetAtom } from "jotai";

import {
  initializeAudioPlayerAtom,
  cleanupAudioResourcesAtom,
} from "@/actions/recording/audio-recorder";

import { AudioRecorderToolbar } from "./toolbar";
import { RecordingControls } from "./recording-controls";
import { RecordingsList } from "./recordings-list";

export const AudioRecorder = () => {
  const initialize = useSetAtom(initializeAudioPlayerAtom);
  const cleanup = useSetAtom(cleanupAudioResourcesAtom);

  // Initialize and cleanup audio player
  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return (
    <div className="flex flex-col h-full bg-secondary">
      <AudioRecorderToolbar />
      <RecordingsList className="flex-1 overflow-y-auto" />
      <RecordingControls />
    </div>
  );
};
