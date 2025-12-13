// Drops all control characters below " " (U+0020), except standard whitespace \n, \r, \t.
export const sanitizePdfText = (text: string): string =>
  Array.from(text)
    .filter((ch) => ch >= " " || ch === "\n" || ch === "\r" || ch === "\t")
    .join("");
