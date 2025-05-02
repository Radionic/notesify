import {
  LengthType,
  QualityType,
} from "@/components/plate-ui/custom/generate-notes-dialog";
import { formatMessages, replaceImageReferences } from "@/lib/note/summary";
import { useSetAtom } from "jotai";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { streamText } from "ai";
import { generatingNotesAtom } from "@/atoms/notes/notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbService } from "@/lib/db";
import { Notes } from "@/db/schema";
import { parsePdf } from "@/lib/pdf/parsing";

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

export const useGenerateSummary = ({ notesId }: { notesId: string }) => {
  const getModel = useSetAtom(getSelectedModelAtom);
  const setGeneratingSignal = useSetAtom(generatingNotesAtom(notesId));

  const generateSummary = async ({
    pdfId,
    length,
    quality,
    onUpdate,
  }: {
    pdfId: string;
    length: LengthType;
    quality: QualityType;
    onUpdate?: (summaryPart: string) => void;
  }) => {
    const parsedPdf = await parsePdf({
      pdfId,
      method: quality === "Standard" ? "pdfjs" : "ocr",
    });

    const text = parsedPdf.map((p) => p.text).join("\n");
    const images = parsedPdf
      .map((p) => p.images)
      .flat()
      .filter((img) => img !== null);
    const messages = formatMessages(text, length, images);

    const abortSignal = new AbortController();
    setGeneratingSignal(abortSignal);

    const model = await getModel("Chat");
    if (!model) {
      return;
    }
    const res = await streamText({
      model,
      messages,
      abortSignal: abortSignal.signal,
      maxTokens: 8192,
    });

    let summaryPart = "";
    let lastUpdateTime = Date.now();
    const updateInterval = 3000;

    for await (const chunk of res.textStream) {
      console.log(chunk);
      if (!chunk) continue;
      summaryPart += chunk;
      // console.log(chunk);

      // Check if we have a new section starting (a line beginning with "## ")
      if (
        summaryPart.match(/\n## [^\n]+/) &&
        Date.now() - lastUpdateTime > updateInterval
      ) {
        const lastSectionPos = summaryPart.lastIndexOf("\n## ");
        const completedSection = summaryPart.substring(0, lastSectionPos);
        summaryPart = summaryPart.substring(lastSectionPos);

        onUpdate?.(
          images
            ? replaceImageReferences(completedSection, images)
            : completedSection
        );
        lastUpdateTime = Date.now();
      }
    }

    onUpdate?.(summaryPart);

    setGeneratingSignal(undefined);
  };

  return useMutation({
    mutationFn: generateSummary,
  });
};
