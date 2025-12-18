import { atomWithStorage } from "jotai/utils";

export type Model = {
  id: string;
  name: string;
  type: "llm" | "vlm" | "embedding" | "ocr";
  provider: string;
  thinking?: "unspecified" | "low" | "medium" | "high" | null;
};

export const selectedModelAtom = atomWithStorage<Model | undefined>(
  "selected-model",
  undefined,
);
