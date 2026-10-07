import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-w-0 w-full h-10 px-3 py-2 rounded-md transition-colors duration-150 bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
