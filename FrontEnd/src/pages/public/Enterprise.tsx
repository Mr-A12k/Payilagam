import { Building2, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Enterprise = () => {
  return (
    <div className="min-h-[80vh] relative overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs font-bold uppercase tracking-widest mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>Payilagam for Business</span>
        </div>
        
        <div className="w-24 h-24 bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] rounded-2xl flex items-center justify-center mb-8 shadow-xl relative group">
          <Building2 className="w-12 h-12 text-[var(--accent-primary)] relative z-10" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--text-heading)] mb-6 tracking-tight">
          Upskill Your Entire <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Engineering Team</span>
        </h1>
        
        <p className="text-[var(--text-secondary)] max-w-2xl text-lg md:text-xl mb-12 leading-relaxed">
          Empower your developers with industry-leading courses, hands-on coding environments, and advanced analytics. Our Enterprise portal is launching soon.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <a
            href="mailto:contact@Payilagamedtech.com"
            className="w-full sm:w-auto px-8 py-4 bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            Contact Sales <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/courses"
            className="w-full sm:w-auto px-8 py-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-sm"
          >
            Browse Catalog
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 rounded-2xl shadow-sm hover:border-[var(--accent-primary)] transition-colors">
            <Users className="w-8 h-8 text-[var(--accent-primary)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">Team Management</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Assign courses, track progress, and monitor performance across your entire organization.</p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 rounded-2xl shadow-sm hover:border-[var(--accent-primary)] transition-colors">
            <Zap className="w-8 h-8 text-[var(--accent-primary)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">Hands-on Labs</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Real-world coding environments that bridge the gap between theory and actual production work.</p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 rounded-2xl shadow-sm hover:border-[var(--accent-primary)] transition-colors">
            <ShieldCheck className="w-8 h-8 text-[var(--accent-primary)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">Enterprise Security</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">SSO integration, role-based access control, and dedicated support for your organization.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;

