import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Highlight } from "@/db/schema/pdf/highlights";
import { dbService } from "@/lib/db";
import { toast } from "sonner";
import { usePushHistory } from "./use-pdf-history";

// export const useHighlight = ({ id }: { id: string }) => {
//   return useQuery({
//     queryKey: ["highlights", id],
//     queryFn: () => dbService.highlight.getHighlight({ id }),
//   });
// };

export const useHighlights = ({ pdfId }: { pdfId: string }) => {
  return useQuery({
    queryKey: ["highlights", "pdf", pdfId],
    queryFn: () => dbService.highlight.getHighlights({ pdfId }),
  });
};

export const useHighlightsByPage = ({ pdfId }: { pdfId: string }) => {
  const { data: highlights } = useHighlights({ pdfId });
  const highlightsByPage: Record<number, Highlight[]> = {};
  if (!highlights) return highlightsByPage;

  highlights.forEach((highlight) => {
    // Group rects by page number
    const pages = new Set(highlight.rects.map((rect) => rect.page));

    pages.forEach((page) => {
      const pageRects = highlight.rects.filter((rect) => rect.page === page);
      const pageHighlight = { ...highlight, rects: pageRects };

      if (!highlightsByPage[page]) {
        highlightsByPage[page] = [];
      }
      highlightsByPage[page].push(pageHighlight);
    });
  });

  return highlightsByPage;
};

export const useCreateHighlight = () => {
  const queryClient = useQueryClient();
  const { pushHistory } = usePushHistory();

  return useMutation({
    mutationFn: async ({
      highlight,
    }: {
      highlight: Highlight;
      saveHistory?: boolean;
    }) => {
      await dbService.highlight.addHighlight({ highlight });
    },
    onMutate: ({ highlight, saveHistory = true }) => {
      if (saveHistory) {
        pushHistory({
          action: "create",
          type: "highlight",
          pdfId: highlight.pdfId,
          data: highlight,
        });
      }

      queryClient.setQueryData<Highlight[]>(
        ["highlights", "pdf", highlight.pdfId],
        (oldData) => {
          if (!oldData) return [highlight];
          return [...oldData, highlight];
        }
      );
    },
  });
};

export const useDeleteHighlight = () => {
  const queryClient = useQueryClient();
  const { pushHistory } = usePushHistory();

  return useMutation({
    mutationFn: async ({
      highlightId,
    }: {
      pdfId: string;
      highlightId: string;
      saveHistory?: boolean;
    }) => {
      await dbService.highlight.deleteHighlight({ id: highlightId });
    },
    onMutate: ({ pdfId, highlightId, saveHistory = true }) => {
      if (saveHistory) {
        const highlight = queryClient
          .getQueryData<Highlight[]>(["highlights", "pdf", pdfId])
          ?.find((h) => h.id === highlightId);
        if (highlight) {
          pushHistory({
            action: "delete",
            type: "highlight",
            pdfId,
            data: highlight,
          });
        }
      }

      queryClient.setQueryData<Highlight[]>(
        ["highlights", "pdf", pdfId],
        (oldData: Highlight[] = []) => {
          return oldData.filter((h) => h.id !== highlightId);
        }
      );
    },
  });
};

export const useChangeHighlightColor = () => {
  const queryClient = useQueryClient();
  const { pushHistory } = usePushHistory();

  return useMutation({
    mutationFn: async ({
      highlightId,
      color,
    }: {
      pdfId: string;
      highlightId: string;
      color: string;
      saveHistory?: boolean;
    }) => {
      await dbService.highlight.updateHighlight({ id: highlightId, color });
    },
    onMutate: ({ pdfId, highlightId, color, saveHistory = true }) => {
      if (saveHistory) {
        const oldHighlight = queryClient
          .getQueryData<Highlight[]>(["highlights", "pdf", pdfId])
          ?.find((h) => h.id === highlightId);
        if (oldHighlight) {
          pushHistory({
            action: "update",
            type: "highlight",
            pdfId,
            data: { ...oldHighlight, color },
            oldData: oldHighlight,
          });
        }
      }

      queryClient.setQueryData(
        ["highlights", "pdf", pdfId],
        (oldData: Highlight[] = []) => {
          return oldData.map((h) =>
            h.id === highlightId ? { ...h, color } : h
          );
        }
      );
    },
  });
};

export const useCopyHighlight = () => {
  return useMutation({
    mutationFn: async (text: string) => {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    },
  });
};
