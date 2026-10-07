import { Shield, FileText, Lock, FileWarning } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[var(--text-heading)] tracking-tight sm:text-5xl mb-4">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Service</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 text-[var(--text-secondary)]">
          <section className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-heading)]">1. Agreement to Terms</h2>
            </div>
            <p className="leading-relaxed">
              By accessing or using Payilagam, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-heading)]">2. User License</h2>
            </div>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Payilagam's website for personal, non-commercial transitory viewing only.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                <FileWarning className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-heading)]">3. Disclaimer</h2>
            </div>
            <p className="leading-relaxed">
              The materials on Payilagam's website are provided on an 'as is' basis. Payilagam makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-heading)]">4. Privacy Policy</h2>
            </div>
            <p className="leading-relaxed">
              Your use of Payilagam is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
