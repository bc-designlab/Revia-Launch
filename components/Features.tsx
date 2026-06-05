"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Upload,
  ScanLine,
  Glasses,
  Gift,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Mic,
  Type,
} from "lucide-react";
import type { ReactNode } from "react";

const features = [
  {
    eyebrow: "01 · Create",
    title: "Create a memory experience",
    body: "Upload images, video, audio, or text to build a personal spatial memory that feels like the moment itself.",
    icon: Upload,
    visual: "create",
  },
  {
    eyebrow: "02 · Attach",
    title: "Attach it to an object",
    body: "Connect the experience to a physical item — a ring, a book, a teacup. Revia uses visual recognition to identify it. No QR codes needed.",
    icon: ScanLine,
    visual: "attach",
  },
  {
    eyebrow: "03 · Revisit",
    title: "Revisit through AR",
    body: "Open the memory again through an immersive visual interaction that wraps the space around you.",
    icon: Glasses,
    visual: "revisit",
  },
  {
    eyebrow: "04 · Keep",
    title: "Keep meaningful moments close",
    body: "Designed for personal archives, gifts, and emotional objects you actually want to live with.",
    icon: Gift,
    visual: "keep",
  },
] as const;

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.22em] text-social-blue"
          >
            What Revia does
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 text-balance text-3xl font-bold tracking-tight text-revia-ink sm:text-4xl"
          >
            Four small steps from a moment to a memory you can hold.
          </motion.h2>
        </div>

        <div className="space-y-12 md:space-y-20">
          {features.map((f, i) => (
            <FeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const Icon = feature.icon;
  const reverse = index % 2 === 1;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14 ${
        reverse ? "md:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-revia-purple shadow-soft ring-1 ring-white/80">
          <Icon className="h-3.5 w-3.5 text-social-blue" />
          {feature.eyebrow}
        </div>
        <h3 className="mt-4 text-balance text-2xl font-bold leading-tight text-revia-ink sm:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-3 max-w-md text-pretty text-revia-slate">
          {feature.body}
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-social-blue">
          <span>Step {String(index + 1).padStart(2, "0")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>

      <motion.div
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative"
      >
        <FeatureVisual kind={feature.visual} />
      </motion.div>
    </motion.div>
  );
}

function FeatureVisual({ kind }: { kind: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-glass">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(70% 60% at 80% 20%, rgba(184,181,255,0.45), transparent 60%), radial-gradient(70% 60% at 10% 90%, rgba(0,120,244,0.18), transparent 60%)",
        }}
      />
      {kind === "create" && <CreateVisual />}
      {kind === "attach" && <AttachVisual />}
      {kind === "revisit" && <RevisitVisual />}
      {kind === "keep" && <KeepVisual />}
    </div>
  );
}

function Chip({
  icon,
  label,
  color,
}: {
  icon: ReactNode;
  label: string;
  color: string;
}) {
  return (
    <div className="glass-strong flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium shadow-soft">
      <span
        className={`grid h-7 w-7 place-items-center rounded-lg text-white ${color}`}
      >
        {icon}
      </span>
      <span className="text-revia-ink">{label}</span>
    </div>
  );
}

function CreateVisual() {
  return (
    <div className="relative grid grid-cols-2 gap-3">
      <Chip
        icon={<ImageIcon className="h-3.5 w-3.5" />}
        label="Photos"
        color="bg-gradient-to-br from-[#FFB7C5] to-[#FFD6A5]"
      />
      <Chip
        icon={<Video className="h-3.5 w-3.5" />}
        label="Video"
        color="bg-gradient-to-br from-social-blue to-revia-lavender"
      />
      <Chip
        icon={<Mic className="h-3.5 w-3.5" />}
        label="Audio"
        color="bg-gradient-to-br from-revia-purple to-social-blue"
      />
      <Chip
        icon={<Type className="h-3.5 w-3.5" />}
        label="Text"
        color="bg-gradient-to-br from-[#C8A8FF] to-[#A7C7FF]"
      />
      <div className="col-span-2 mt-2 rounded-2xl bg-white/70 p-3 shadow-soft ring-1 ring-white/80">
        <div className="flex items-center justify-between text-xs text-revia-slate">
          <span className="font-medium text-revia-ink">
            Memory · Summer in Porto
          </span>
          <span>4 layers</span>
        </div>
        <div className="mt-2 flex gap-1">
          {[40, 70, 55, 30].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-gradient-to-r from-social-blue via-revia-lavender to-revia-purple"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AttachVisual() {
  return (
    <div className="relative grid grid-cols-2 items-center gap-4">
      <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-white to-[#E8F1FF] p-4 shadow-soft ring-1 ring-white/80">
        <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-[#FFE2B8] via-[#FFB7C5] to-[#C8A8FF] shadow-soft" />
        <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/70 backdrop-blur">
          <ScanLine className="h-5 w-5 text-revia-purple" />
        </div>
        <motion.span
          className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-social-blue to-transparent"
          animate={{ y: [-30, 30, -30] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="space-y-2">
        <Chip
          icon={<ScanLine className="h-3.5 w-3.5" />}
          label="Object linked"
          color="bg-revia-ink"
        />
        <div className="rounded-xl bg-white/70 p-3 text-xs text-revia-slate shadow-soft ring-1 ring-white/80">
          <p className="font-medium text-revia-ink">Grandma&apos;s teacup</p>
          <p className="mt-1">Ceramic · matte glaze</p>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-social-blue">
            <span>Linked</span>
            <span>· · ·</span>
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-revia-slate/50">
            Visual recognition · no QR code
          </p>
        </div>
      </div>
    </div>
  );
}

function RevisitVisual() {
  return (
    <div className="relative h-[220px] w-full">
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#B8B5FF]/60 via-white to-[#A7C7FF]/40 blur-2xl" />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            borderColor:
              i === 0
                ? "rgba(0,120,244,0.5)"
                : i === 1
                ? "rgba(184,181,255,0.6)"
                : "rgba(58,12,163,0.35)",
          }}
          animate={{ scale: [0.7, 1.15, 1.4], opacity: [0.8, 0.3, 0] }}
          transition={{
            duration: 3.4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-glass ring-1 ring-white/80">
        <div className="h-full w-full bg-gradient-to-br from-[#FFE2B8] via-[#FFB7C5] to-[#C8A8FF]" />
      </div>
      <div className="glass-strong absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-medium text-revia-ink shadow-soft">
        <span className="text-social-blue">AR</span> · recall in progress
      </div>
    </div>
  );
}

function KeepVisual() {
  const items = [
    { title: "For Dad", sub: "Father's day", g: "from-[#FFE2B8] to-[#FFB7C5]" },
    {
      title: "Wedding ring",
      sub: "Personal archive",
      g: "from-[#B8B5FF] to-[#A7C7FF]",
    },
    {
      title: "First sketchbook",
      sub: "Studio",
      g: "from-[#C8A8FF] to-[#FFD6E0]",
    },
  ];
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <motion.div
          key={it.title}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="glass-strong flex items-center gap-3 rounded-2xl p-3 shadow-soft"
        >
          <div
            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${it.g} shadow-soft`}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-revia-ink">{it.title}</p>
            <p className="text-xs text-revia-slate">{it.sub}</p>
          </div>
          <Gift className="h-4 w-4 text-revia-purple" />
        </motion.div>
      ))}
    </div>
  );
}
