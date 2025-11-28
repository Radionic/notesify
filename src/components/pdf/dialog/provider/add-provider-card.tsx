import { useAtom } from "jotai";
import { toast } from "sonner";
import {
  configuredProvidersAtom,
  type Provider,
} from "@/atoms/setting/providers";
import type { ProviderConfig } from "../provider-settings-dialog";
import { ProviderCardBase } from "./provider-card-base";

type AddModelProviderCardProps = {
  providerConfig: ProviderConfig;
};

export const AddModelProviderCard = ({
  providerConfig,
}: AddModelProviderCardProps) => {
  const [configuredProviders, setConfiguredProviders] = useAtom(
    configuredProvidersAtom,
  );
  return (
    <ProviderCardBase
      providerConfig={providerConfig}
      settings={{ apiKey: "", baseURL: "" }}
      isConfigured={false}
      onSave={(settings, providerId) => {
        if (providerId) {
          const newProvider: Provider = {
            type: providerConfig.id === "openai" ? "openai" : "mistral",
            id: providerConfig.id,
            settings,
          };

          setConfiguredProviders([...configuredProviders, newProvider]);
          toast.success("Provider added successfully");
        }
      }}
    />
  );
};
