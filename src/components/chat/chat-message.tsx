import type { DynamicToolUIPart } from "ai";
import { dotPulse, ring2 } from "ldrs";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
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
import { SearchPagesTool } from "./tools/search-pages-tool";

dotPulse.register();
ring2.register();

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
    const { toolName } = tool;
    if (!toolName) return null;

    if (toolName === "getPDFPageText") {
      return <GetPageTextTool tool={tool} />;
    }
    if (toolName === "calculate") {
      return <CalculateTool tool={tool} />;
    }
    if (toolName === "searchPages") {
      return <SearchPagesTool tool={tool} />;
    }
    return null;
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
              <MessageResponse key={`${message.id}-${index}`}>
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
        {isLoading && <l-dot-pulse size="24" speed="1.25" color="#525252" />}
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
