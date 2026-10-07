import { useState } from "react";
import * as Icons from "./CustomIcons";
import { IconSearch } from "./CustomIcons";

const ICON_ENTRIES = Object.entries(Icons).filter(([name]) =>
  name.startsWith("Icon"),
);

export function IconShowcase() {
  const [filter, setFilter] = useState("");
  const [variant, setVariant] = useState<"duotone" | "badge">("badge");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = ICON_ENTRIES.filter(([name]) =>
    name.toLowerCase().includes(filter.toLowerCase().trim()),
  );

  const handleCopy = (name: string) => {
    const code =
      variant === "badge"
        ? `<${name} variant="badge" size={22} />`
        : `<${name} size={22} />`;
    navigator.clipboard?.writeText(code);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-heading)]">
            Custom SVG Icon Suite (Duotone & Badges)
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Layered 2.5D vectors with volumetric fills & optional tile badge
            mode matching the Cyber theme.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs font-medium">
            <button
              type="button"
              onClick={() => setVariant("badge")}
              className={`px-3 py-1 rounded-md transition-colors ${
                variant === "badge"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Badge Mode
            </button>
            <button
              type="button"
              onClick={() => setVariant("duotone")}
              className={`px-3 py-1 rounded-md transition-colors ${
                variant === "duotone"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Duotone
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={15}
            />
            <input
              type="text"
              placeholder="Search icons..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {filtered.map(([name, IconComponent]) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCopy(name)}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)] transition-all cursor-pointer relative"
          >
            <div className="w-12 h-12 flex items-center justify-center text-[var(--accent-primary)] group-hover:scale-105 transition-transform">
              <IconComponent variant={variant} size={22} />
            </div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] mt-2 truncate max-w-full">
              {name.replace(/^Icon/, "")}
            </span>
            {copied === name && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[var(--accent-success)] text-white px-2 py-0.5 rounded-full shadow-md animate-fade-in">
                Copied!
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
        <span>
          Total: {ICON_ENTRIES.length} redesigned duotone & badge icons
        </span>
        <span>Click any tile to copy JSX tag with current variant</span>
      </div>
    </div>
  );
}
