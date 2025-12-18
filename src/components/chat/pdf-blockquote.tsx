import { useSetAtom } from "jotai";
import { ChevronRight, Quote } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import { activeBoundingContextAtom } from "@/atoms/chat/contexts";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/id";
import { cn } from "@/lib/utils";
import { useNavigatePdf } from "@/queries/pdf/use-pdf";

const extractTextFromChildren = (children: ReactNode): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return children.toString();
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    if (props.children) {
      return extractTextFromChildren(props.children);
    }
  }
  return "";
};

const parseBlockquote = (text: string) => {
  const pdfIdMatch = text.match(/pdfId:\s*([^\n]+)/);
  const pdfPageMatch = text.match(/pdfPage:\s*(\d+)/);

  if (!pdfIdMatch || !pdfPageMatch) return null;

  const pdfId = pdfIdMatch[1].trim();
  const pdfPage = parseInt(pdfPageMatch[1], 10);

  // Remove the metadata lines to get the content
  const cleanText = text
    .replace(/pdfId:[^\n]*\n?/, "")
    .replace(/pdfPage:[^\n]*\n?/, "")
    .trim();

  return { pdfId, pdfPage, text: cleanText };
};

const BlockquoteCard = ({
  children,
  className,
  footer,
}: {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "not-prose my-3 rounded-lg border border-border bg-card/50 overflow-hidden",
        className,
      )}
    >
      <div className="flex gap-3 p-3 text-sm text-foreground/90">
        <Quote className="size-4 shrink-0 text-muted-foreground/20 rotate-180 mt-0.5" />
        {children}
      </div>
      {footer}
    </div>
  );
};

export const PDFBlockquote = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const textContent = extractTextFromChildren(children);
  const parsed = parseBlockquote(textContent);
  const { navigatePdf } = useNavigatePdf();
  const setActiveBoundingContext = useSetAtom(activeBoundingContextAtom);

  if (!parsed) {
    return (
      <BlockquoteCard className={className}>
        <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
          {children}
        </div>
      </BlockquoteCard>
    );
  }

  const handleNavigate = () => {
    navigatePdf({ pdfId: parsed.pdfId, page: parsed.pdfPage });
    setActiveBoundingContext({
      id: generateId(),
      type: "text",
      pdfId: parsed.pdfId,
      page: parsed.pdfPage,
      content: parsed.text,
      // rects is undefined to trigger client-side search
      rects: undefined,
    });
  };

  return (
    <BlockquoteCard
      className={className}
      footer={
        <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium">Page {parsed.pdfPage}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 hover:bg-background hover:text-primary pr-0"
            onClick={handleNavigate}
          >
            Go there
            <ChevronRight className="size-3" />
          </Button>
        </div>
      }
    >
      <div className="whitespace-pre-wrap">{parsed.text}</div>
    </BlockquoteCard>
  );
};
