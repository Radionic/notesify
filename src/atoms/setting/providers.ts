import { atomWithStorage } from "jotai/utils";
import type { Model } from "@/db/schema/model";

export type { Model };

export type PublicModel = Omit<Model, "modelId" | "providerOptions">;

export const selectedModelAtom = atomWithStorage<PublicModel | undefined>(
  "selected-model",
  undefined,
);
