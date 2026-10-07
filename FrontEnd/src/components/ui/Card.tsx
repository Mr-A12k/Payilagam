import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg";
}

function Card({
  className,
  size = "default",
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group/card relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-5 transition-colors duration-150 text-sm text-[var(--text-primary)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: any) {
  return (
    <div
      data-slot="card-header"
      className={cn("group/card-header flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: any) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: any) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: any) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: any) {
  return (
    <div data-slot="card-content" className={cn("", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: any) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
