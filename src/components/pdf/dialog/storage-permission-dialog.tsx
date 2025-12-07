import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StoragePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestPermission: () => void;
}

export function StoragePermissionDialog({
  open,
  onOpenChange,
  onRequestPermission,
}: StoragePermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Persistent Storage</DialogTitle>
          <DialogDescription>
            <b>
              Data may be cleared when your disk space is low due to browser
              policy.
            </b>
            <br />
            To avoid data loss, you can grant permission to use persistent
            storage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onRequestPermission}>Grant Permission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
