/**
 * @fileoverview Government Marketing Page
 * Targets public sector and defense organizations.
 */
import { ShieldCheck, Server, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { Link } from "react-router-dom";

const Government = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-sm font-semibold mb-6 border border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" /> Public Sector & Defense
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Secure, Scalable Upskilling for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Government Agencies</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            Equip your workforce with critical digital skills through our secure, compliant, and highly customizable learning platform designed specifically for the public sector.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white">
              Request Demo
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-slate-700 hover:bg-slate-800">
              View Compliance Specs
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Enterprise Security</h3>
              <p className="text-slate-400">End-to-end encryption, regular security audits, and strict role-based access controls to protect sensitive training data and user information.</p>
            </div>
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">On-Premises Deployment</h3>
              <p className="text-slate-400">Option for self-hosted or private cloud deployment to meet strict data residency and sovereignty requirements.</p>
            </div>
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Compliance Ready</h3>
              <p className="text-slate-400">Built to meet FedRAMP, GDPR, and other stringent government compliance standards out of the box.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Modernize your workforce today.</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Contact our specialized government solutions team to discuss your unique upskilling and security requirements.</p>
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-emerald-900/30 group bg-emerald-600 hover:bg-emerald-700">
          <Link to="/contact">
            Contact Solutions Team <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Government;
