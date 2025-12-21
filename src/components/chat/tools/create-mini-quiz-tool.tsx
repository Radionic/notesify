import type { DynamicToolUIPart } from "ai";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ToolStateMessage } from "./tool-state-message";

type MiniQuizChoice = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

type MiniQuizQuestion = {
  question: string;
  choices: MiniQuizChoice[];
};

type CreateMiniQuizInput = {
  quiz: MiniQuizQuestion[];
};

export const CreateMiniQuizTool = ({
  tool,
  className,
}: {
  tool: DynamicToolUIPart;
  className?: string;
}) => {
  const isDone = tool.state === "output-available";
  const isErrored = tool.state === "output-error";
  const isLoading = !isDone && !isErrored;

  const input = tool.input as CreateMiniQuizInput | undefined;
  const questions = input?.quiz ?? [];
  const count = questions.length;

  const [index, setIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setIndex((prev) => {
      if (prev > count - 1) {
        setSelectedChoiceIndex(null);
        return 0;
      }
      return prev;
    });
  }, [count]);

  const current = questions[index];
  const selectedChoice =
    selectedChoiceIndex != null ? current?.choices[selectedChoiceIndex] : null;

  const isCorrect = selectedChoice?.isCorrect ?? false;

  if (isLoading) {
    return (
      <ToolStateMessage
        type="loading"
        message="Creating mini quiz..."
        className={className}
      />
    );
  }

  if (isErrored) {
    return (
      <ToolStateMessage
        type="error"
        message="Failed to create mini quiz"
        className={className}
      />
    );
  }

  if (count === 0) {
    return (
      <ToolStateMessage
        type="empty"
        message="No quiz questions provided"
        className={className}
      />
    );
  }

  if (!current) return null;

  const hasAnswered = selectedChoiceIndex != null;

  return (
    <Card className={cn("not-prose my-1 w-full max-w-2xl", className)}>
      <CardHeader className="pt-3 pb-0 px-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground tracking-wider">
            Question {index + 1} of {count}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setSelectedChoiceIndex(null);
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
                setSelectedChoiceIndex(null);
                setIndex((i) => Math.min(count - 1, i + 1));
              }}
              disabled={index >= count - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <h3 className="text-lg font-semibold leading-snug">
          {current.question}
        </h3>
      </CardHeader>

      <CardContent className="p-3">
        <div className="grid gap-2">
          {current.choices.map((choice, i) => {
            const isSelected = selectedChoiceIndex === i;
            let variant: "outline" | "default" | "destructive" | "secondary" =
              "outline";
            let customColors = "";

            if (hasAnswered) {
              if (isSelected) {
                if (choice.isCorrect) {
                  customColors =
                    "bg-green-100 text-green-900 hover:bg-green-100 border-green-200";
                } else {
                  customColors =
                    "bg-red-100 text-red-900 hover:bg-red-100 border-red-200";
                }
              } else if (choice.isCorrect) {
                customColors = "bg-green-50 text-green-900 border-green-200";
              }
            } else if (isSelected) {
              variant = "secondary";
            }

            return (
              <Button
                key={`${choice.text}-${i}`}
                type="button"
                variant={variant}
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3 whitespace-normal",
                  hasAnswered &&
                    !isSelected &&
                    !choice.isCorrect &&
                    "opacity-50",
                  customColors,
                )}
                disabled={hasAnswered}
                onClick={() => setSelectedChoiceIndex(i)}
              >
                <div className="flex items-start w-full gap-3">
                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium",
                      isSelected || (hasAnswered && choice.isCorrect)
                        ? "text-current"
                        : "text-muted-foreground",
                    )}
                  >
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="flex-1 text-sm leading-5">
                    {choice.text}
                  </span>
                  {hasAnswered && isSelected && (
                    <span className="shrink-0">
                      {choice.isCorrect ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {selectedChoice && (
          <div
            className={cn(
              "mt-2 rounded-lg p-4 text-sm animate-in fade-in slide-in-from-top-2",
              isCorrect
                ? "bg-green-50 text-green-900 border border-green-100"
                : "bg-red-50 text-red-900 border border-red-100",
            )}
          >
            <div className="font-semibold flex items-center gap-2 mb-1">
              {isCorrect ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {isCorrect ? "Correct!" : "Not quite"}
            </div>
            <p className="opacity-90 leading-relaxed">
              {selectedChoice.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
