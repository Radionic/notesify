import { AudioRecorderToolbar } from "./toolbar";
import { RecordingControls } from "./recording-controls";
import { RecordingsList } from "./recordings-list";

export const AudioRecorder = () => {
  return (
    <div className="flex flex-col h-full bg-panel">
      <AudioRecorderToolbar />
      <RecordingsList className="flex-1 overflow-y-auto" />
      <RecordingControls />
    </div>
  );
};
