import { cn } from "@/lib/utils";

/**
 * Custom Loader Component for TaskPro
 * Features a sleek, modern concentric rings animation with a glowing core,
 * providing a premium glassmorphic feel.
 */
const Loader = ({
  fullScreen = false,
  text = "Loading...",
  className,
}: any) => {
  const loaderContent = (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6",
        className,
      )}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>

        {/* Outer spinning ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/50 animate-spin"
          style={{ animationDuration: "1.5s" }}
        ></div>

        {/* Inner spinning ring (opposite direction) */}
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-sky-400 border-l-sky-400/50 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1s" }}
        ></div>

        {/* Glowing core */}
        <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse"></div>
      </div>

      {text && (
        <p className="text-xs md:text-sm font-semibold text-sky-400 animate-pulse tracking-widest uppercase">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
