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
      <DialogContent className="sm:max-w-[400px] p-6 sm:p-8 text-center bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-5">
          <div 
            className={`inline-flex items-center justify-center rounded-full p-4 mb-2 ${
              destructive 
                ? 'bg-red-500/10 text-red-500 ring-8 ring-red-500/5' 
                : 'bg-blue-500/10 text-blue-500 ring-8 ring-blue-500/5'
            }`}
          >
            <Icon className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-100">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-slate-400 leading-relaxed mx-auto max-w-[280px]">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading} 
            className="w-full sm:flex-1 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white font-medium h-11"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:flex-1 font-medium h-11 ${
              destructive 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
