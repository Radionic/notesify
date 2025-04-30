import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Highlight } from "@/db/schema/pdf/highlights";
import { dbService } from "@/lib/db";
import { toast } from "sonner";

export const useHighlight = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["highlights", id],
    queryFn: () => dbService.highlight.getHighlight({ id }),
  });
};

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

export const useAddHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlight: Omit<Highlight, "id">) => {
      const highlightId = await dbService.highlight.addHighlight({ highlight });
      return { id: highlightId, ...highlight };
    },
    onSuccess: (highlight) => {
      queryClient.setQueryData<Highlight>(
        ["highlights", highlight.id],
        highlight
      );
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

  return useMutation({
    mutationFn: async ({
      pdfId,
      highlightId,
    }: {
      pdfId: string;
      highlightId: string;
    }) => {
      await dbService.highlight.deleteHighlight({ id: highlightId });
      return { pdfId, highlightId };
    },
    onSuccess: ({ pdfId, highlightId }) => {
      queryClient.removeQueries({ queryKey: ["highlights", highlightId] });
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

  return useMutation({
    mutationFn: async ({
      pdfId,
      highlightId,
      color,
    }: {
      pdfId: string;
      highlightId: string;
      color: string;
    }) => {
      await dbService.highlight.updateHighlight({ id: highlightId, color });
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
      queryClient.setQueryData(
        ["highlights", highlightId],
        (oldData: Highlight | null) => {
          return oldData ? { ...oldData, color } : null;
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
