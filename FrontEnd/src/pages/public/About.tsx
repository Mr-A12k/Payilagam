/**
 * @fileoverview About page for Payilagam.
 * Renders a premium, visually stunning public-facing About page with
 * hero section, mission/vision/values cards, animated stats,
 * leadership team, company timeline, and a call-to-action section.
 */
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Target,
  Eye,
  Heart,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Globe,
  Rocket,
  Brain,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";


/* ────────────────────────────────────────────────────────────────────
 *  DATA
 * ──────────────────────────────────────────────────────────────────── */

const missionCards = [
  {
    icon: Target,
    title: "Our Mission",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description:
      "To democratize tech education by providing world-class courses, hands-on labs, and mentorship — completely free and open source for every student who wants to learn.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    description:
      "A world where financial barriers never stand between a motivated learner and the skills they need to build a successful career in technology.",
  },
  {
    icon: Heart,
    title: "Our Values",
    color: "text-slate-300",
    bg: "bg-slate-800",
    description:
      "Access first. Community driven. Radical transparency. We believe in building in public, welcoming contributions, and putting students at the center of everything we do.",
  },
];

const stats = [
  { value: "10,000+", label: "Students", icon: Users },
  { value: "200+", label: "Courses", icon: BookOpen },
  { value: "50+", label: "Mentors", icon: Award },
  { value: "95%", label: "Placement Rate", icon: TrendingUp },
];

const teamMembers = [
  {
    name: "Kabil",
    initials: "K",
    title: "Founder & CEO",
    bio: "Visionary leader with 10+ years in EdTech. Passionate about making quality tech education accessible to students from all backgrounds.",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
  {
    name: "Priya",
    initials: "P",
    title: "CTO",
    bio: "Full-stack architect and open-source advocate. Leads the engineering team building Payilagam's scalable, student-first platform.",
    color: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  },
  {
    name: "Arjun",
    initials: "A",
    title: "Head of Curriculum",
    bio: "Former senior engineer at top tech companies. Designs industry-aligned curricula that bridge the gap between academia and real-world skills.",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
  {
    name: "Divya",
    initials: "D",
    title: "Head of Community",
    bio: "Community builder and student success champion. Connects learners with mentors, organizes events, and fosters a supportive learning ecosystem.",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
];

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description:
      "Payilagam was born with a simple idea — free, high-quality tech education for every student in India.",
    icon: Rocket,
  },
  {
    year: "2021",
    title: "1,000 Students",
    description:
      "Crossed our first thousand active learners and launched 50+ free courses across web development and data science.",
    icon: Users,
  },
  {
    year: "2022",
    title: "Enterprise Launch",
    description:
      "Partnered with leading companies to offer enterprise training solutions while keeping the student platform free.",
    icon: Building2,
  },
  {
    year: "2023",
    title: "AI Integration",
    description:
      "Integrated AI-powered learning assistants, personalized course recommendations, and intelligent code review into the platform.",
    icon: Brain,
  },
  {
    year: "2024",
    title: "Global Expansion",
    description:
      "Expanded to serve students across 25+ countries with multilingual support and region-specific content.",
    icon: Globe,
  },
];

/* ────────────────────────────────────────────────────────────────────
 *  ANIMATED COUNTER HOOK
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Custom hook that animates a numeric value from 0 to the target
 * when the element scrolls into view.
 */
const useCountUp = (target: any, duration = 2000) => {
  const [count, setCount] = useState("0");
  const ref = useRef<any>(null);
  const hasAnimated = useRef<any>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]: any) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          /* Parse the numeric portion from strings like "10,000+" or "95%" */
          const numericString = target.replace(/[^0-9]/g, "");
          const end = parseInt(numericString, 10);
          const suffix = target.replace(/[0-9,]/g, "");
          const hasComma = target.includes(",");
          const start = 0;
          const startTime = performance.now();

          const animate = (now: any) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            /* Ease-out cubic */
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * eased);
            const formatted = hasComma
              ? current.toLocaleString("en-IN")
              : String(current);
            setCount(formatted + suffix);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
};

/* ────────────────────────────────────────────────────────────────────
 *  COMPONENT
 * ──────────────────────────────────────────────────────────────────── */

const StatCard = ({ stat }: any) => {
  const { ref, count } = useCountUp(stat.value);
  return (
    <div ref={ref as any} className="flex min-w-[200px] flex-col items-center !p-8 bg-slate-900/50 text-center transition-all duration-300 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-900/10 sm:min-w-0"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50">
        <stat.icon className="icon-lg text-blue-400" />
      </div>
      <span className="text-4xl font-bold tracking-tight text-slate-200">
        {count}
      </span>
      <span className="mt-2 text-sm font-medium text-slate-400">
        {stat.label}
      </span>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white"
        aria-label="About hero"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800/50 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-32 text-center sm:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm text-slate-300">
            <Sparkles className="icon-base text-blue-400" />
            Since 2020
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-slate-100">
            About Payilagam
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Empowering the next generation of tech professionals with
            world-class education
          </p>
        </div>
      </section>

      {/* ── Mission / Vision / Values ────────────────────────────────── */}
      <section className="bg-slate-950 py-24 relative" aria-label="Mission, vision, and values">
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-100">
              What Drives Us
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything we build starts with three pillars that keep students
              at the center.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {missionCards.map((card: any) => (
              <Card
                key={card.title}
                className="group relative !p-8 shadow-lg shadow-blue-900/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-slate-700 hover:shadow-blue-500/10"
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${card.bg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <card.icon className={`h-7 w-7 ${card.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-200">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {card.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────────────────── */}
      <section className="border-y border-slate-800 bg-slate-950 py-20" aria-label="Platform statistics">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {stats.map((stat: any) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Section ─────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-24" aria-label="Leadership team">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-100">
              Meet Our Leadership
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              A passionate team dedicated to making quality education
              accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member: any) => (
              <Card
                key={member.name}
                className="group !p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/10"
              >
                {/* Avatar circle with initials */}
                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${member.color} text-2xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-slate-200">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-blue-400">
                  {member.title}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline Section ─────────────────────────────────────────── */}
      <section className="bg-slate-950 py-24 relative" aria-label="Company timeline">
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-100">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Key milestones that have shaped Payilagam into what it is today.
            </p>
          </div>

          <div className="relative">
            {/* Vertical center line — hidden on mobile */}
            <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-gradient-to-b from-blue-500/20 via-slate-800 to-transparent md:left-1/2 md:block md:-translate-x-1/2" />

            <div className="space-y-12 md:space-y-16">
              {milestones.map((milestone: any, index: any) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={milestone.year}
                    className="relative flex flex-col gap-4 pl-12 md:flex-row md:items-center md:gap-8 md:pl-0"
                  >
                    {/* Mobile dot */}
                    <div className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-950 md:hidden">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>

                    {/* Left content */}
                    <div
                      className={`md:w-1/2 ${
                        isLeft ? "md:pr-12 md:text-right" : "md:order-2 md:pl-12"
                      }`}
                    >
                      <Card
                        className={`!p-6 shadow-sm shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-blue-500/10 ${
                          isLeft ? "md:ml-auto md:mr-0" : ""
                        } max-w-md`}
                      >
                        <div
                          className={`mb-3 flex items-center gap-3 ${
                            isLeft ? "md:flex-row-reverse" : ""
                          }`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                            <milestone.icon className="icon-md text-blue-400" />
                          </div>
                          <span className="text-sm font-bold text-blue-400">
                            {milestone.year}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-200">
                          {milestone.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {milestone.description}
                        </p>
                      </Card>
                    </div>

                    {/* Center dot — desktop only */}
                    <div className="absolute left-1/2 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-950 bg-gradient-to-br from-blue-500 to-sky-400 shadow-md shadow-blue-900/50 md:flex">
                      <div className="h-2 w-2 rounded-full bg-slate-900" />
                    </div>

                    {/* Spacer for the other half */}
                    <div
                      className={`hidden md:block md:w-1/2 ${
                        isLeft ? "md:order-2" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-slate-950 py-24"
        aria-label="Call to action"
      >
        {/* Decorative orbs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-sky-600/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8 border border-slate-800 bg-slate-900/50 rounded-3xl p-12 backdrop-blur-sm shadow-2xl shadow-blue-900/20">
          <div className="mx-auto mb-6 h-16 flex justify-center">
            <img 
              src="https://payilagam.com/wp-content/uploads/2016/09/payilagam-logo.png" 
              alt="Payilagam Logo" 
              className="h-full object-contain"
              onError={(event: any) => {
                event.target.onerror = null;
                event.target.style.display = 'none';
                event.target.nextSibling.style.display = 'block';
              }}
            />
            <GraduationCap style={{display: 'none'}} className="h-12 w-12 text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Join Our Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Whether you're a student eager to learn, a mentor ready to guide,
            or a company looking to collaborate — there's a place for you at
            Payilagam.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button
                size="lg"
                className="h-12 rounded-full bg-blue-500 px-8 font-bold text-white shadow-xl shadow-blue-900/20 hover:bg-blue-600 border border-blue-400/50"
              >
                Get Started
                <ArrowRight className="ml-1 icon-base" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-slate-700 bg-slate-800 px-8 font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;







