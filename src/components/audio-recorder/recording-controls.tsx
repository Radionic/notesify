import { useSetAtom } from "jotai";
import { Mic, Pause, Play, Square } from "lucide-react";
import { isRecordingAtom } from "@/atoms/recording/audio-recorder";
import { Button } from "@/components/ui/button";
import type { Recording } from "@/db/schema";
import { useRecorder } from "@/hooks/recording/use-recorder";
import { formatDuration } from "@/lib/audio/utils";
import { generateId } from "@/lib/id";
import { useAddRecording } from "@/queries/recording/use-recording";

export const RecordingControls = () => {
  const { mutateAsync: addRecording } = useAddRecording();
  const setIsRecording = useSetAtom(isRecordingAtom);

  const {
    status,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecorder({
    onStart: () => setIsRecording(true),
    onPause: () => setIsRecording(false),
    onResume: () => setIsRecording(true),
    onStop: async ({ blob, duration }) => {
      setIsRecording(false);

      const recordingId = generateId();
      const durationMs = Math.max(Math.round(duration), 1000);
      const recording: Recording = {
        id: recordingId,
        name: `New Recording`,
        duration: durationMs,
        createdAt: new Date(),
      };
      await addRecording({ recording, recordingData: blob });
    },
  });

  return (
    <div className="border-t p-4">
      <div className="flex flex-col items-center gap-4">
        {status !== "inactive" && (
          <div className="text-lg font-medium">
            {formatDuration(duration / 1000)}
          </div>
        )}
        <div className="flex justify-center items-center gap-6">
          {status === "inactive" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-red-100 hover:bg-red-200"
              onClick={startRecording}
            >
              <Mic className="h-6 w-6 text-red-600" />
            </Button>
          ) : status === "recording" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={pauseRecording}
              >
                <Pause className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-100 hover:bg-red-200"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={resumeRecording}
              >
                <Play className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-100 hover:bg-red-200"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 text-red-600" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
