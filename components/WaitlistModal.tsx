"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface WaitlistForm {
  name: string;
  role: string;
  company: string;
  email: string;
}

type FormErrors = Partial<Record<keyof WaitlistForm, string>>;

const EMPTY: WaitlistForm = { name: "", role: "", company: "", email: "" };

export default function WaitlistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<WaitlistForm>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => firstRef.current?.focus(), 60);
      return () => {
        document.body.style.overflow = "";
        clearTimeout(t);
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset form after close animation finishes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setForm(EMPTY);
        setErrors({});
        setSubmitted(false);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function update(field: keyof WaitlistForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const entry = {
      name: form.name.trim(),
      role: form.role.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      submittedAt: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("revia_waitlist") ?? "[]");
    localStorage.setItem("revia_waitlist", JSON.stringify([...prev, entry]));
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-revia-ink/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Scroll container + centering */}
          <div className="relative flex min-h-full items-center justify-center overflow-y-auto p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="waitlist-title"
              className="glass-strong gradient-border relative w-full max-w-md overflow-hidden rounded-[2rem] p-8 shadow-glass"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Decorative blobs */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(0,120,244,0.22), transparent 70%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-14 -left-14 h-44 w-44 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(184,181,255,0.4), transparent 70%)",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/60 text-revia-slate shadow-soft transition-colors duration-150 hover:bg-white/90 hover:text-revia-ink"
              >
                <X className="h-4 w-4" />
              </button>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessView key="success" onClose={onClose} />
                ) : (
                  <FormView
                    key="form"
                    form={form}
                    errors={errors}
                    firstRef={firstRef}
                    onChange={update}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormView({
  form,
  errors,
  firstRef,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: WaitlistForm;
  errors: FormErrors;
  firstRef: React.RefObject<HTMLInputElement>;
  onChange: (f: keyof WaitlistForm, v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <h2
        id="waitlist-title"
        className="pr-8 text-xl font-bold tracking-tight text-revia-ink"
      >
        Join the Revia Waitlist
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-revia-slate">
        Be among the first to create and revisit spatial memories with Revia.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <Field label="Full Name" required error={errors.name}>
          <input
            ref={firstRef}
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputCls(!!errors.name)}
          />
        </Field>

        <Field label="Role / Title">
          <input
            type="text"
            placeholder="e.g. Product Designer"
            value={form.role}
            onChange={(e) => onChange("role", e.target.value)}
            className={inputCls(false)}
          />
        </Field>

        <Field label="Company / Organization" hint="Optional">
          <input
            type="text"
            placeholder="Where do you work?"
            value={form.company}
            onChange={(e) => onChange("company", e.target.value)}
            className={inputCls(false)}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={inputCls(!!errors.email)}
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-full bg-revia-ink py-3 text-[14px] font-semibold text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
          >
            Join Waitlist
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="glass flex-1 rounded-full py-3 text-[14px] font-semibold text-revia-ink shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="py-4 text-center"
    >
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-social-blue to-revia-lavender shadow-glass ring-1 ring-white/60">
        <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-revia-ink">
        You&apos;re on the list
      </h2>
      <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-revia-slate">
        Thanks for your interest. We&apos;ll send an invitation when new beta
        spots become available.
      </p>
      <button
        onClick={onClose}
        className="mt-7 w-full rounded-full bg-revia-ink py-3 text-[14px] font-semibold text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
      >
        Close
      </button>
    </motion.div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-revia-ink">{label}</span>
        {required && (
          <span className="text-[11px] text-social-blue" aria-hidden>
            *
          </span>
        )}
        {hint && (
          <span className="text-[11px] text-revia-slate/60">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return [
    "w-full rounded-xl bg-white/60 px-4 py-2.5 text-[14px] text-revia-ink",
    "placeholder:text-revia-slate/50 outline-none",
    "border transition-colors duration-150",
    "focus:ring-2 focus:ring-social-blue/25",
    hasError
      ? "border-red-400/60 focus:border-red-400/60"
      : "border-white/80 focus:border-social-blue/40",
  ].join(" ");
}
