import type { DynamicToolUIPart } from "ai";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import remarkMath from "remark-math";
import { match } from "ts-pattern";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import type { MyUIMessage } from "@/routes/api/ai";
import { CalculateTool } from "./tools/calculate-tool";
import { GetPageTextTool } from "./tools/get-page-text-tool";
import { GetTableOfContentsTool } from "./tools/get-table-of-contents-tool";
import { GetViewingPdfMetadataTool } from "./tools/get-viewing-pdf-metadata-tool";
import { SearchKeywordsTool } from "./tools/search-keywords-tool";
import { SearchPagesTool } from "./tools/search-pages-tool";

export const ChatMessage = ({
  message,
  isLoading,
  showHeader,
  reload,
  isLast,
}: {
  message: MyUIMessage;
  isLoading?: boolean;
  showHeader?: boolean;
  reload?: () => void;
  isLast?: boolean;
}) => {
  const modelId = message.metadata?.modelId;

  const renderTool = (tool: DynamicToolUIPart) => {
    const toolName = tool.type.split("-")[1];
    if (!toolName) return null;

    return match(toolName)
      .with("getPDFPageText", () => <GetPageTextTool tool={tool} />)
      .with("getTableOfContents", () => <GetTableOfContentsTool tool={tool} />)
      .with("getViewingPdfMetadata", () => (
        <GetViewingPdfMetadataTool tool={tool} />
      ))
      .with("calculate", () => <CalculateTool tool={tool} />)
      .with("searchPages", () => <SearchPagesTool tool={tool} />)
      .with("searchKeywords", () => <SearchKeywordsTool tool={tool} />)
      .otherwise(() => null);
  };

  return (
    <Message from={message.role}>
      {showHeader && message.role === "assistant" && (
        <p className="text-xs text-muted-foreground mb-1 ml-1">{modelId}</p>
      )}
      <MessageContent>
        {message.parts?.map((part, index) => {
          if (part.type === "text") {
            return (
              <MessageResponse
                key={`${message.id}-${index}`}
                remarkPlugins={[[remarkMath, { singleDollarTextMath: true }]]}
              >
                {part.text}
              </MessageResponse>
            );
          }
          if (part.type === "reasoning") {
            return (
              <Reasoning
                key={`${message.id}-${index}`}
                className="w-full"
                isStreaming={isLoading && index === message.parts.length - 1}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          }
          if (part.type.startsWith("tool-")) {
            return (
              <div key={`${message.id}-${index}`}>
                {renderTool(part as DynamicToolUIPart)}
              </div>
            );
          }
          return null;
        })}
      </MessageContent>
      {message.role === "assistant" &&
        !isLoading &&
        message.parts?.length > 0 && (
          <MessageActions>
            {isLast && reload && (
              <MessageAction
                onClick={() => reload()}
                label="Regenerate"
                className="text-foreground/40 hover:text-foreground transition-colors"
              >
                <RefreshCcwIcon className="size-3" />
              </MessageAction>
            )}
            <MessageAction
              onClick={() => {
                const text = message.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p as { type: "text"; text: string }).text)
                  .join("");
                navigator.clipboard.writeText(text);
              }}
              label="Copy"
              className="text-foreground/40 hover:text-foreground transition-colors"
            >
              <CopyIcon className="size-3" />
            </MessageAction>
          </MessageActions>
        )}
    </Message>
  );
};
