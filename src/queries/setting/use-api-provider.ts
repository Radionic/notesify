import {
  availableModelsAtom,
  Model,
  ProviderSettings,
} from "@/atoms/setting/providers";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";

export const useVerifyKey = () => {
  const [availableModels, setAvailableModels] = useAtom(availableModelsAtom);

  return useMutation({
    mutationFn: async ({
      settings,
      providerId,
    }: {
      settings: ProviderSettings;
      providerId: string;
    }) => {
      const { apiKey, baseURL } = settings;
      const endpoint = `${
        baseURL ||
        (providerId === "openai"
          ? "https://api.openai.com/v1"
          : "https://api.mistral.ai/v1")
      }/models`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });
      const { data } = await response.json();

      // Convert to Model format
      const models = data.map(
        (model: any) =>
          ({
            id: model.id,
            name: model.id,
            provider: providerId,
            types: ["Chat"],
          }) as Model
      );

      // Update available models for this provider
      setAvailableModels({
        ...availableModels,
        [providerId]: models,
      });
      return true;
    },
  });
};
