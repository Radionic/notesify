import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbService } from "@/lib/db";
import { Notes } from "@/db/schema";

export const useNotes = ({
  notesId,
  pdfId,
}: {
  notesId?: string;
  pdfId?: string;
}) =>
  useQuery({
    queryKey: ["notes", notesId],
    queryFn: async () => {
      return notesId
        ? dbService.notes.getNotes({ notesId })
        : dbService.notes.getNotesForPdf({ pdfId: pdfId! });
    },
    retry: 0,
    enabled: !!notesId || !!pdfId,
    throwOnError: true,
  });

export const useCreateNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pdfId }: { pdfId: string }) => {
      return await dbService.notes.createNotes({ pdfId });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["notes", result.id], result);
    },
  });
};

export const useUpdateNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notesId,
      content,
    }: {
      notesId: string;
      content: any;
    }) => {
      await dbService.notes.updateNotes({ notesId, content });
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
