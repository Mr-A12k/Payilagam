import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Loader2, AlertTriangle, Info } from "lucide-react";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  destructive = false,
  icon: CustomIcon,
}: any) {
  const Icon = CustomIcon || (destructive ? AlertTriangle : Info);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: any) => !open && !isLoading && onClose()}
    >
      <DialogContent className="max-w-[400px] p-6">
        <div className="flex items-start gap-3 pr-4">
          <div
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
              destructive
                ? "bg-red-500/10 text-[var(--status-danger)]"
                : "bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]"
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-base font-semibold">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 text-sm"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 text-sm"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
