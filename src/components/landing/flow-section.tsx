import {
  BookOpen,
  Highlighter,
  MessageCircleQuestionMark,
  Sparkles,
} from "lucide-react";
import type { ElementType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlowStep {
  title: string;
  description: string;
  icon: ElementType;
  accentClassName: string;
  image: string;
}

const steps: FlowStep[] = [
  {
    title: "Summarize & Grasp",
    description:
      "Get the core ideas instantly with AI summaries. Build a mental map before diving into the details.",
    icon: BookOpen,
    accentClassName: "text-blue-600",
    image: "/flow-summary.png",
  },
  {
    title: "Engage & Annotate",
    description:
      "Don't just read—interact. Highlight crucial details, scribble notes, and mark up the text as you go.",
    icon: Highlighter,
    accentClassName: "text-amber-600",
    image: "/flow-annotation.png",
  },
  {
    title: "Question & Clarify",
    description:
      "Stuck on a concept? Ask the AI to explain, simplify, or connect the ideas instantly.",
    icon: MessageCircleQuestionMark,
    accentClassName: "text-emerald-600",
    image: "/flow-explain.jpg",
  },
  {
    title: "Review & Retain",
    description:
      "Create quizzes and flashcards from your PDF. Practice active recall to make it stick.",
    icon: Sparkles,
    accentClassName: "text-violet-600",
    image: "/flow-quiz.png",
  },
];

export function FlowSection() {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight text-primary">
          From Reading to Learning
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Notesify provides the seamless workflow you need to truly own your
          knowledge.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <Card
            key={step.title}
            className="rounded-2xl border bg-card shadow-sm overflow-hidden"
          >
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <step.icon className={cn("h-5 w-5", step.accentClassName)} />
              </div>

              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              <div className="mt-4 rounded-xl border bg-muted/40 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
