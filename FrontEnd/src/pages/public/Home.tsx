import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  // GraduationCap,
  ArrowRight,
  Code2,
  Database,
  Shield,
  Zap,
  Sparkles,
  CheckCircle2,
  BookOpenCheck,
  GitFork,
  HeartHandshake,
  TerminalSquare,
} from "lucide-react";
import PayilagamLogo from "@/components/ui/PayilagamLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
// import { Input } from "@/components/ui/Input";

const Home = () => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.pageAccess?.includes("PG_ADM"))
        navigate("/admin", { replace: true });
      else if (user.pageAccess?.includes("PG_MNT"))
        navigate("/mentor", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Background Gradients & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all duration-500">
            <Sparkles className="icon-base" />
            <span>Redefining Tech Education. Open Source.</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-6 drop-shadow-sm">
            Payilagam
          </h1>

          <p className="max-w-3xl text-xl md:text-3xl font-medium text-slate-300 mb-6 leading-tight">
            Learn tech with{" "}
            <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
              no paywall
            </span>{" "}
            between you and practice.
          </p>

          <p className="max-w-2xl text-base md:text-lg text-slate-400 mb-10 leading-relaxed">
            Premium courses, interactive coding labs, and expert mentorship.
            Built for students who demand excellence and open access.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            {/* Fitts's Law: Large clickable area, rounded corners */}
            <Link to="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all duration-300 border border-blue-400/50 flex items-center justify-center gap-2 group"
              >
                Start Learning{" "}
                <ArrowRight className="icon-md group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 font-semibold text-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center"
              >
                Join the Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Open Learning Promise */}
      <section className="relative py-20 border-y border-slate-800/60 bg-slate-950/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-blue-500/50 group-hover:shadow-[0_0_25px_rgba(96,165,250,0.2)] transition-all duration-500">
              <BookOpenCheck className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Zero Paywalls
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Access the core learning paths, practice labs, and premium
              resources absolutely free.
            </p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-sky-400/50 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] transition-all duration-500">
              <GitFork className="w-8 h-8 text-sky-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Open Source Core
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Built in public. Contribute, adapt, and deploy for your own
              educational institution.
            </p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-blue-400/50 group-hover:shadow-[0_0_25px_rgba(129,140,248,0.2)] transition-all duration-500">
              <HeartHandshake className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Expert Mentorship
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Connect with industry veterans when you're stuck. Real feedback on
              real projects.
            </p>
          </div>
        </div>
      </section>

      {/* Bento Box Curriculum Section (Hick's Law) */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 tracking-tight">
              Master Modern Tech
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Curated pathways designed to transform beginners into
              highly-capable engineers through structured learning.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
            {/* Main Feature - Spans 2 cols, 2 rows */}
            <Card onClick={() => navigate('/courses')} className="md:col-span-2 md:row-span-2 group relative overflow-hidden !p-8 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] transition-all duration-500 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Code2 className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold text-slate-100 mb-4">
                  Software Engineering
                </h3>
                <p className="text-slate-400 text-lg mb-6 max-w-md">
                  From fundamentals to advanced system architecture. Master
                  React, Node.js, and modern enterprise frameworks.
                </p>
              </div>
              <div className="relative z-10 flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                Explore 120+ Courses{" "}
                <ArrowRight className="ml-2 icon-md group-hover:translate-x-1 transition-transform" />
              </div>
              {/* Abstract decorative element */}
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none"></div>
            </Card>

            {/* Feature 2 - Spans 2 cols */}
            <Card onClick={() => navigate('/courses?category=data')} className="md:col-span-2 group relative overflow-hidden !p-8 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500 cursor-pointer">
              <div className="relative z-10 flex justify-between items-start h-full">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
                    <Database className="icon-lg text-sky-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">
                    Data Science & AI
                  </h3>
                  <p className="text-slate-400 text-base max-w-sm flex-grow">
                    Dive into machine learning, deep neural networks, and robust
                    data processing pipelines.
                  </p>
                  <div className="flex items-center text-sky-400 font-semibold group-hover:text-sky-300 transition-colors mt-4">
                    Explore 85+ Courses
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 text-slate-400 transition-colors flex-shrink-0">
                  <ArrowRight className="icon-md -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card onClick={() => navigate('/courses?category=cloud')} className="group relative overflow-hidden !p-8 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 cursor-pointer">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Zap className="icon-lg text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">
                  Cloud Computing
                </h3>
                <p className="text-slate-400 text-sm flex-grow">
                  Deploy scalable infrastructure seamlessly on AWS, Azure, and
                  Google Cloud.
                </p>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 text-slate-400 transition-colors mt-4">
                  <ArrowRight className="icon-base -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card onClick={() => navigate('/courses?category=security')} className="group relative overflow-hidden !p-8 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-500 cursor-pointer">
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Shield className="icon-lg text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">
                  Cybersecurity
                </h3>
                <p className="text-slate-400 text-sm flex-grow">
                  Defend networks, perform ethical hacking, and secure
                  applications.
                </p>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 text-slate-400 transition-colors mt-4">
                  <ArrowRight className="icon-base -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </Card>

            {/* Feature 5 - Wide */}
            <Card onClick={() => navigate('/labs')} className="md:col-span-3 lg:col-span-4 group relative overflow-hidden !p-8 bg-gradient-to-r from-slate-900 to-blue-950/40 flex items-center justify-between hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] transition-all duration-500 cursor-pointer">
              <div className="flex items-center gap-6 z-10">
                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 items-center justify-center">
                  <TerminalSquare className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">
                    Interactive Coding Labs
                  </h3>
                  <p className="text-slate-400 text-base max-w-2xl">
                    Practice in real browser-based environments. No setup
                    required. Just code, run, and learn instantly with live
                    feedback.
                  </p>
                </div>
              </div>
              <div className="hidden md:block z-10">
                <Button className="rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors group-hover:bg-blue-600 group-hover:border-blue-500">
                  Try Labs <ArrowRight className="ml-2 icon-base" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Immersive CTA Section */}
      <section className="relative py-28 border-t border-slate-800/50">
        <div className="absolute inset-0 bg-blue-950/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-8">
            Ready to break the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 drop-shadow-sm">
              paywall barrier?
            </span>
          </h2>
          <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of students learning freely, building together, and
            shaping the future of open-source education.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 border border-blue-400/50"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10 text-sm font-medium text-blue-200/80">
            <span className="flex items-center gap-2.5 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="icon-base text-sky-400" /> Free Forever
            </span>
            <span className="flex items-center gap-2.5 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="icon-base text-sky-400" /> Open Source
            </span>
            <span className="flex items-center gap-2.5 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="icon-base text-sky-400" /> Student First
            </span>
          </div>
        </div>
      </section>

      {/* Premium Dark Footer */}
      <footer className="bg-slate-950 pt-20 pb-12 relative z-10 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 text-white mb-6">
                <PayilagamLogo
                  size={40}
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0"
                />
                <span className="font-extrabold text-2xl tracking-tight">
                  Payilagam
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                Empowering the next generation of tech leaders with accessible,
                high-quality education and expert mentorship. Built by the
                community, for the community.
              </p>
              {/* Social Icons with micro-interactions */}
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 group"
                >
                  <svg
                    className="icon-base group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-sky-400 hover:border-sky-500/30 transition-all duration-300 group"
                >
                  <svg
                    className="icon-base group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-500/30 transition-all duration-300 group"
                >
                  <svg
                    className="icon-base group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-slate-100 font-bold mb-6 text-sm uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <Link
                    to="/courses"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link
                    to="/labs"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Interactive Labs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/mentors"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Mentorship
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-bold mb-6 text-sm uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Blog & Insights
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Community Forum
                  </Link>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-bold mb-6 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Payilagam. Open-source learning for
              students.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link
                to="/privacy"
                className="hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
