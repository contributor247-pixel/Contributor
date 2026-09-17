"use client";

import { useState } from "react";
import { submitContactAction } from "@/lib/actions/contact";
import { contactSchema } from "@/lib/validators/contact";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  User,
  Mail,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

const INQUIRY_TOPICS = [
  "General Inquiry",
  "Editorial Pitch",
  "Account & Billing",
  "Publication Request",
  "Technical Issue",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("General Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    if (!subject || INQUIRY_TOPICS.includes(subject)) {
      setSubject(topic);
    }
  };

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

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center sm:p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-text-heading">
          Dispatch Received
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          Thank you for writing to us. Your message has been delivered to our editorial desk.
          We will review it and reply directly to <span className="font-semibold text-text-heading">{email}</span>.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-5 py-2.5 text-xs font-semibold text-text-heading transition-all hover:border-primary/40 hover:text-primary hover:shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Send Another Message</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1. Quick Topic Selector Pills */}
      <div>
        <label className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Select Inquiry Type
        </label>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicSelect(topic)}
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
            {message.length} / 4000 characters
          </span>
        </div>
        <div className="relative">
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Please detail your question, editorial pitch, or feedback with as much context as possible..."
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
          🔒 Your information is confidential and never shared with third parties.
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
  );
}
