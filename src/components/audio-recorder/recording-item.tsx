import { format } from "date-fns";
import { useAtom } from "jotai";
import { selectedRecordingIdAtom } from "@/atoms/recording/audio-recorder";
import type { Recording } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useRecordingData } from "@/queries/recording/use-recording";
import { formatDuration } from "../../lib/audio/utils";
import { AudioPlayer } from "./audio-player";
import { RecordingItemMenu } from "./recording-item-menu";

export const RecordingItem = ({ recording }: { recording: Recording }) => {
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(
    selectedRecordingIdAtom,
  );
  const isSelected = selectedRecordingId === recording.id;
  const { data: recordingData } = useRecordingData({
    id: recording.id,
    enabled: isSelected,
  });

  return (
    <div className={cn("flex flex-col", isSelected && "bg-primary/10")}>
      <div
        className="flex items-center justify-between p-3 hover:bg-primary/5 cursor-pointer"
        onClick={() => {
          setSelectedRecordingId(recording.id);
        }}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">{recording.name}</div>
            <div className="text-xs text-neutral-500 flex gap-2">
              <span>{formatDuration(recording.duration / 1000)}</span>
              <span>•</span>
              <span>{format(recording.createdAt, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <RecordingItemMenu recording={recording} />
      </div>
      {isSelected && recordingData && (
        <AudioPlayer
          durationMs={recording.duration}
          recordingUrl={URL.createObjectURL(recordingData)}
        />
      )}
    </div>
  );
};
