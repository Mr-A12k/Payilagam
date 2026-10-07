/**
 * @fileoverview Contact page for Payilagam.
 * Renders a premium public-facing Contact page with a hero section,
 * two-column contact form + info layout, placeholder map,
 * and expandable FAQ accordion section.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  ChevronDown,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axiosConfig";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

/* ────────────────────────────────────────────────────────────────────
 *  DATA
 * ──────────────────────────────────────────────────────────────────── */

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@payilagam.com",
    href: "mailto:contact@payilagam.com",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Chennai, Tamil Nadu, India",
    href: null,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon–Sat, 9 AM – 6 PM IST",
    href: null,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
  },
];

const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "general", label: "General Inquiry" },
  { value: "courses", label: "Course Information" },
  { value: "enterprise", label: "Enterprise Partnership" },
  { value: "support", label: "Technical Support" },
  { value: "feedback", label: "Feedback" },
];

const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Simply create a free account on Payilagam, browse our course catalog, and click 'Enroll' on any course that interests you. All courses are completely free — no credit card required. You'll get instant access to video lessons, coding labs, and community forums.",
  },
  {
    question: "How long are the courses?",
    answer:
      "Course duration varies depending on the topic. Most beginner courses take 4–6 weeks to complete at 5–8 hours per week. Advanced specializations may take 8–12 weeks. All courses are self-paced, so you can learn at your own speed without any deadlines.",
  },
  {
    question: "Do I get a certificate after completing a course?",
    answer:
      "Yes! Upon successfully completing all course modules and passing the final assessment, you'll receive a verified digital certificate. Our certificates are recognized by 100+ hiring partners and can be shared directly to your LinkedIn profile.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Since all our core courses are completely free, there's nothing to refund! For enterprise training packages and premium mentorship programs, we offer a full refund within 7 days of purchase if you're not satisfied with the experience.",
  },
  {
    question: "Can I access courses on mobile devices?",
    answer:
      "Absolutely! Payilagam is fully responsive and works beautifully on smartphones, tablets, and desktops. We also have dedicated mobile apps for iOS and Android that support offline downloads so you can learn on the go.",
  },
];

/* ────────────────────────────────────────────────────────────────────
 *  INITIAL FORM STATE
 * ──────────────────────────────────────────────────────────────────── */

const initialFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

/* ────────────────────────────────────────────────────────────────────
 *  COMPONENT
 * ──────────────────────────────────────────────────────────────────── */

const Contact = () => {
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<any>(null);

  /** Handle input / select / textarea changes */
  const handleChange = (event: React.SyntheticEvent<any>) => {
    setForm((prev: any) => ({ ...prev, [(event.target as HTMLInputElement).name]: (event.target as HTMLInputElement).value }));
  };

  /** Submit the contact form */
  const handleSubmit = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/api/contact", form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm(initialFormState);
    } catch (error) {
            const message =
        (error as any)?.response?.data?.message ||
        "Something went wrong. Please try again later.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Toggle an FAQ accordion item */
  const toggleFaq = (index: any) => {
    setOpenFaq((prev: any) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-x-hidden">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white"
        aria-label="Contact hero"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800/50 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-28 text-center sm:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-blue-400" />
            We're Here to Help
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-white">
            Get In Touch
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            We'd love to hear from you. Reach out and let's start a
            conversation.
          </p>
        </div>
      </section>

      {/* ── Contact Form + Info ─────────────────────────────────────── */}
      <section className="bg-[var(--bg-base)] py-24 relative" aria-label="Contact form and information">
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            {/* ── Form (left — 3 cols) ──────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">
                  Send Us a Message
                </h2>
                <p className="mt-2 text-[var(--text-secondary)]">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Subject
                  </label>
                  <Select name="subject" required value={form.subject} onValueChange={(subject: string) => setForm(previous => ({ ...previous, subject }))}>
                    <SelectTrigger id="subject"><SelectValue placeholder="Select a subject" /></SelectTrigger>
                    <SelectContent>{subjectOptions.filter(opt => opt.value).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help…"
                    className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-[var(--action-bg)] hover:bg-[var(--action-hover)] px-8 font-bold text-white shadow-lg shadow-blue-500/20 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* ── Contact Info (right — 2 cols) ────────────────────── */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">
                  Contact Info
                </h2>
                <p className="mt-2 text-[var(--text-secondary)]">
                  Prefer a different channel? Reach out directly.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item: any) => {
                  const Wrapper = item.href ? "a" : "div";
                  const wrapperProps = item.href
                    ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                    : {};

                  return (
                    <Wrapper
                      key={item.title}
                      {...wrapperProps}
                      className="group flex items-start gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 transition-all duration-300 hover:border-[var(--accent-primary)] hover:shadow-lg shadow-sm"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-heading)]">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                          {item.value}
                        </p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

              {/* Quick Response badge */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-5">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-primary)]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">
                    Quick Response
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map Section ────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border-default)] bg-[var(--bg-surface-2)] py-16" aria-label="Location map">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md">
            <div className="flex min-h-[320px] flex-col items-center justify-center p-12 text-center relative overflow-hidden">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] z-10">
                <MapPin className="h-8 w-8 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-heading)] z-10">
                Chennai, India
              </h3>
              <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)] z-10">
                Our headquarters is located in the heart of Chennai, Tamil
                Nadu — one of India's leading tech hubs.
              </p>
              <a
                href="https://maps.google.com/?questionText=Chennai,Tamil+Nadu,India"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)] hover:shadow-md z-10"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-base)] py-24 relative" aria-label="Frequently asked questions">
        <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[var(--text-heading)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              Quick answers to the questions we get asked the most.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq: any, index: any) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={index}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="pr-4 text-sm font-bold text-[var(--text-heading)] sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[var(--accent-primary)]" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA under FAQ */}
          <div className="mt-12 text-center">
            <p className="text-[var(--text-muted)]">
              Still have questions?{" "}
              <Link
                to="/about"
                className="font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Learn more about us
              </Link>{" "}
              or send us a message above.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;





