import { OpenAIProviderSettings } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral, MistralProviderSettings } from "@ai-sdk/mistral";
import { createProviderRegistry, ProviderRegistryProvider } from "ai";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type ModelType = "Chat" | "Document Parser" | "Indexing";
export type Model = {
  id: string;
  name: string;
  provider: string;
  types: ModelType[];
};

export type ProviderSettings = OpenAIProviderSettings | MistralProviderSettings;
export type Provider = {
  type: "openai" | "mistral";
  id: string;
  settings: ProviderSettings;
};

export const openSettingsDialogAtom = atom<boolean>(false);

// All configured providers
export const configuredProvidersAtom = atomWithStorage<Provider[]>(
  "configured-providers",
  []
);

// Available models from all providers
export const availableModelsAtom = atomWithStorage<Record<string, Model[]>>(
  "available-models",
  {}
);

// Selected models for each type
export const selectedModelsAtom = atomWithStorage<
  Record<ModelType, Model | undefined>
>("selected-models", {
  Chat: undefined,
  "Document Parser": undefined,
  Indexing: undefined,
});

// Registry containing all configured model providers
export const providerRegistryAtom = atom<ProviderRegistryProvider | undefined>(
  (get) => {
    const providers = get(configuredProvidersAtom);
    const registryConfig: Record<string, any> = {};
    for (const provider of providers) {
      if (provider.type === "openai") {
        registryConfig[provider.id] = createOpenAI({
          apiKey: provider.settings.apiKey,
          baseURL: provider.settings.baseURL || undefined,
        });
      } else if (provider.type === "mistral") {
        registryConfig[provider.id] = createMistral({
          apiKey: provider.settings.apiKey,
        });
      }
    }

    return createProviderRegistry(registryConfig);
  }
);
