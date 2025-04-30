import ReactMarkdown from "react-markdown";
import { Thinking } from "./thinking";
import { ReactNode } from "@tanstack/react-router";
import React from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "@/styles/katex.css";

interface CodeProps {
  node: any;
  inline?: boolean;
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

export const markdownClassname =
  "max-w-full prose dark:prose-invert prose-h1:my-3 prose-h2:my-2 prose-h3:my-1 prose-h4:my-0 prose-h5:my-0 prose-h6:my-0 prose-p:my-2 prose-pre:my-1 prose-hr:my-4";

const components: any = {
  code: ({ node, inline, className, children, ...props }: CodeProps) => {
    if (className === "language-thinking") {
      // Get the text content
      const text = String(children).trim();
      // console.log("Thinking", node.position?.end?.offset, text.length + 16);
      const isFinished = node.position?.end?.offset >= text.length + 16;
      return <Thinking text={text} isFinished={isFinished} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: ReactNode }) => {
    // If the child is the Thinking component, return it directly
    if (
      React.isValidElement(children) &&
      (children.props as any).className === "language-thinking"
    ) {
      return children;
    }
    return <pre>{children}</pre>;
  },
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className={markdownClassname}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
