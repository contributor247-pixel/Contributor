"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  ChevronDown,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  HelpCircle,
  MessageSquare,
  PenLine,
  ShieldCheck,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { submitContactAction } from "@/lib/actions/contact";
import { contactSchema } from "@/lib/validators/contact";

const INQUIRY_TOPICS = [
  "General Inquiry",
  "Editorial Pitch",
  "Account & Billing",
  "Publication Request",
  "Technical Issue",
];

const EDITORIAL_COMMITMENTS = [
  {
    icon: PenLine,
    title: "Editorial Pitch Review",
    description: "Every story outline is reviewed by editors with personal feedback for selected dispatches.",
  },
  {
    icon: ShieldCheck,
    title: "Creator & Reader Support",
    description: "Assistance with article unlocks, publication subscriptions, and Stripe payout setups.",
  },
  {
    icon: Clock,
    title: "24–48h Response Commitment",
    description: "We value your time and aim to respond to all inquiries within two business days.",
  },
];

const FAQS = [
  {
    q: "How do I pitch a story for editorial consideration?",
    a: "Select 'Editorial Pitch' in the form and provide a 2–3 paragraph summary outlining your premise, estimated word count, and links to any past work. Our editors review submissions regularly.",
  },
  {
    q: "When are author earnings disbursed?",
    a: "Earnings from single article unlocks and monthly publication subscriptions are automatically deposited directly to your connected Stripe account according to your standard rolling payout schedule.",
  },
  {
    q: "Can multiple authors publish together under one masthead?",
    a: "Yes! Contributor Publications allows editorial collectives, niche journals, and research groups to invite team writers, set custom subscription pricing, and distribute transparent revenue splits.",
  },
  {
    q: "What if I experience issues with an article unlock or pass?",
    a: "Our reader support team handles all transaction verifications with priority. If an unlock doesn't register instantly, select 'Account & Billing' and include your purchase email for immediate resolution.",
  },
];

export function ContactHub() {
  const [selectedTopic, setSelectedTopic] = useState<string>("General Inquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const actualSubject = subject.trim() || selectedTopic;
    const parsed = contactSchema.safeParse({
      name,
      email,
      subject: actualSubject,
      message,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await submitContactAction(parsed.data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setStatus("sent");
    } catch {
      setFormError("Something went wrong while dispatching your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrors({});
    setFormError(null);
    setStatus("idle");
  };

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* Main 2-Column Split: Editorial Narrative Left + Modern Form Right */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Narrative & Editorial Commitments */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Eyebrow with Live Pulse */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Inquiries & Dialogue</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Desk Online</span>
              </span>
            </div>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-text-heading sm:text-5xl">
              Questions, feedback, or an editorial pitch — write to us.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-text-muted">
              Whether you are pitching an investigative essay, inquiring about collective publications, or need account assistance, every message is routed directly to a human on our team.
            </p>

            {/* Editorial Commitments */}
            <div className="mt-8 space-y-4">
              {EDITORIAL_COMMITMENTS.map((item, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-text-heading">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Helpful Links */}
          <div className="mt-10 rounded-2xl border border-border/80 bg-surface/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              Explore More
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Link
                href="/content"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-text-heading transition-colors hover:border-primary/40 hover:text-primary"
              >
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Browse Dispatches</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-text-heading transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span>About Our Platform</span>
                <ArrowRight className="h-3 w-3 text-text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Inquiries Form Card */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-sm">
            {/* Header */}
            <div className="mb-6 border-b border-border/70 pb-5">
              <h2 className="font-serif text-2xl font-semibold text-text-heading sm:text-3xl">
                Send a Message
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted sm:text-sm">
                Fill out the details below and our team will get back to you directly via email.
              </p>
            </div>

            {/* Form or Sent Success */}
            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center sm:p-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-text-heading">
                  Dispatch Received
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
                  Thank you for writing. Your message has been routed to our team.
                  We will review it and reply directly to <span className="font-semibold text-text-heading">{email}</span>.
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-6 py-3 text-xs font-semibold text-text-heading transition-all hover:border-primary/40 hover:text-primary hover:shadow-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Send Another Message</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* 1. Quick Topic Selector Pills */}
                <div>
                  <label className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    Inquiry Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INQUIRY_TOPICS.map((topic) => {
                      const isSelected = selectedTopic === topic;
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setSelectedTopic(topic);
                            if (!subject || INQUIRY_TOPICS.includes(subject)) {
                              setSubject(topic);
                            }
                          }}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-white shadow-xs"
                              : "border border-border/80 bg-surface text-text-muted hover:border-primary/40 hover:text-text-heading"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sender Name & Email Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Your Full Name <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Elena Vance"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/90 pl-10 pr-4 text-sm text-text-heading placeholder:text-text-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {errors.name && (
                      <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-error">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="elena@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className="h-12 w-full rounded-xl border border-border/80 bg-surface/90 pl-10 pr-4 text-sm text-text-heading placeholder:text-text-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {errors.email && (
                      <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-error">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Subject Line */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    Subject Line <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder={selectedTopic || "Brief summary of your inquiry"}
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }));
                      }}
                      className="h-12 w-full rounded-xl border border-border/80 bg-surface/90 pl-10 pr-4 text-sm text-text-heading placeholder:text-text-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {errors.subject && (
                    <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-error">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* 4. Message Body */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Message <span className="text-primary">*</span>
                    </label>
                    <span className="text-[11px] text-text-muted">
                      {message.length} / 4000
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder={
                        selectedTopic === "Editorial Pitch"
                          ? "Please include your article premise, estimated word count, and links to any past work..."
                          : "Please detail your question, feedback, or request with as much context as possible..."
                      }
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                      }}
                      className="w-full resize-none rounded-xl border border-border/80 bg-surface/90 p-4 text-sm leading-relaxed text-text-heading placeholder:text-text-muted transition-all focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {errors.message && (
                    <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-error">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Form Error Alert */}
                {formError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-medium text-error"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 5. Submit Button */}
                <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                  <p className="text-xs text-text-muted">
                    🔒 Confidential message. No spam, ever.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Interactive FAQ Accordion Strip */}
      <div className="rounded-3xl border border-border/80 bg-surface/50 p-6 sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Direct Answers</span>
          </span>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-text-heading sm:text-3xl">
            Frequently Asked Inquiries
          </h2>
        </div>

        <div className="divide-y divide-border/70">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div key={idx} className="py-4.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="group flex w-full items-center justify-between gap-4 text-left font-serif text-base font-semibold text-text-heading transition-colors hover:text-primary"
                >
                  <span className="group-hover:text-primary transition-colors">{faq.q}</span>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen ? "border-primary/40 bg-primary/10 text-primary rotate-180" : "border-border/70 text-text-muted group-hover:border-primary/30 group-hover:text-primary"
                  }`}>
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.32, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.25, delay: 0.05 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs leading-relaxed text-text-muted sm:text-sm">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
