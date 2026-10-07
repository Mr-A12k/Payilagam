import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspacePage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("workspace-page", className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="workspace-page-header">
      <div className="min-w-0">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="workspace-page-actions">{actions}</div>}
    </header>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div role="status" className="workspace-state">
      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="workspace-state">
      <Inbox className="h-6 w-6 text-[var(--text-muted)]" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
