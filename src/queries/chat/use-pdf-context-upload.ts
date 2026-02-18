import { useMutation } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import { activeContextsAtom, type PdfContext } from "@/atoms/chat/contexts";
import { useDeleteFile } from "../file-system/use-file-upload";
import { useUploadPdf } from "../file-system/use-upload-pdf";

export const useUploadPdfContext = ({
  mutationKey,
}: {
  mutationKey?: string;
} = {}) => {
  const setContexts = useSetAtom(activeContextsAtom);

  const { mutateAsync: upload, ...rest } = useUploadPdf({
    mutationKey: ["upload-context", mutationKey],
    onSuccess: ({ newFile }) => {
      setContexts((prev) => [...prev, { type: "pdf", fileId: newFile.id }]);
    },
  });

  const mutateAsync = ({ file }: { file: File }) =>
    upload({ file, parentId: null, inLibrary: false });

  return { mutateAsync, ...rest };
};

export const useRemovePdfContext = () => {
  const [contexts, setContexts] = useAtom(activeContextsAtom);
  const { mutateAsync: deleteFile } = useDeleteFile();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const target = contexts.find(
        (c): c is PdfContext => c.type === "pdf" && c.fileId === fileId,
      );
      if (!target) throw new Error("Context not found");
      await deleteFile({ fileId: target.fileId });
      setContexts((prev) =>
        prev.filter((c) => c.type !== "pdf" || c.fileId !== fileId),
      );
    },
    onError: () => {
      toast.error("Failed to remove PDF");
    },
  });
};
