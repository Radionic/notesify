import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Recording } from "@/db/schema";
import { dbService } from "@/lib/db";
import { readNativeFile, removeNativeFile, writeNativeFile } from "@/lib/tauri";

export const recordingQueryOptions = ({
  id,
  enabled,
}: {
  id: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["recording", id],
    queryFn: () => dbService.recording.getRecording({ id }),
    enabled,
  });
export const useRecording = ({
  id,
  enabled,
}: {
  id: string;
  enabled?: boolean;
}) => useQuery(recordingQueryOptions({ id, enabled }));

export const recordingDataQueryOptions = ({
  id,
  enabled,
}: {
  id: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["recording-data", id],
    queryFn: () => readNativeFile("recordings", `${id}.webm`),
    enabled,
  });
export const useRecordingData = ({
  id,
  enabled,
}: {
  id: string;
  enabled?: boolean;
}) => useQuery(recordingDataQueryOptions({ id, enabled }));

export const recordingsQueryOptions = () =>
  queryOptions({
    queryKey: ["recordings"],
    queryFn: dbService.recording.getRecordings,
  });
export const useRecordings = () => useQuery(recordingsQueryOptions());

export const useAddRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recording,
      recordingData,
    }: {
      recording: Recording;
      recordingData: Blob;
    }) => {
      await writeNativeFile(
        "recordings",
        `${recording.id}.webm`,
        recordingData,
      );
      await dbService.recording.addRecording({ recording });
    },
    onSuccess: (_, { recording, recordingData }) => {
      queryClient.setQueryData<Recording>(
        ["recording", recording.id],
        recording,
      );
      queryClient.setQueryData<Recording[]>(["recordings"], (oldRecordings) => {
        if (!oldRecordings) return [recording];
        return [recording, ...oldRecordings];
      });
      queryClient.setQueryData<Blob>(
        ["recording-data", recording.id],
        recordingData,
      );
    },
  });
};

export const useRemoveRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await dbService.recording.removeRecording({ id });
      await removeNativeFile("recordings", `${id}.webm`);
    },
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<Recording[]>(["recordings"], (oldRecordings) => {
        if (!oldRecordings) return [];
        return oldRecordings.filter((recording) => recording.id !== id);
      });
      queryClient.removeQueries({ queryKey: ["recording", id] });
      queryClient.removeQueries({ queryKey: ["recording-data", id] });
    },
  });
};

export const useRenameRecording = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await dbService.recording.updateRecording({ id, name });
    },
    onSuccess: (_, { id, name }) => {
      queryClient.setQueryData<Recording>(["recording", id], (oldRecording) => {
        if (!oldRecording) return undefined;
        return { ...oldRecording, name };
      });
      queryClient.setQueryData<Recording[]>(["recordings"], (oldRecordings) => {
        if (!oldRecordings) return [];
        return oldRecordings.map((recording) =>
          recording.id === id ? { ...recording, name } : recording,
        );
      });
    },
  });
};
