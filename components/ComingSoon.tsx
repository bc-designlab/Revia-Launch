"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useWaitlist } from "./WaitlistContext";

export default function ComingSoon() {
  const openModal = useWaitlist();

  return (
    <section id="coming-soon" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong gradient-border relative overflow-hidden rounded-[2rem] p-8 shadow-glass sm:p-14"
        >
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(0,120,244,0.32), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(184,181,255,0.55), transparent 70%)",
            }}
          />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-revia-purple shadow-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-social-blue opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-social-blue" />
                </span>
                Private Beta · Limited Access
              </div>
              <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-revia-ink sm:text-5xl">
                <span className="gradient-text">Join the first wave of Revia users.</span>
              </h2>
              <p className="mt-4 max-w-xl text-pretty text-revia-slate">
                We&apos;re accepting early access requests now. Join the waitlist
                and we&apos;ll reach out when a spot opens.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={openModal}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-revia-ink px-5 py-3 text-sm font-semibold text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <a
                  href="mailto:hello@revia.app"
                  className="glass group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-revia-ink shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Mail className="h-4 w-4 text-social-blue" />
                  hello@revia.app
                </a>
              </div>
            </div>

            <div className="relative">
              <PortalCard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PortalCard() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,120,244,0.4), rgba(184,181,255,0.6), rgba(58,12,163,0.4), rgba(0,120,244,0.4))",
          filter: "blur(24px)",
        }}
      />
      <div className="absolute inset-6 overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-white via-[#F4F2FF] to-[#E8F1FF] shadow-glass">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 40%, rgba(0,120,244,0.15), transparent 70%), radial-gradient(60% 50% at 50% 80%, rgba(184,181,255,0.4), transparent 70%)",
          }}
        />
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              borderColor:
                i === 0
                  ? "rgba(0,120,244,0.5)"
                  : i === 1
                  ? "rgba(184,181,255,0.55)"
                  : "rgba(58,12,163,0.35)",
            }}
            animate={{ scale: [0.6, 1.1, 1.35], opacity: [0.9, 0.3, 0] }}
            transition={{
              duration: 3.6,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/80">
          <div className="h-full w-full bg-gradient-to-br from-[#FFE2B8] via-[#FFB7C5] to-[#C8A8FF]" />
        </div>
      </div>
    </div>
  );
}
