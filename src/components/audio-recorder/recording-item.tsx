import { format } from "date-fns";
import { RecordingItemMenu } from "./recording-item-menu";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/audio/utils";
import { AudioPlayer } from "./audio-player";
import { useAtomValue, useSetAtom } from "jotai";
import { playRecordingAtom } from "@/actions/recording/audio-recorder";
import { selectedRecordingIdAtom } from "@/atoms/recording/audio-recorder";
import { Recording } from "@/db/schema";

export const RecordingItem = ({ recording }: { recording: Recording }) => {
  const selectedRecordingId = useAtomValue(selectedRecordingIdAtom);
  const playRecording = useSetAtom(playRecordingAtom);
  const isSelected = selectedRecordingId === recording.id;
  return (
    <div className={cn("flex flex-col", isSelected && "bg-primary/10")}>
      <div
        className="flex items-center justify-between p-3 hover:bg-primary/5 cursor-pointer"
        onClick={() => playRecording(recording.id)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">{recording.name}</div>
            <div className="text-xs text-neutral-500 flex gap-2">
              <span>{formatDuration(recording.duration)}</span>
              <span>•</span>
              <span>{format(recording.createdAt, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <RecordingItemMenu recording={recording} />
      </div>
      {isSelected && <AudioPlayer duration={recording.duration} />}
    </div>
  );
};
