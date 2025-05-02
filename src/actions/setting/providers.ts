import { atom } from "jotai";

import {
  ModelType,
  openSettingsDialogAtom,
  providerRegistryAtom,
  selectedModelsAtom,
} from "@/atoms/setting/providers";
import { ActionError } from "@/hooks/state/use-action";

export const getSelectedModelAtom = atom(
  null,
  (get, set, modelType: ModelType) => {
    const registry = get(providerRegistryAtom);
    const selectedModel = get(selectedModelsAtom)[modelType];
    if (!registry || !selectedModel) {
      set(openSettingsDialogAtom, true);
      throw new ActionError(
        `Please provide API key and select a ${modelType} model`
      );
    }
    return registry.languageModel(
      `${selectedModel.provider}:${selectedModel.id}`
    );
  }
);
