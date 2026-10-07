import { Button } from "./Button";
import { Inbox } from "lucide-react";

/**
 * Reusable EmptyState component for 'No Data Found' or 'Empty' scenarios.
 *
 * @param {Object} props
 * @param {string} props.title - The main heading (e.g., "No Data Found")
 * @param {string} props.description - Subtitle explaining the empty state
 * @param {string|React.ReactNode} [props.illustration] - Image URL or SVG component
 * @param {string} [props.actionLabel] - Text for the primary action button
 * @param {Function} [props.onAction] - Callback for the primary action button
 */
const EmptyState = ({
  title = "No Data Found",
  description = "There is nothing to show here at the moment.",
  illustration,
  actionLabel,
  onAction,
}: any) => {
  return (
    <div className="flex min-h-36 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-7 text-center sm:flex-row sm:justify-start sm:gap-5 sm:px-7 sm:text-left">
      {/* Illustration Area */}
      <div
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-2)] text-[var(--text-muted)] [&>svg]:h-6 [&>svg]:w-6"
      >
        {typeof illustration === "string" ? (
          <img src={illustration} alt="" className="h-10 w-10 object-contain" />
        ) : illustration ? (
          illustration
        ) : (
          <Inbox strokeWidth={1.5} />
        )}
      </div>

      {/* Text Content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-6 text-[var(--text-heading)]">
          {title}
        </h3>
        <p className="mt-1 max-w-lg text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      </div>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
