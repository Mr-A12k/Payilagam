import { Button } from "./Button";

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
  illustration = "/empty-state.png",
  actionLabel,
  onAction,
}: any) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] w-full rounded-2xl border border-slate-800/60 bg-slate-950 shadow-2xl shadow-slate-900/50">
      {/* Illustration Area */}
      <div className="mb-8 flex justify-center relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
        {typeof illustration === "string" ? (
          <img
            src={illustration}
            alt="Empty State"
            className="h-56 w-56 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform duration-500"
          />
        ) : illustration ? (
          illustration
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10 text-blue-200">
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Text Content */}
      <h3 className="mb-2 text-xl font-bold text-slate-300">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500 leading-relaxed">
        {description}
      </p>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-400 text-white hover:bg-blue-500 shadow-md shadow-blue-100/50 rounded-xl px-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;


