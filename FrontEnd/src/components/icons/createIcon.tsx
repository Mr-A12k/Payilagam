import { forwardRef, type ReactNode } from "react";
import type { IconProps } from "./types";

/**
 * Creates high-end duotone & badge vector icons.
 * Features:
 * - Duotone multi-layered geometry (fill + stroke + highlights)
 * - Automatic squircle badge mode for cards (matching the user's UI screenshot)
 * - Full parity with Lucide props (size, color, strokeWidth, className)
 */
export function createIcon(
  displayName: string,
  renderGlyph: (props: IconProps) => ReactNode,
  defaultBadgeBg = "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
) {
  const Component = forwardRef<SVGSVGElement, IconProps>(
    (
      {
        size = 20,
        color = "currentColor",
        strokeWidth = 2,
        className = "",
        variant = "duotone",
        badgeBg,
        badgeRadius = 8,
        style,
        children,
        ...restProps
      },
      ref,
    ) => {
      const dimension = typeof size === "number" ? `${size}px` : size;
      const isBadge = variant === "badge";

      // If badge variant is requested, wrap in a glowing squircle tile matching the screenshot
      if (isBadge) {
        const badgeSize =
          typeof size === "number" ? Math.max(36, size + 16) : "40px";
        return (
          <div
            className={`inline-flex items-center justify-center shrink-0 border border-[var(--border-subtle)] ${className}`}
            style={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: `${badgeRadius}px`,
              background: badgeBg || defaultBadgeBg,
              color,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
              ...style,
            }}
          >
            <svg
              ref={ref}
              width={dimension}
              height={dimension}
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              role="img"
              {...restProps}
            >
              {renderGlyph({
                size,
                color,
                strokeWidth,
                className,
                variant,
                ...restProps,
              })}
              {children}
            </svg>
          </div>
        );
      }

      return (
        <svg
          ref={ref}
          width={dimension}
          height={dimension}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 select-none ${className}`}
          style={style}
          aria-hidden="true"
          role="img"
          {...restProps}
        >
          {renderGlyph({
            size,
            color,
            strokeWidth,
            className,
            variant,
            ...restProps,
          })}
          {children}
        </svg>
      );
    },
  );

  Component.displayName = displayName;
  return Component;
}
