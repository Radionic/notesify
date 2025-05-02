import { useEffect } from "react";
import { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const AutogrowingTextarea = ({
  placeholder,
  defaultRows = 1,
  maxRows,
  className,
  value,
  ...rest
}: {
  defaultRows?: number;
  maxRows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    requestAnimationFrame(() => {
      const style = window.getComputedStyle(textarea);
      const borderHeight =
        parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
      const paddingHeight =
        parseInt(style.paddingTop) + parseInt(style.paddingBottom);

      const lineHeight = parseInt(style.lineHeight);
      const maxHeight = maxRows
        ? lineHeight * maxRows + borderHeight + paddingHeight
        : Infinity;

      const newHeight = Math.min(
        textarea.scrollHeight + borderHeight,
        maxHeight
      );

      textarea.style.height = `${newHeight}px`;
    });
  }, [value, maxRows, defaultRows]);

  return (
    <Textarea
      placeholder={placeholder}
      ref={textareaRef}
      value={value}
      rows={defaultRows}
      className={cn("min-h-[none] resize-none", className)}
      {...rest}
    />
  );
};
