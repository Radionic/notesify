import { dotPulse, ring2 } from "ldrs";
import { cn } from "@/lib/utils";
import { Message, ToolInvocation } from "ai";
import { GetPageTextTool } from "./tools/get-page-text-tool";
import { SearchTextTool } from "./tools/search-text-tool";
import { CalculateTool } from "./tools/calculate-tool";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import { SearchPagesTool } from "./tools/search-pages-tool";

dotPulse.register();
ring2.register();

export const ChatMessage = ({
  message,
  isLoading,
  showHeader,
}: {
  message: Message;
  isLoading?: boolean;
  showHeader?: boolean;
}) => {
  const modelId = (message.annotations as any)?.[0]?.["modelId"];
  const renderTool = (tool: ToolInvocation) => {
    if (tool.toolName === "getPDFPageText") {
      return <GetPageTextTool tool={tool} />;
    } else if (tool.toolName === "searchText") {
      return <SearchTextTool tool={tool} />;
    } else if (tool.toolName === "calculate") {
      return <CalculateTool tool={tool} />;
    } else if (tool.toolName === "searchPages") {
      return <SearchPagesTool tool={tool} />;
    }
  };
  return (
    <div
      className={cn(
        "w-fit px-2 py-1",
        message.role === "user" &&
          "bg-secondary border border-secondary/50 self-end rounded-md max-w-[90%]"
      )}
    >
      {message.role === "user" ? (
        <p className="whitespace-pre-wrap">{message.content}</p>
      ) : (
        <>
          {showHeader && (
            <p className="text-sm text-muted-foreground mt-2">{modelId}</p>
          )}
          {message.parts?.map((part) => {
            if (part.type === "text") {
              return <MarkdownRenderer content={part.text} />;
            } else if (part.type === "tool-invocation") {
              const tool = part.toolInvocation;
              return renderTool(tool);
            }
          })}
          {/* @ts-ignore */}
          {isLoading && <l-dot-pulse size="24" speed="1.25" color="#525252" />}
        </>
      )}
    </div>
  );
};
