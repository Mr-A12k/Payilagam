import { Building2, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Enterprise = () => {
  return (
    <div className="min-h-[80vh] relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-blue-500/30 font-sans">
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
          <Zap className="w-3.5 h-3.5" />
          <span>Payilagam for Business</span>
        </div>
        
        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/20 relative group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
          <Building2 className="w-12 h-12 text-blue-400 relative z-10" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-6 tracking-tight drop-shadow-sm">
          Upskill Your Entire <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Engineering Team</span>
        </h1>
        
        <p className="text-slate-400 max-w-2xl text-lg md:text-xl mb-12 leading-relaxed">
          Empower your developers with industry-leading courses, hands-on coding environments, and advanced analytics. Our Enterprise portal is launching soon.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <a
            href="mailto:contact@Payilagamedtech.com"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
          >
            Contact Sales <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/courses"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl font-bold text-lg transition-all flex items-center justify-center shadow-lg"
          >
            Browse Catalog
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-slate-700 transition-colors">
            <Users className="w-8 h-8 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-2">Team Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Assign courses, track progress, and monitor performance across your entire organization.</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-slate-700 transition-colors">
            <Zap className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-2">Hands-on Labs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Real-world coding environments that bridge the gap between theory and actual production work.</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-slate-700 transition-colors">
            <ShieldCheck className="w-8 h-8 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-2">Enterprise Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">SSO integration, role-based access control, and dedicated support for your organization.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;

