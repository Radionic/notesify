import { useAtomValue } from "jotai";
import { toast } from "sonner";
import {
  type ModelType,
  providerRegistryAtom,
  selectedModelsAtom,
} from "@/atoms/setting/providers";

export const useGetSelectedModel = () => {
  const registry = useAtomValue(providerRegistryAtom);
  const selectedModels = useAtomValue(selectedModelsAtom);

  const getSelectedModel = (modelType: ModelType) => {
    const selectedModel = selectedModels[modelType];
    if (!registry || !selectedModel) {
      toast.error(`Please provide API key and select a ${modelType} model`);
      return null;
    }
    return registry.languageModel(
      `${selectedModel.provider}:${selectedModel.id}`,
    );
  };

  return { getSelectedModel };
};
