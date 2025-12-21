import {
  ChartSpline,
  FileSearch,
  Highlighter,
  MessageSquare,
  MessageSquareQuote,
  MessagesSquare,
  Pencil,
  Sparkles,
} from "lucide-react";
import type { ElementType } from "react";
import { Badge, type BadgeProps } from "@/components/badge";

interface SectionFeature {
  title: string;
  icon: ElementType;
  badge?: {
    label: string;
    variant?: BadgeProps["variant"];
  };
}

interface FeatureSectionData {
  title: string;
  description: string;
  imageSrc: string;
  features: SectionFeature[];
}

const sections: FeatureSectionData[] = [
  {
    title: "Meet Your Truly Intelligent AI Assistant",
    description:
      "Ask questions about your PDFs, get instant answers, clear explanations, and trusted citations.",
    imageSrc: "/demo.jpg",
    features: [
      {
        title: "Comprehensive summaries",
        icon: Sparkles,
      },
      {
        title: "Context-aware Q&A",
        icon: MessageSquare,
      },
      {
        title: "Deep text search",
        icon: FileSearch,
      },
      {
        title: "Smart citations",
        icon: MessageSquareQuote,
      },
      {
        title: "Visual data analysis",
        icon: ChartSpline,
      },
    ],
  },
  {
    title: "Annotate the Way You Think",
    description:
      "Engage deeply with your PDFs. Highlight key arguments, and mark up the text just like paper.",
    imageSrc: "/feat-annotation.jpg",
    features: [
      {
        title: "Text highlighting",
        icon: Highlighter,
      },
      {
        title: "Freehand drawing",
        icon: Pencil,
      },
      {
        title: "Text comments",
        badge: { label: "Coming Soon", variant: "yellow" },
        icon: MessagesSquare,
      },
    ],
  },
  {
    title: "Build Permanent Knowledge",
    description:
      "Don't let insights fade. Turn your PDFs into flashcards and quizzes to reinforce what you've learned.",
    imageSrc: "/feat-quiz.jpg",
    features: [
      {
        title: "Auto-generated flashcards",
        icon: Sparkles,
      },
      {
        title: "Self-testing quizzes",
        icon: Sparkles,
      },
    ],
  },
];

export function FeatureSection() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto space-y-24">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight text-primary">
          Accelerate Learning with Notesify
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Turn PDFs into active knowledge. Ask AI, scribble notes, and create
          flashcards and quizzes to master your reading list faster than ever.
        </p>
      </div>

      {sections.map((section, sectionIndex) => (
        <div
          key={section.title}
          className={
            sectionIndex % 2 === 0
              ? "flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16"
              : "flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-16"
          }
        >
          <div className="flex-1 space-y-4">
            <h2 className="font-ebg text-2xl md:text-3xl font-medium tracking-tight">
              {section.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {section.description}
            </p>

            <div className="space-y-0.5">
              {section.features.map((feature) => (
                <div
                  key={`${section.title}-${feature.title}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                >
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="truncate">{feature.title}</span>
                    {feature.badge && (
                      <Badge variant={feature.badge.variant}>
                        {feature.badge.label}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-[1.5] w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-muted border">
              <img
                src={section.imageSrc}
                alt={section.title}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
