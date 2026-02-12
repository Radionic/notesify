import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useWebpage } from "@/queries/webpages/use-webpages";

export const WebpageToolbar = ({ webpageId }: { webpageId: string }) => {
  const { data, isLoading } = useWebpage({ webpageId });
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
          <>
            {data?.favicon && (
              <img
                src={data.favicon}
                alt=""
                className="h-4 w-4 shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="truncate text-sm font-medium">
              {data?.file.name || "Unknown Page"}
            </span>
          </>
        )}
      </div>

      <span className="grow" />

      {data?.url && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => window.open(data.url, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};
