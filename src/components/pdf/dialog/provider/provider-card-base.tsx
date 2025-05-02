import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/origin-ui/password-input";
import { toast } from "sonner";
import { useState } from "react";
import { ProviderSettings } from "@/atoms/setting/providers";
import { ProviderConfig } from "../provider-settings-dialog";
import { Pencil, Plus, Trash } from "lucide-react";
import { useVerifyKey } from "@/queries/setting/use-api-provider";

const EditForm = ({
  providerConfig,
  settings,
  onCancel,
  onSave,
}: {
  providerConfig: ProviderConfig;
  settings: ProviderSettings;
  onCancel: () => void;
  onSave: (settings: ProviderSettings, providerId?: string) => void;
}) => {
  const [tempSettings, setTempSettings] = useState<ProviderSettings>(settings);
  const { mutateAsync: verifySettings, isPending: isVerifying } =
    useVerifyKey();

  const handleVerify = async () => {
    if (!tempSettings.apiKey) {
      toast.error("Please provide API key");
      return;
    }

    const verified = await verifySettings({
      settings: tempSettings,
      providerId: providerConfig.id,
    });
    if (verified) {
      onSave(tempSettings, providerConfig.id);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex flex-col gap-2">
        <PasswordInput
          placeholder="API Key"
          value={tempSettings.apiKey}
          onChange={(e) =>
            setTempSettings({ ...tempSettings, apiKey: e.target.value })
          }
        />
        {providerConfig.showBaseUrl && (
          <Input
            placeholder="Base URL (Optional)"
            value={tempSettings.baseURL}
            onChange={(e) =>
              setTempSettings({ ...tempSettings, baseURL: e.target.value })
            }
          />
        )}
        <div className="flex flex-row gap-2 justify-end mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTempSettings(settings);
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProviderCardBase = ({
  providerConfig,
  settings,
  isConfigured = false,
  onEdit,
  onDelete,
  onSave,
}: {
  providerConfig: ProviderConfig;
  settings: ProviderSettings;
  isConfigured?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave: (settings: ProviderSettings, providerId?: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col border rounded-md p-3">
      <div className="flex flex-row justify-between items-center">
        {/* Provider icon, name and tags */}
        <div className="flex flex-row items-center gap-2">
          <span>{providerConfig.icon}</span>
          <span className="font-medium">{providerConfig.name}</span>
          <div className="flex flex-row gap-1">
            {providerConfig.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions buttons */}
        <div>
          {!isEditing && !isConfigured && (
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
          {!isEditing && isConfigured && (
            <div className="flex flex-row gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8"
                onClick={() => {
                  onEdit?.();
                  setIsEditing(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8"
                onClick={onDelete}
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <EditForm
          providerConfig={providerConfig}
          settings={settings}
          onSave={(settings, providerId) => {
            onSave(settings, providerId);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};
