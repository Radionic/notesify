import { useAtom } from "jotai";
import { toast } from "sonner";
import {
  configuredProvidersAtom,
  type Provider,
} from "@/atoms/setting/providers";
import type { ProviderConfig } from "../provider-settings-dialog";
import { ProviderCardBase } from "./provider-card-base";

type ConfiguredProviderCardProps = {
  provider: Provider;
  providerConfig: ProviderConfig;
};

export const ConfiguredProviderCard = ({
  provider,
  providerConfig,
}: ConfiguredProviderCardProps) => {
  const [configuredProviders, setConfiguredProviders] = useAtom(
    configuredProvidersAtom,
  );

  return (
    <ProviderCardBase
      providerConfig={providerConfig}
      settings={provider.settings}
      isConfigured={true}
      onDelete={() => {
        const updatedProviders = configuredProviders.filter(
          (p) => p.id !== provider.id,
        );
        setConfiguredProviders(updatedProviders);
        toast.success("Provider removed successfully");
      }}
      onSave={(settings) => {
        const updatedProviders = configuredProviders.map((p) =>
          p.id === provider.id ? { ...p, settings } : p,
        );
        setConfiguredProviders(updatedProviders);
        toast.success("Provider updated successfully");
      }}
    />
  );
};
