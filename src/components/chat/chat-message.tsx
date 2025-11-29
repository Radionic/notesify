import type { DynamicToolUIPart, UIMessage } from "ai";
import { dotPulse, ring2 } from "ldrs";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import type { MessageMetadata } from "@/hooks/chat/use-chat-ai";
import { getTextFromMessage } from "@/lib/ai/get-text-from-message";
import { cn } from "@/lib/utils";
import { CalculateTool } from "./tools/calculate-tool";
import { GetPageTextTool } from "./tools/get-page-text-tool";
import { SearchPagesTool } from "./tools/search-pages-tool";

dotPulse.register();
ring2.register();

type MessagePart = UIMessage<MessageMetadata>["parts"][number];

export const ChatMessage = ({
  message,
  isLoading,
  showHeader,
}: {
  message: UIMessage<MessageMetadata>;
  isLoading?: boolean;
  showHeader?: boolean;
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
    <div
      className={cn(
        "w-fit px-2 py-1",
        message.role === "user" &&
          "bg-secondary border border-secondary/50 self-end rounded-md max-w-[90%]",
      )}
    >
      {message.role === "user" ? (
        <p className="whitespace-pre-wrap">{getTextFromMessage(message)}</p>
      ) : (
        <>
          {showHeader && (
            <p className="text-sm text-muted-foreground mt-2">{modelId}</p>
          )}
          {message.parts?.map((part: MessagePart, index: number) => {
            if (part.type === "text") {
              return (
                <MarkdownRenderer
                  key={`${message.id}-${index}`}
                  content={part.text}
                />
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
        </>
      )}
    </div>
  );
};
