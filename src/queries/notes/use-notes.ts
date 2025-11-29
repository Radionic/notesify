import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Notes } from "@/db/schema";
import {
  createNotesFn,
  getNotesFn,
  getNotesForPdfFn,
  updateNotesFn,
} from "@/server/notes";

export const useNotes = ({
  notesId,
  pdfId,
}: {
  notesId?: string;
  pdfId?: string;
}) => {
  const getNotes = useServerFn(getNotesFn);
  const getNotesForPdf = useServerFn(getNotesForPdfFn);

  return useQuery({
    queryKey: ["notes", notesId],
    queryFn: async () => {
      return notesId
        ? getNotes({ data: { notesId } })
        : getNotesForPdf({ data: { pdfId: pdfId! } });
    },
    retry: 0,
    enabled: !!notesId || !!pdfId,
    throwOnError: true,
  });
};

export const useCreateNotes = () => {
  const queryClient = useQueryClient();
  const createNotes = useServerFn(createNotesFn);

  return useMutation({
    mutationFn: async ({ pdfId }: { pdfId: string }) => {
      return await createNotes({ data: { pdfId } });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["notes", result.id], result);
    },
  });
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();
  const updateNotes = useServerFn(updateNotesFn);

  return useMutation({
    mutationFn: async ({
      notesId,
      content,
    }: {
      notesId: string;
      content: any;
    }) => {
      await updateNotes({ data: { notesId, content } });
    },
    onSuccess: (_, { notesId, content }) => {
      queryClient.setQueryData<Notes>(["notes", notesId], (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          content,
        };
      });
    },
  });
};
