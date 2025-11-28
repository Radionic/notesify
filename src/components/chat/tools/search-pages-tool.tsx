import type { ToolInvocation } from "ai";
import { PageTool } from "./page-tool";

export const SearchPagesTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const pages = tool.state === "result" ? tool.result.pages : [];
  return (
    <PageTool
      tool={tool}
      className={className}
      actionText={{
        loading: "Searching pages",
        completed: "Found",
        failed: "No relevant pages found",
      }}
      pages={pages}
    />
  );
};
