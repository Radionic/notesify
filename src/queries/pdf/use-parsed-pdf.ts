import { getDocumentAtom } from "@/actions/pdf/pdf-viewer";
import {
  configuredProvidersAtom,
  openSettingsDialogAtom,
} from "@/atoms/setting/providers";
import { ParsedPDF, parsePdf, parsePdfWithOcr } from "@/lib/pdf/parsing";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { pdfDataQueryOptions } from "./use-pdf";

export const parsedPdfQueryOptions = ({ pdfId }: { pdfId: string }) =>
  queryOptions({
    queryKey: ["parsed-pdf", pdfId],
  });
export const useParsedPdf = ({ pdfId }: { pdfId: string }) =>
  useQuery(parsedPdfQueryOptions({ pdfId }));

export const useParsePdf = () => {
  const queryClient = useQueryClient();
  const apiKey = useAtomValue(configuredProvidersAtom).find(
    (p) => p.type === "mistral"
  )?.settings.apiKey;
  const setOpenSettingsDialog = useSetAtom(openSettingsDialogAtom);
  const getDocument = useSetAtom(getDocumentAtom);

  return useMutation({
    mutationFn: async ({
      pdfId,
      method,
    }: {
      pdfId: string;
      method?: "ocr" | "pdfjs";
    }) => {
      // Default to ocr if no method is specified and API key is available
      method = method || (apiKey ? "ocr" : "pdfjs");
      console.log("Parsing PDF: ", method);

      if (method === "pdfjs") {
        const pdfDocument = getDocument(pdfId);
        if (!pdfDocument) {
          throw new Error("Failed to get PDF");
        }

        const result = await parsePdf({ pdfId, pdfDocument });
        return result;
      } else {
        const pdfData = await queryClient.fetchQuery(
          pdfDataQueryOptions({ pdfId })
        );
        if (!pdfData) {
          throw new Error("PDF not found");
        }

        if (!apiKey) {
          setOpenSettingsDialog(true);
          throw new Error("Please configure the Mistral provider");
        }

        const result = await parsePdfWithOcr({
          apiKey,
          pdfId,
          pdfData,
        });
        return result;
      }
    },
    onSuccess: (result, { pdfId }) => {
      queryClient.setQueryData<ParsedPDF>(["parsed-pdf", pdfId], result);
    },
  });
};

export const useGetPdfTexts = () => {
  const { mutateAsync: parsePdf } = useParsePdf();

  return useMutation({
    mutationFn: async ({
      pdfId,
      pages,
      startPage = 1,
      endPage,
    }: {
      pdfId: string;
      pages?: number[];
      startPage?: number;
      endPage?: number;
    }) => {
      const parsedPdf = await parsePdf({ pdfId });
      const maxPage = parsedPdf.length;

      // Validate input parameters
      if (startPage > (endPage ?? maxPage)) {
        throw new Error(`Invalid page range: ${startPage} - ${endPage}`);
      }
      if (startPage < 1 || startPage > maxPage) {
        throw new Error(`Invalid start page: ${startPage}`);
      }
      if (endPage && (endPage < 1 || endPage > maxPage)) {
        throw new Error(`Invalid end page: ${endPage}`);
      }

      return parsedPdf
        .filter((p) => {
          const inRange = p.page >= startPage && p.page <= (endPage ?? maxPage);
          const inSpecifiedPages = !pages || pages.includes(p.page);
          return inRange && inSpecifiedPages;
        })
        .map((p) => `<page_${p.page}>\n${p.text}\n</page_${p.page}>`)
        .join("\n\n");
    },
  });
};
