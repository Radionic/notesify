import type { DynamicToolUIPart } from "ai";
import { ChevronRightIcon, CircleAlert } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type SearchKeywordsInput = {
  pdfId: string;
  keywords: string[];
};

type SearchKeywordsResultItem = {
  page?: number | null;
  sentences?: string[] | null;
};

const getKeywordLabel = (keywords: string[]): string => {
  if (keywords.length === 0) return "keywords";
  if (keywords.length === 1) return `"${keywords[0]}"`;
  return `"${keywords.join(", ")}"`;
};

const getResultsStats = (results: SearchKeywordsResultItem[]) => {
  const totalMatches = results.reduce(
    (sum, result) => sum + (result.sentences?.length ?? 0),
    0,
  );
  return {
    totalMatches,
    hasResults: totalMatches > 0,
  };
};

const highlightSentence = (
  sentence: string,
  keywords: string[],
  snippetKey: string,
) => {
  if (!sentence || keywords.length === 0) return sentence;

  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "gi");
  const parts = sentence.split(pattern);

  return parts.map((part, idx) => {
    const isMatch =
      part && keywords.some((kw) => kw.toLowerCase() === part.toLowerCase());

    if (!isMatch) return part;

    const partKey = `${snippetKey}-part-${idx}`;

    return (
      <strong key={partKey} className="font-semibold">
        {part}
      </strong>
    );
  });
};

export const SearchKeywordsTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";

  const input = tool.input as SearchKeywordsInput;

  const keywords = input?.keywords ?? [];
  const keywordLabel = getKeywordLabel(keywords);

  const results: SearchKeywordsResultItem[] =
    isDone && Array.isArray(tool.output) ? tool.output : [];

  const { totalMatches, hasResults } = getResultsStats(results);

  const triggerLabel = isErrored
    ? `Failed to search ${keywordLabel}`
    : !isDone
      ? `Searching for ${keywordLabel}...`
      : hasResults
        ? `Found ${totalMatches} match${totalMatches === 1 ? "" : "es"} for ${keywordLabel}`
        : `No matches found for ${keywordLabel}`;

  return (
    <Collapsible
      open={isErrored ? false : open}
      onOpenChange={isErrored ? undefined : setOpen}
      className={cn("not-prose my-2 w-full", className)}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
        )}
      >
        {isErrored ? (
          <CircleAlert className="h-3 w-3 shrink-0" />
        ) : isDone ? (
          <ChevronRightIcon
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
        ) : (
          <Spinner className="h-3 w-3 shrink-0" />
        )}
        <span className="text-left">{triggerLabel}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 rounded-md p-2 text-xs space-y-2">
        {isDone && hasResults && (
          <div className="space-y-1.5">
            {results.map((result, index) => {
              const page = result.page ?? undefined;
              const pageLabel = page != null ? `Page ${page}` : undefined;

              return (
                <div
                  key={pageLabel ? `page-${pageLabel}` : `result-${index}`}
                  className="space-y-0.5 pl-2"
                >
                  <div className="font-medium">
                    {pageLabel || `Result ${index + 1}`}
                  </div>

                  {result.sentences?.map((sentence, i) => {
                    const snippetKey = `${page}-${i}-snippet`;
                    return (
                      <p
                        key={snippetKey}
                        className="w-full text-[11px] leading-snug text-muted-foreground"
                      >
                        {"..."}
                        {highlightSentence(sentence, keywords, snippetKey)}
                        {"..."}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {isDone && !hasResults && !isErrored && (
          <p className="text-muted-foreground">
            No matches found for {keywordLabel}.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
