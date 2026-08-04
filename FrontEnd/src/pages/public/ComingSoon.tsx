/**
 * @file ComingSoon.jsx
 * @description A beautiful "Coming Soon" page shown when users click on
 * lab types that are not yet available (Circuit Lab, Database Lab, etc.)
 * Receives the lab name via URL search params: /coming-soon?feature=Circuit+Lab
 */
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Bell, Sparkles, Zap, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const ComingSoon = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const feature = params.get("feature") || "This Feature";
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    toast.success("We'll notify you when it's ready! 🎉", { duration: 3000 });
  };

  // Floating orb positions for animation variety
  const orbs = [
    { size: "w-72 h-72", color: "bg-blue-600/15",   pos: "top-10 left-10",    delay: "0s"   },
    { size: "w-96 h-96", color: "bg-purple-600/10", pos: "top-1/3 right-10",  delay: "1.5s" },
    { size: "w-64 h-64", color: "bg-cyan-600/10",   pos: "bottom-20 left-1/4",delay: "3s"   },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Animated background orbs */}
      {orbs.map((orb: any, i: any) => (
        <div
          key={i}
          className={`absolute ${orb.size} ${orb.color} ${orb.pos} rounded-full blur-[80px] pointer-events-none animate-pulse`}
          style={{ animationDelay: orb.delay, animationDuration: "4s" }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border-default) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        style={{
          background: "var(--bg-surface-2)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-default)",
        }}
        onMouseEnter={(e: React.SyntheticEvent<any>) => { e.currentTarget.style.color = "var(--text-primary)"; }}
        onMouseLeave={(e: React.SyntheticEvent<any>) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Labs
      </button>

      {/* Main card */}
      <div className="relative z-10 max-w-lg w-full text-center">

        {/* Icon */}
        <div className="relative inline-flex mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-xl scale-110" />
          <div
            className="relative w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #1e40af22, #7c3aed22)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <Clock className="w-14 h-14" style={{ color: "var(--accent-primary)" }} />
          </div>

          {/* Floating stars */}
          {[
            { cls: "-top-3 -right-3", size: "w-6 h-6", color: "#f59e0b" },
            { cls: "-bottom-2 -left-3", size: "w-5 h-5", color: "#a78bfa" },
            { cls: "top-0 -left-5",    size: "w-4 h-4", color: "#34d399" },
          ].map((star: any, i: any) => (
            <div
              key={i}
              className={`absolute ${star.cls} animate-bounce`}
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: "2s" }}
            >
              <Star className={`${star.size} fill-current`} style={{ color: star.color }} />
            </div>
          ))}
        </div>

        {/* Label badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{
            background: "var(--accent-primary-subtle)",
            color: "var(--accent-primary)",
            border: "1px solid var(--accent-primary-border)",
          }}
        >
          <Zap className="w-3.5 h-3.5" />
          Coming Soon
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight"
          style={{ color: "var(--text-heading)" }}
        >
          {feature}
          <span className="block text-2xl md:text-3xl font-bold mt-1"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            is on the way
          </span>
        </h1>

        {/* Description */}
        <p className="text-base leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Our team is working hard to bring you an incredible{" "}
          <strong style={{ color: "var(--text-primary)" }}>{feature}</strong>{" "}
          experience. Stay tuned — it's going to be worth the wait!
        </p>

        {/* Progress bar (decorative) */}
        <div className="mb-10">
          <div className="flex justify-between text-xs font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Development progress</span>
            <span style={{ color: "var(--accent-primary)" }}>68%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--bg-surface-3)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: "68%",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                boxShadow: "0 0 12px rgba(99,102,241,0.5)",
              }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleNotify}
            disabled={notified}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-70"
            style={{
              background: notified ? "var(--bg-surface-2)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: notified ? "var(--text-muted)" : "#ffffff",
              border: notified ? "1px solid var(--border-default)" : "none",
              boxShadow: notified ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            <Bell className="w-4 h-4" />
            {notified ? "You'll be notified! ✓" : "Notify Me When Ready"}
          </button>

          <button
            onClick={() => navigate("/labs")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: "var(--bg-surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e: React.SyntheticEvent<any>) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e: React.SyntheticEvent<any>) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Other Labs
          </button>
        </div>

        {/* Feature chips */}
        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {["Interactive Environment", "Real Hardware Sim", "No Setup Required", "Browser-Based"].map((tag: any) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "var(--bg-surface-2)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-default)",
              }}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
