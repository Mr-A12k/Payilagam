import { cn } from "@/lib/utils";

/**
 * GlassContainer – a reusable wrapper that applies a translucent, blurred background
 * with optional border and shadow. Use it to create card‑like UI elements that match
 * the Apple‑inspired glass‑morphism aesthetic.
 */
const GlassContainer = ({ children, className, style }: any) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassContainer;
