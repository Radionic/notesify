import type { DynamicToolUIPart } from "ai";
import { PageTool } from "./page-tool";

type SearchPagesOutput = {
  pages: number[];
};

export const SearchPagesTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const pages =
    tool.state === "output-available" && tool.output !== null
      ? (tool.output as SearchPagesOutput)?.pages
      : [];
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
