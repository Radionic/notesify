import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbService } from "@/lib/db";
import { Annotation } from "@/db/schema";
import { useSetAtom } from "jotai";
import { pushActionAtom } from "@/actions/pdf/history";

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
  const pushHistory = useSetAtom(pushActionAtom);

  return useMutation({
    mutationFn: async ({
      annotations,
      saveHistory = true,
    }: {
      annotations: Omit<Annotation, "id">[];
      saveHistory?: boolean;
    }) => {
      const newAnnotations = await dbService.annotation.createAnnotations({
        annotations,
      });
      if (saveHistory) {
        pushHistory({
          action: "create",
          type: "annotation",
          pdfId: annotations[0].pdfId,
          data: newAnnotations,
        });
      }
      return newAnnotations;
    },
    onSuccess: (annotations) => {
      queryClient.setQueryData<Annotation[]>(
        ["annotations", "pdf", annotations[0].pdfId],
        (oldData = []) => [...oldData, ...annotations]
      );
    },
  });
};

export const useDeleteAnnotations = () => {
  const queryClient = useQueryClient();
  const pushHistory = useSetAtom(pushActionAtom);

  return useMutation({
    mutationFn: async ({
      ids,
      pdfId,
      saveHistory = true,
    }: {
      ids: string[];
      pdfId: string;
      saveHistory?: boolean;
    }) => {
      if (ids.length === 0) return;

      await dbService.annotation.deleteAnnotations({ ids });
      if (saveHistory) {
        const annotations = queryClient.getQueryData<Annotation[]>([
          "annotations",
          "pdf",
          pdfId,
        ]);
        if (annotations) {
          pushHistory({
            action: "delete",
            type: "annotation",
            data: annotations,
            pdfId,
          });
        }
      }
    },
    onSuccess: (_, { ids, pdfId }) => {
      queryClient.setQueryData<Annotation[]>(
        ["annotations", "pdf", pdfId],
        (oldData = []) => oldData.filter((a) => !ids.includes(a.id))
      );
    },
  });
};
