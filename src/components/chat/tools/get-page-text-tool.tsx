import type { ToolInvocation } from "ai";
import { PageTool } from "./page-tool";

export const GetPageTextTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const { startPage, endPage } = tool.args || {};
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <PageTool
      tool={tool}
      className={className}
      actionText={{
        loading: "Reading pages",
        completed: "Read ",
        failed: "Failed to read pages",
      }}
      pages={pages}
    />
  );
};
