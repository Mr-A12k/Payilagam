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
      <DialogContent className="sm:max-w-[400px] p-8 text-center bg-gradient-to-br from-[#182232] to-[#0f172a] border border-slate-800/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
        {/* Neon blur accents */}
        <div className={`absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${destructive ? "bg-red-500/5" : "bg-blue-500/5"}`} />
        <div className={`absolute -left-24 -bottom-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${destructive ? "bg-rose-500/5" : "bg-indigo-500/5"}`} />

        <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
          <div
            className={`inline-flex items-center justify-center rounded-2xl p-4 border transition-transform duration-300 hover:scale-110 ${
              destructive
                ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            }`}
          >
            <Icon className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-xl font-black tracking-tight text-slate-100">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-slate-400 leading-relaxed font-medium mx-auto max-w-[280px]">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full relative z-10">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:flex-1 border-slate-800 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white font-bold h-11 text-xs uppercase tracking-wider rounded-xl transition-all duration-300"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:flex-1 font-bold h-11 text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md ${
              destructive
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/30"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30"
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
