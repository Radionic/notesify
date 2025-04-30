import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Markdown from "react-markdown";
import AnimatedShinyText from "@/components/magic-ui/animated-shiny-text";
import { markdownClassname } from "./markdown-renderer";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

export const Thinking = ({
  text,
  isFinished,
}: {
  text: string;
  isFinished?: boolean;
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-2 my-2"
      defaultValue="1"
    >
      <AccordionItem
        value="1"
        className="rounded-lg border px-4 py-1 bg-neutral-100/50"
      >
        <AccordionTrigger className="justify-start gap-3 py-0 text-[15px] leading-6 hover:no-underline [&>svg]:-order-1">
          {!isFinished ? (
            <AnimatedShinyText className="m-0">Thinking...</AnimatedShinyText>
          ) : (
            "View thinking process"
          )}
        </AccordionTrigger>
        <AccordionContent className="pb-2 ps-7 text-muted-foreground text-wrap">
          <div className={markdownClassname}>
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {text}
            </Markdown>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
