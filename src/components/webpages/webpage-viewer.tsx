import { AlertCircle } from "lucide-react";
import { Streamdown } from "streamdown";
import { Skeleton } from "@/components/ui/skeleton";
import { WebpageToolbar } from "@/components/viewer/toolbars/webpage-toolbar";
import { useWebpage } from "@/queries/webpages/use-webpages";

const SkeletonContent = () => (
  <div className="w-full max-w-4xl mx-auto p-8 space-y-3">
    {/* Paragraph 1 - 4 lines */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="py-2" />
    {/* Paragraph 2 - 3 lines */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="py-2" />
    {/* Paragraph 3 - 5 lines */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
    <div className="py-2" />
    {/* Paragraph 4 - 3 lines */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="py-2" />
    {/* Paragraph 5 - 6 lines */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

const ErrorState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold">Failed to load webpage</h3>
      </div>
    </div>
  </div>
);

export const WebpageViewer = ({ webpageId }: { webpageId: string }) => {
  const { data, isLoading } = useWebpage({ webpageId });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <WebpageToolbar webpageId={webpageId} />
        <SkeletonContent />
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="flex flex-col h-full bg-background">
        <WebpageToolbar webpageId={webpageId} />
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <WebpageToolbar webpageId={webpageId} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="prose dark:prose-invert max-w-none prose-p:my-0.5 prose-li:my-0 prose-heading:my-1 prose-img:my-1 prose-table:my-1 prose-blockquote:my-1 prose-hr:my-2">
            <Streamdown>{data.content}</Streamdown>
          </div>
        </div>
      </div>
    </div>
  );
};
