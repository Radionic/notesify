import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Notesify is currently in public preview where all features are available for free. We will have free and paid plans in the future.",
  },
  {
    question: "What models does Notesify support?",
    answer: (
      <span>
        Notesify supports the latest state-of-the-art AI models. Please check{" "}
        <Link to="/models" className="underline underline-offset-4">
          here
        </Link>{" "}
        for the latest list of supported models.
      </span>
    ),
  },
  {
    question: "Which platforms does Notesify support?",
    answer:
      "Notesify is a web-based application accessible from any modern browser on both desktop and mobile devices. No installation is required.",
  },
  {
    question: "How is Notesify different from other AI tools?",
    answer: (
      <div className="space-y-2">
        <p>
          Notesify is built specifically for deep reading and active learning.
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Unlike generic chat tools, it understands the full structure of your
            PDF—including sections, tables, charts, images, citations, and more
          </li>
          <li>
            It helps you retain knowledge with flashcards and mini quizzes
          </li>
          <li>
            It integrates annotation tools like highlighting and freehand
            drawing, so you can interact with your documents just as you would
            on paper
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "Is there a team plan?",
    answer:
      "Not yet, but we will work on it. Collaborative features for teams, like shared folders and comments, are part of our roadmap.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="font-ebg text-4xl md:text-5xl font-medium tracking-tight">
        Common Questions
      </h2>

      <AccordionPrimitive.Root
        type="single"
        collapsible
        className="mt-10 space-y-4"
      >
        {faqs.map((faq, index) => (
          <AccordionPrimitive.Item
            key={faq.question}
            value={`item-${index}`}
            className="rounded-2xl border bg-background shadow-sm data-[state=open]:bg-blue-500 data-[state=open]:text-white"
          >
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-base font-medium">{faq.question}</span>
                <span className="shrink-0">
                  <Plus className="h-5 w-5 group-data-[state=open]:hidden" />
                  <Minus className="hidden h-5 w-5 group-data-[state=open]:block" />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>

            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="px-6 pb-6 text-sm leading-relaxed text-white/90">
                {faq.answer}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
}
