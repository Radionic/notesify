import type { DynamicToolUIPart } from "ai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ToolStateMessage } from "./tool-state-message";

type Flashcard = {
  question: string;
  answer: string;
};

type CreateFlashcardsInput = {
  flashcards: Flashcard[];
};

export const CreateFlashcardsTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";
  const isLoading = !isDone && !isErrored;

  const input = tool.input as CreateFlashcardsInput | undefined;
  const flashcards = input?.flashcards ?? [];
  const count = flashcards.length;

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (index > count - 1) {
      setIndex(0);
      setShowAnswer(false);
    }
  }, [count, index]);

  const current = flashcards[index];

  if (isLoading) {
    return (
      <ToolStateMessage
        type="loading"
        message="Creating flashcards..."
        className={className}
      />
    );
  }

  if (isErrored) {
    return (
      <ToolStateMessage
        type="error"
        message="Failed to create flashcards"
        className={className}
      />
    );
  }

  if (count === 0) {
    return (
      <ToolStateMessage
        type="empty"
        message="No flashcards provided"
        className={className}
      />
    );
  }

  if (!current) return null;

  return (
    <Card className={cn("not-prose my-1 w-full max-w-2xl", className)}>
      <CardHeader className="pt-3 pb-0 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground tracking-wider">
            Flashcard {index + 1} of {count}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
              className="text-xs font-medium h-7"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </Button>
            <div className="flex items-center gap-1 border-l pl-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowAnswer(false);
                  setIndex((i) => Math.max(0, i - 1));
                }}
                disabled={index === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowAnswer(false);
                  setIndex((i) => Math.min(count - 1, i + 1));
                }}
                disabled={index >= count - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 min-h-[240px] flex flex-col justify-center items-center text-center">
        <div className="w-full max-w-lg">
          <h3 className="text-xl font-medium leading-relaxed">
            {current.question}
          </h3>

          {showAnswer && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
              <Separator className="mt-4" />

              <p className="text-lg text-muted-foreground leading-relaxed">
                {current.answer}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
