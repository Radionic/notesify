import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useFile } from "@/queries/file-system/use-file-system";
import { useDownloadImage } from "@/queries/images/use-images";

export const ImageToolbar = ({ imageId }: { imageId: string }) => {
  const { data: file, isLoading } = useFile({ id: imageId });
  const { mutateAsync: downloadImage } = useDownloadImage();
  const navigate = useNavigate();

  return (
    <Card className="sticky top-0 h-9 flex flex-row items-center gap-0.5 border-2 border-transparent z-30 rounded-none bg-header">
      <TooltipButton
        tooltip="Back to Library"
        onClick={() =>
          navigate({
            to: "/viewer",
            search: (prev) => ({
              ...prev,
              sid: undefined,
              type: undefined,
              so: true,
            }),
          })
        }
      >
        <ArrowLeft />
      </TooltipButton>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      <div className="flex flex-row items-center gap-2 px-2 overflow-hidden">
        {isLoading ? (
          <Spinner className="text-muted-foreground h-4 w-4" />
        ) : (
          <span className="truncate text-sm font-medium">
            {file?.name || "Unknown Image"}
          </span>
        )}
      </div>

      <span className="grow" />

      {file && (
        <TooltipButton
          tooltip="Download"
          onClick={() =>
            downloadImage({
              imageId,
              filename: `${file.name}.${file.extension || "png"}`,
            })
          }
        >
          <Download className="h-4 w-4" />
        </TooltipButton>
      )}
    </Card>
  );
};
