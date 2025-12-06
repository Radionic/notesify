import { Plus } from "lucide-react";
import { BsFiletypeDoc, BsFiletypePdf, BsFiletypePpt } from "react-icons/bs";
import { toast } from "sonner";
import { FileInput, FileUploader } from "@/components/ui/file-uploader";
import { cn } from "@/lib/utils";
import { useAddPdf } from "@/queries/file-system/use-file-system";
import { useConvertPdf, useNavigatePdf } from "@/queries/pdf/use-pdf";
import { Spinner } from "../ui/spinner";

const FileSvgDraw = ({
  thin,
  uploading,
}: {
  thin?: boolean;
  uploading?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center flex-col border border-dashed border-gray-400 rounded-md",
        thin ? "h-fit w-full py-2 mt-2" : "h-48 w-80",
        uploading && "opacity-60 pointer-events-none",
      )}
    >
      {uploading ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner />
          Uploading...
        </div>
      ) : thin ? (
        <Plus className="text-gray-500 w-4 h-4" />
      ) : (
        <>
          <div className="flex items-center justify-center space-x-3 mb-2">
            {/* <BsFiletypeDoc className="text-gray-500 w-8 h-8" /> */}
            <BsFiletypePdf className="text-gray-500 w-8 h-8" />
            {/* <BsFiletypePpt className="text-gray-500 w-8 h-8" /> */}
          </div>
          <p className="my-1 text-sm text-gray-500 font-semibold">
            Drag and drop a file
          </p>
          <p className="text-xs text-gray-500">Or click to select</p>
        </>
      )}
    </div>
  );
};

export const PdfFileUploader = ({
  className,
  thin,
  parentId = null,
}: {
  className?: string;
  thin?: boolean;
  parentId?: string | null;
}) => {
  const { navigatePdf } = useNavigatePdf();
  const { mutateAsync: convertToPdf, isPending: convertingPdf } =
    useConvertPdf();
  const { mutateAsync: addPdf, isPending: addingPdf } = useAddPdf();
  const isLoading = convertingPdf || addingPdf;

  const loadPdfFromBlob = async (
    data: Blob,
    fileName: string,
    originalType?: string,
  ) => {
    if (originalType !== "application/pdf") {
      data = await toast
        .promise(convertToPdf({ file: data, filename: fileName }), {
          loading: `Converting ${fileName} to PDF...`,
          success: `Converted ${fileName} to PDF`,
          error: `Failed to convert ${fileName} to PDF`,
        })
        .unwrap();
    }

    const { newPdf } = await addPdf({
      name: fileName,
      pdfData: data,
      parentId,
    });
    if (!newPdf) {
      return;
    }
    navigatePdf({ pdfId: newPdf.id });
  };

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      // "application/msword": [".doc"],
      // "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      //   [".docx"],
      // "application/vnd.ms-powerpoint": [".ppt"],
      // "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      //   [".pptx"],
    },
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <FileUploader
        value={[]}
        onValueChange={async (files) => {
          if (isLoading) return;
          const file = files?.[0];
          if (file) {
            const blob = new Blob([file], { type: file.type });
            await loadPdfFromBlob(blob, file.name, file.type);
          }
        }}
        dropzoneOptions={dropZoneConfig}
      >
        <FileInput>
          <FileSvgDraw uploading={isLoading} thin={thin} />
        </FileInput>
      </FileUploader>
    </div>
  );
};
