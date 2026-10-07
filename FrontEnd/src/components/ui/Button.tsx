import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-[var(--action-text)]",
        outline:
          "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
        secondary:
          "bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)]",
        ghost:
          "bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        destructive:
          "bg-[var(--danger-bg)] text-[var(--danger-text)] hover:opacity-90",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3.5 py-2 text-[13px]",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "p-2 rounded-md h-10 w-10",
        "icon-sm": "p-1.5 rounded-md h-8 w-8",
        "icon-lg": "p-2.5 rounded-md h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

import { type VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
