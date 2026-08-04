
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: any) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full px-4 py-2 rounded-md transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/80 bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:border-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
