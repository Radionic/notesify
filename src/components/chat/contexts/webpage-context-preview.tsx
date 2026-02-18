import { GlobeIcon } from "lucide-react";
import { CgClose } from "react-icons/cg";
import type { WebpageContext } from "@/atoms/chat/contexts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRemoveWebpageContext } from "@/queries/chat/use-pdf-context-upload";
import { useWebpage } from "@/queries/webpages/use-webpages";
import { getRouter } from "@/router";

export const WebpageContextPreview = ({
  context,
  removable,
}: {
  context: WebpageContext;
  removable?: boolean;
}) => {
  const { mutate: removeContext } = useRemoveWebpageContext();
  const { data: webpage } = useWebpage({ webpageId: context.fileId });

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-card pl-3 py-2 max-w-52",
        removable ? "pr-1.5" : "pr-3",
      )}
    >
      <button
        type="button"
        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer transition-opacity"
        onClick={() => {
          getRouter().navigate({
            to: "/viewer",
            search: (prev: Record<string, unknown>) => ({
              ...prev,
              type: "webpage" as const,
              fid: context.fileId,
              fo: true,
            }),
          });
        }}
      >
        <GlobeIcon className="h-4 w-4 shrink-0 text-indigo-500" />
        <p className="truncate text-sm font-medium">{webpage?.file?.name}</p>
      </button>
      {removable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={() => removeContext(context.fileId)}
        >
          <CgClose className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
