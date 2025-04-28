import { Mic } from "lucide-react";
import { recordingsAtomLoadable } from "@/atoms/recording/audio-recorder";
import { RecordingItem } from "./recording-item";
import { cn } from "@/lib/utils";
import { useLoadable } from "@/hooks/state/use-loadable";

export const RecordingsList = ({ className }: { className?: string }) => {
  const recordings = useLoadable(recordingsAtomLoadable);
  if (!recordings || recordings.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full",
          className
        )}
      >
        <div className="h-10 w-10 mb-2 flex items-center justify-center">
          <Mic className="h-6 w-6" />
        </div>
        <p>No recordings yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {recordings.map((recording) => (
        <RecordingItem key={recording.id} recording={recording} />
      ))}
    </div>
  );
};
