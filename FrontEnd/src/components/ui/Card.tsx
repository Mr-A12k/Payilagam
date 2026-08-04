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
  const divRef = React.useRef(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);

  const handleMouseMove = (event: any) => {
    if (!divRef.current) return;
    const rect = (divRef.current as any).getBoundingClientRect();
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (onMouseMove) onMouseMove(event);
  };

  const handleMouseEnter = (event: any) => {
    setOpacity(1);
    if (onMouseEnter) onMouseEnter(event);
  };

  const handleMouseLeave = (event: any) => {
    setOpacity(0);
    if (onMouseLeave) onMouseLeave(event);
  };

  return (
    <div
      ref={divRef}
      data-slot="card"
      data-size={size}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-md bg-[var(--bg-card)] backdrop-blur-md bg-opacity-90 border border-[var(--border-default)] shadow-[0_4px_24px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.05)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-500/40 text-sm text-[var(--text-primary)]",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.15), transparent 40%)`,
        }}
      />
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
