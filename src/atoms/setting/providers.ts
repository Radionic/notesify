import { atomWithStorage } from "jotai/utils";

export type Model = {
  id: string;
  name: string;
  type: "llm" | "vlm" | "embedding" | "ocr";
  provider: string;
};

export const selectedModelAtom = atomWithStorage<Model | undefined>(
  "selected-model",
  undefined,
);
