import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Annotation } from "@/db/schema";
import { dbService } from "@/lib/db";
import { usePushHistory } from "./use-pdf-history";

// export const useAnnotation = ({ id }: { id: string }) => {
//   return useQuery({
//     queryKey: ["annotations", id],
//     queryFn: () => dbService.annotation.getAnnotation(id),
//   });
// };

export const useAnnotations = ({ pdfId }: { pdfId: string }) =>
  useQuery({
    queryKey: ["annotations", "pdf", pdfId],
    queryFn: () => dbService.annotation.getAnnotations({ pdfId }),
  });

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

export const useCreateAnnotations = () => {
  const queryClient = useQueryClient();
  const { pushHistory } = usePushHistory();

  return useMutation({
    mutationFn: async ({
      annotations,
    }: {
      annotations: Annotation[];
      saveHistory?: boolean;
    }) => {
      await dbService.annotation.createAnnotations({
        annotations,
      });
    },
    onMutate: ({ annotations, saveHistory = true }) => {
      if (saveHistory) {
        pushHistory({
          action: "create",
          type: "annotation",
          pdfId: annotations[0].pdfId,
          data: annotations,
        });
      }
      queryClient.setQueryData<Annotation[]>(
        ["annotations", "pdf", annotations[0].pdfId],
        (oldData = []) => [...oldData, ...annotations],
      );
    },
  });
};

export const useDeleteAnnotations = () => {
  const queryClient = useQueryClient();
  const { pushHistory } = usePushHistory();

  return useMutation({
    mutationFn: async ({
      ids,
    }: {
      ids: string[];
      pdfId: string;
      saveHistory?: boolean;
    }) => {
      await dbService.annotation.deleteAnnotations({ ids });
    },
    onMutate: ({ ids, pdfId, saveHistory = true }) => {
      if (saveHistory) {
        const annotations = queryClient
          .getQueryData<Annotation[]>(["annotations", "pdf", pdfId])
          ?.filter((a) => ids.includes(a.id));
        if (annotations) {
          pushHistory({
            action: "delete",
            type: "annotation",
            data: annotations,
            pdfId,
          });
        }
      }
      queryClient.setQueryData<Annotation[]>(
        ["annotations", "pdf", pdfId],
        (oldData = []) => oldData.filter((a) => !ids.includes(a.id)),
      );
    },
  });
};
