import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Highlight } from "@/db/schema/pdf/highlights";
import { dbService } from "@/lib/db";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { pushActionAtom } from "@/actions/pdf/history";

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
  const pushHistory = useSetAtom(pushActionAtom);

  return useMutation({
    mutationFn: async ({
      highlight,
      saveHistory = true,
    }: {
      highlight: Omit<Highlight, "id">;
      saveHistory?: boolean;
    }) => {
      const highlightId = await dbService.highlight.addHighlight({ highlight });
      const newHighlight = { id: highlightId, ...highlight };

      if (saveHistory) {
        pushHistory({
          action: "create",
          type: "highlight",
          pdfId: highlight.pdfId,
          data: newHighlight,
        });
      }

      return newHighlight;
    },
    onSuccess: (highlight) => {
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
  const pushHistory = useSetAtom(pushActionAtom);

  return useMutation({
    mutationFn: async ({
      pdfId,
      highlightId,
      saveHistory = true,
    }: {
      pdfId: string;
      highlightId: string;
      saveHistory?: boolean;
    }) => {
      await dbService.highlight.deleteHighlight({ id: highlightId });

      if (saveHistory) {
        const highlights = queryClient.getQueryData<Highlight[]>([
          "highlights",
          "pdf",
          pdfId,
        ]);
        const highlight = highlights?.find((h) => h.id === highlightId);
        if (highlight) {
          pushHistory({
            action: "delete",
            type: "highlight",
            pdfId,
            data: highlight,
          });
        }
      }

      return { pdfId, highlightId };
    },
    onSuccess: ({ pdfId, highlightId }) => {
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
  const pushHistory = useSetAtom(pushActionAtom);

  return useMutation({
    mutationFn: async ({
      pdfId,
      highlightId,
      color,
      saveHistory = true,
    }: {
      pdfId: string;
      highlightId: string;
      color: string;
      saveHistory?: boolean;
    }) => {
      await dbService.highlight.updateHighlight({ id: highlightId, color });

      if (saveHistory) {
        const highlights = queryClient.getQueryData<Highlight[]>([
          "highlights",
          "pdf",
          pdfId,
        ]);
        const oldHighlight = highlights?.find((h) => h.id === highlightId);
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

      return { pdfId, highlightId, color };
    },
    onSuccess: ({ pdfId, highlightId, color }) => {
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
