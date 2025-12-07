import type { DynamicToolUIPart } from "ai";
import { PageTool } from "./page-tool";

export const SearchPagesTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const pages =
    tool.state === "output-available" && tool.output !== null
      ? (tool.output as any)?.map((o: any) => o.page)
      : [];
  return (
    <PageTool
      tool={tool}
      className={className}
      actionText={{
        loading: "Searching pages",
        completed: "Searched",
        failed: "No relevant pages found",
      }}
      pages={pages}
    />
  );
};
