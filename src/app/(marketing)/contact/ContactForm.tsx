"use client";

import { useState } from "react";
import { submitContactAction } from "@/lib/actions/contact";
import { contactSchema } from "@/lib/validators/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = contactSchema.safeParse({ name, email, subject, message });
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
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-[4px] border border-success bg-success/5 p-6 text-center">
        <p className="font-serif text-lg font-semibold text-text-heading">Message sent.</p>
        <p className="mt-1.5 text-sm text-text-muted">
          Thanks for writing in — we&apos;ll get back to you at {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-strong px-4 text-text-heading placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
          />
          {errors.name && <p role="alert" className="mt-1 text-sm text-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-[4px] border border-border-strong px-4 text-text-heading placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
          />
          {errors.email && <p role="alert" className="mt-1 text-sm text-error">{errors.email}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-12 w-full rounded-[4px] border border-border-strong px-4 text-text-heading placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
        />
        {errors.subject && <p role="alert" className="mt-1 text-sm text-error">{errors.subject}</p>}
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-[4px] border border-border-strong px-4 py-3 text-text-heading placeholder:text-text-muted transition-colors focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-[#14141a14]"
        />
        {errors.message && <p role="alert" className="mt-1 text-sm text-error">{errors.message}</p>}
      </div>

      {formError && (
        <p role="alert" className="mt-4 text-sm text-error">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-12 w-full rounded-[4px] bg-ink text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
