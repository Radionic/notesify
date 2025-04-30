import { format } from "date-fns";
import { RecordingItemMenu } from "./recording-item-menu";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/audio/utils";
import { AudioPlayer } from "./audio-player";
import { useAtom } from "jotai";
import { selectedRecordingIdAtom } from "@/atoms/recording/audio-recorder";
import { Recording } from "@/db/schema";
import { useRecordingData } from "@/queries/recording/use-recording";

export const RecordingItem = ({ recording }: { recording: Recording }) => {
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(
    selectedRecordingIdAtom
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
              <span>{formatDuration(recording.duration)}</span>
              <span>•</span>
              <span>{format(recording.createdAt, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <RecordingItemMenu recording={recording} />
      </div>
      {isSelected && recordingData && (
        <AudioPlayer
          duration={recording.duration}
          recordingUrl={URL.createObjectURL(recordingData)}
        />
      )}
    </div>
  );
};
