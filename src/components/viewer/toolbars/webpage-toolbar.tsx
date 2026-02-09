import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useWebpage } from "@/queries/webpages/use-webpages";

export const WebpageToolbar = ({ webpageId }: { webpageId: string }) => {
  const { data, isLoading } = useWebpage({ webpageId });

  return (
    <Card className="sticky top-0 h-9 flex flex-row items-center gap-2 border-2 border-transparent z-30 rounded-none bg-header px-3">
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
