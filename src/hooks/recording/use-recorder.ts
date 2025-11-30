import { useEffect, useRef, useState } from "react";

interface RecorderOptions {
  type?: string; // Media type for the recording, e.g. "audio/webm"
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (data: { blob: Blob; blobUrl: string; duration: number }) => void;
}

type RecordingStatus = "inactive" | "recording" | "paused";

export function useRecorder({
  type = "audio/webm",
  onStart,
  onPause,
  onResume,
  onStop,
}: RecorderOptions = {}) {
  const [status, setStatus] = useState<RecordingStatus>("inactive");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDurationRef = useRef<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [blobUrl, setBlobUrl] = useState<string>("");

  const clearRecordingData = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl("");
    }

    mediaChunks.current = [];
    setDuration(0);
    startTimeRef.current = 0;
    accumulatedDurationRef.current = 0;
  };

  const updateDuration = () => {
    if (startTimeRef.current) {
      const currentSessionDuration = Date.now() - startTimeRef.current;
      const totalDuration =
        accumulatedDurationRef.current + currentSessionDuration;
      setDuration(totalDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const startRecording = async () => {
    clearRecordingData();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: type });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(mediaChunks.current, { type });
        const tracks = stream.getTracks();

        // Stop all tracks to release microphone
        tracks.forEach((track) => track.stop());

        // Clear the interval
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
          durationInterval.current = null;
        }

        // Calculate final duration
        const currentSessionDuration = startTimeRef.current
          ? Date.now() - startTimeRef.current
          : 0;
        const finalDuration =
          accumulatedDurationRef.current + currentSessionDuration;

        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);

        setStatus("inactive");

        onStop?.({
          blob,
          duration: finalDuration,
          blobUrl: newBlobUrl,
        });
      };

      // Start recording
      mediaRecorder.current.start(100); // collect data every 100ms
      startTimeRef.current = Date.now();
      durationInterval.current = setInterval(updateDuration, 100);

      setStatus("recording");
      onStart?.();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && status === "recording") {
      mediaRecorder.current.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && status === "recording") {
      mediaRecorder.current.pause();

      // When pausing, add the current session duration to the accumulated total
      if (startTimeRef.current) {
        const currentSessionDuration = Date.now() - startTimeRef.current;
        accumulatedDurationRef.current += currentSessionDuration;
      }

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      setStatus("paused");
      onPause?.();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && status === "paused") {
      mediaRecorder.current.resume();
      startTimeRef.current = Date.now();
      durationInterval.current = setInterval(updateDuration, 100);
      setStatus("recording");
      onResume?.();
    }
  };

  return {
    status,
    duration,
    blobUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
