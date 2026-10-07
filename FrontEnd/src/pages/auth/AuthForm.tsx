import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import PayilagamLogo from "@/components/ui/PayilagamLogo";

export function AuthForm({ title, description, children, backTo = "/", backLabel }: {
  title: string; description: ReactNode; children: ReactNode; backTo?: string; backLabel?: string;
}) {
  const goBack = useBackNavigation(backTo);
  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col bg-[var(--bg-base)] px-4 py-4 text-[var(--text-primary)] sm:px-6 sm:py-6">
      <nav aria-label="Back" className="mx-auto w-full max-w-5xl">
        {backLabel ? <Link to={backTo} className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-[var(--text-muted)] hover:text-[var(--text-heading)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />{backLabel}
        </Link> : <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-[var(--text-muted)] hover:text-[var(--text-heading)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Go back
        </button>}
      </nav>
      <section aria-labelledby="auth-title" className="mx-auto my-auto w-full min-w-0 max-w-sm py-6 sm:py-10">
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-[var(--text-heading)]">
          <PayilagamLogo className="h-7 w-7 shrink-0" />Payilagam
        </div>
        <h1 id="auth-title" className="text-2xl font-semibold text-[var(--text-heading)]">{title}</h1>
        <div className="mt-2 mb-6 break-words text-sm leading-6 text-[var(--text-muted)]">{description}</div>
        {children}
      </section>
    </div>
  );
}

export function AuthField({ label, visible, onToggleVisibility, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  id: string; label: string; visible?: boolean; onToggleVisibility?: () => void;
}) {
  const toggleLabel = `${visible ? "Hide" : "Show"} ${label.toLowerCase()}`;
  return (
    <div className="min-w-0">
      <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">{label}</label>
      <div className="relative">
        <input {...props} type={onToggleVisibility ? (visible ? "text" : "password") : props.type}
          className={`block min-h-11 w-full min-w-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${onToggleVisibility ? "pr-12" : ""}`} />
        {onToggleVisibility && <button type="button" onClick={onToggleVisibility} aria-label={toggleLabel} title={toggleLabel} aria-pressed={visible} aria-controls={props.id}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-heading)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]">
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>}
      </div>
    </div>
  );
}

export function AuthSubmit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return <button type="submit" disabled={busy} aria-busy={busy}
    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--text-heading)] px-3 py-2 text-sm font-semibold text-[var(--bg-surface)] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] disabled:cursor-wait disabled:opacity-60">
    {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />}{children}
  </button>;
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="rounded text-sm font-medium text-[var(--accent-primary)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]">{children}</Link>;
}
