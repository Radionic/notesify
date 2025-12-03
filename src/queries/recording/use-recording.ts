import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Recording } from "@/db/schema";
import {
  addRecordingFn,
  getRecordingFn,
  getRecordingsFn,
  removeRecordingFn,
  updateRecordingFn,
} from "@/server/recording";
import { removeFileFn, uploadFileFn } from "@/server/storage";

export const useRecording = ({ id }: { id: string }) =>
  useQuery({
    queryKey: ["recording", id],
    queryFn: () => getRecordingFn({ data: { id } }),
    enabled: !!id,
  });

export const recordingsQueryOptions = () =>
  queryOptions({
    queryKey: ["recordings"],
    queryFn: () => getRecordingsFn({ data: {} }),
  });
export const useRecordings = () => useQuery(recordingsQueryOptions());

export const useAddRecording = () => {
  const queryClient = useQueryClient();
  const addRecording = useServerFn(addRecordingFn);

  return useMutation({
    mutationFn: async ({
      recording,
      recordingData,
    }: {
      recording: Recording;
      recordingData: Blob;
    }) => {
      const formData = new FormData();
      formData.append("type", "recordings");
      formData.append("filename", `${recording.id}.webm`);
      formData.append("file", recordingData);

      await uploadFileFn({ data: formData });
      await addRecording({ data: { recording } });
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
  const removeRecording = useServerFn(removeRecordingFn);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await removeRecording({ data: { id } });
      await removeFileFn({
        data: { type: "recordings", filename: `${id}.webm` },
      });
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
  const updateRecording = useServerFn(updateRecordingFn);

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await updateRecording({ data: { id, name } });
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
