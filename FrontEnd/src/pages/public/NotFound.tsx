import { Link, useNavigate } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { Button } from "@/components/ui";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import EmptyState from "@/components/ui/EmptyState";
import { ArrowLeft, Home } from "lucide-react";

/**
 * @fileoverview A premium 404 Not Found page aligned with the Midnight Blue theme.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const goBack = useBackNavigation("/");

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-inter selection:bg-blue-500/30">
      {/* Header */}
      <header className="absolute top-0 w-full p-6 z-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <PayilagamLogo size={32} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-xl text-[var(--text-heading)] tracking-tight">Payilagam</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl w-full relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-[120px] md:text-[180px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-heading)] to-[var(--text-muted)] drop-shadow-sm leading-none select-none opacity-40">
              404
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] mt-4 tracking-tight">
              Lost in the digital void
            </p>
          </div>

          <EmptyState actionLabel="Go Home" onAction={()=>{}} 
            title="Page Not Found"
            description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
            illustration="/empty-state.png"
          />

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={goBack}
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] gap-2 rounded-xl shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="w-full sm:w-auto h-12 px-8 bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-white shadow-md gap-2 rounded-xl"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
