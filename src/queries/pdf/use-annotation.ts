import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbService } from "@/lib/db";
import { Annotation } from "@/db/schema";

export const useAnnotation = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["annotations", id],
    queryFn: () => dbService.annotation.getAnnotation(id),
  });
};

export const useAnnotations = ({ pdfId }: { pdfId: string }) => {
  return useQuery({
    queryKey: ["annotations", "pdf", pdfId],
    queryFn: () => dbService.annotation.getAnnotations({ pdfId }),
  });
};

export const useAnnotationsByPage = ({ pdfId }: { pdfId: string }) => {
  const { data: annotations } = useAnnotations({ pdfId });
  const annotationsByPage: Record<number, Annotation[]> = {};
  if (!annotations) return annotationsByPage;

  annotations.forEach((annotation) => {
    if (!annotationsByPage[annotation.page]) {
      annotationsByPage[annotation.page] = [];
    }
    annotationsByPage[annotation.page].push(annotation);
  });

  return annotationsByPage;
};

export const useCreateAnnotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (annotation: Omit<Annotation, "id">) => {
      const id = await dbService.annotation.createAnnotation({ annotation });
      return { id, ...annotation };
    },
    onSuccess: (annotation) => {
      queryClient.setQueryData<Annotation>(
        ["annotations", annotation.id],
        annotation
      );
      queryClient.setQueryData<Annotation[]>(
        ["annotations", "pdf", annotation.pdfId],
        (oldData) => {
          if (!oldData) return [annotation];
          return [...oldData, annotation];
        }
      );
    },
  });
};

export const useRemoveAnnotations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: { pdfId: string; ids: string[] }) => {
      await dbService.annotation.removeAnnotations({ ids });
    },
    onSuccess: (_, { pdfId, ids }) => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", "pdf", pdfId],
      });
      // Invalidate individual annotation queries
      ids.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["annotations", id] });
      });
    },
  });
};
