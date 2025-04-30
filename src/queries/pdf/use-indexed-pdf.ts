import { getSelectedModelAtom } from "@/actions/setting/providers";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useGetPdfTexts, useParsePdf } from "./use-parsed-pdf";
import { indexPages } from "@/lib/pdf/indexing";
import { PDFIndexingLevel } from "@/db/schema";
import { generateObject } from "ai";
import { z } from "zod";

export const indexedPdfQueryOptions = ({ pdfId }: { pdfId: string }) =>
  queryOptions({
    queryKey: ["indexed-pdf", pdfId],
  });
export const useIndexedPdf = ({ pdfId }: { pdfId: string }) =>
  useQuery(indexedPdfQueryOptions({ pdfId }));

export const useIndexPdf = () => {
  const queryClient = useQueryClient();
  const getModel = useSetAtom(getSelectedModelAtom);
  const { mutateAsync: parsePdf } = useParsePdf();

  return useMutation({
    mutationFn: async ({ pdfId }: { pdfId: string }) => {
      const model = getModel("Indexing");
      const parsedPdf = await parsePdf({ pdfId });

      const result = await indexPages({ model, parsedPdf });
      const formattedResult = result.map((r) => ({
        id: `${pdfId}-${r.page}`,
        pdfId,
        model: model.modelId,
        summary: r.summary,
        level: "page" as PDFIndexingLevel,
        startPage: r.page,
        endPage: null,
      }));
      return formattedResult;
    },
    onSuccess: (result, { pdfId }) => {
      queryClient.setQueryData(["indexed-pdf", pdfId], result);
    },
  });
};

export const useSearchPdfPages = () => {
  const getModel = useSetAtom(getSelectedModelAtom);
  const { mutateAsync: getPdfTexts } = useGetPdfTexts();
  const { mutateAsync: indexPdf } = useIndexPdf();

  return useMutation({
    mutationFn: async ({ pdfId, query }: { pdfId: string; query: string }) => {
      const indexedPdf = await indexPdf({ pdfId });

      const model = getModel("Indexing");
      const pageSummaries = indexedPdf
        .map((p) => `PAGE ${p.startPage}:\n${p.summary}`)
        .join("\n\n");
      // console.log("Page summaries", pageSummaries);

      try {
        const res = await generateObject({
          model,
          output: "array",
          schema: z.number().describe("Page number"),
          prompt: `Find at most 10 relevant pages for the following query. Return only page numbers.
          
          Query:
          ${query}
          
          Page summaries:
          ${pageSummaries}`,
          maxTokens: 64,
        });
        const pages = res.object;

        const pageTexts = await getPdfTexts({ pdfId, pages });
        // console.log("Search pages result", pages);
        return { pages, pageTexts };
      } catch (error) {
        console.error(error);
        throw new Error(
          "Failed to search pages. Try to use another Indexing model."
        );
      }
    },
  });
};
