import { Mistral, OpenAI } from "@lobehub/icons";
import { useAtom, useAtomValue } from "jotai";

import {
  configuredProvidersAtom,
  type ModelType,
  openSettingsDialogAtom,
} from "@/atoms/setting/providers";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { AddModelProviderCard } from "./provider/add-provider-card";
import { ConfiguredProviderCard } from "./provider/configured-provider-card";
import { DefaultModelSelector } from "./provider/default-model-selector";

export type ProviderConfig = {
  id: string;
  name: string;
  icon: React.ReactNode;
  tags: ModelType[];
  showBaseUrl: boolean;
};

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    icon: <OpenAI size={24} />,
    tags: ["Chat", "Indexing"],
    showBaseUrl: true,
  },
  {
    id: "mistral",
    name: "Mistral",
    icon: <Mistral.Color size={24} />,
    tags: ["Chat", "Indexing", "Document Parser"],
    showBaseUrl: false,
  },
];

export const ProviderSettingsDialog = () => {
  const [open, setOpen] = useAtom(openSettingsDialogAtom);
  const configuredProviders = useAtomValue(configuredProvidersAtom);
  const unconfiguredProviders = PROVIDER_CONFIGS.filter(
    (provider) => !configuredProviders.some((cp) => cp.id === provider.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-6">
          {/* Configure Models Section */}
          {configuredProviders.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">
                Configured Model Providers
              </h3>
              <div className="space-y-3">
                {configuredProviders.map((provider) => {
                  const providerConfig = PROVIDER_CONFIGS.find(
                    (p) => p.id === provider.id,
                  );
                  if (!providerConfig) return null;
                  return (
                    <ConfiguredProviderCard
                      key={provider.id}
                      provider={provider}
                      providerConfig={providerConfig}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Models Section */}
          {unconfiguredProviders.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Add Model Providers</h3>
              <div className="space-y-3">
                {unconfiguredProviders.map((providerConfig) => (
                  <AddModelProviderCard
                    key={providerConfig.id}
                    providerConfig={providerConfig}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default Models Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Default Models</h3>
            <div className="border rounded-md p-3 space-y-4">
              <DefaultModelSelector modelType="Chat" />
              <DefaultModelSelector modelType="Indexing" />
              <DefaultModelSelector modelType="Document Parser" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
