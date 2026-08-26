import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-[0.96]",
        outline:
          "border border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 bg-transparent text-slate-200 hover:text-white shadow-sm active:scale-[0.96]",
        secondary:
          "border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-200 shadow-sm hover:shadow-lg active:scale-[0.96]",
        ghost:
          "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 active:scale-[0.96]",
        destructive:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-[0.96]",
        link: "text-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "p-2 rounded-xl h-10 w-10",
        "icon-sm": "p-1.5 rounded-lg h-8 w-8",
        "icon-lg": "p-2.5 rounded-2xl h-12 w-12",
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
