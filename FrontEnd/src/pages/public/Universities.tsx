/**
 * @fileoverview Universities Marketing Page
 * Targets higher education institutions for partnership.
 */
import { Building2, Users, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { Link } from "react-router-dom";

const Universities = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] text-sm font-semibold mb-6 border border-[var(--accent-primary-border)]">
            <GraduationCap className="w-4 h-4" /> Higher Education Partners
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[var(--text-heading)]">
            Empower Your Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Industry-Ready Skills</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-10">
            Partner with Payilagam to bring cutting-edge tech curricula, hands-on labs, and expert mentorship directly to your campus. Bridge the gap between academia and industry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-white shadow-md">
              Partner With Us
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 border-[var(--border-default)] hover:bg-[var(--bg-hover)]">
              Download Brochure
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-[var(--bg-surface-2)] border-y border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-default)] hover:border-[var(--accent-primary)] shadow-sm transition-colors">
              <div className="w-14 h-14 bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-heading)]">Campus Integration</h3>
              <p className="text-[var(--text-secondary)]">Seamlessly integrate our platform with your existing LMS. Single sign-on and custom branding available for premium partners.</p>
            </div>
            <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-default)] hover:border-[var(--accent-primary)] shadow-sm transition-colors">
              <div className="w-14 h-14 bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-heading)]">Expert Mentorship</h3>
              <p className="text-[var(--text-secondary)]">Give your students access to our network of industry professionals who provide code reviews, career guidance, and live Q&A sessions.</p>
            </div>
            <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-default)] hover:border-[var(--accent-primary)] shadow-sm transition-colors">
              <div className="w-14 h-14 bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-heading)]">Placement Prep</h3>
              <p className="text-[var(--text-secondary)]">Specialized modules designed to crack product-based company interviews, including DSA, system design, and mock interviews.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 text-center bg-[var(--bg-base)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-heading)]">Ready to transform your curriculum?</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">Join 50+ universities already using Payilagam to boost their placement rates and student satisfaction.</p>
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-blue-500/20 group bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-white">
          <Link to="/contact">
            Contact Sales <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Universities;
