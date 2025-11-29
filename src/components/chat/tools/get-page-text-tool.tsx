import type { DynamicToolUIPart } from "ai";
import { PageTool } from "./page-tool";

type GetPageTextInput = {
  startPage: number;
  endPage: number;
};

export const GetPageTextTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const input = tool.input as GetPageTextInput | undefined;
  if (!input) return null;

  const { startPage, endPage } = input;
  if (startPage == null || endPage == null) return null;

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
