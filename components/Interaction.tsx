"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ScanLine, Sparkles, Layers, MoveDiagonal } from "lucide-react";

const steps = [
  {
    title: "Hold up the object",
    body: "Aim your camera at the item you tied a memory to.",
    icon: ScanLine,
  },
  {
    title: "Recognise the link",
    body: "Revia identifies the object and prepares its spatial layer.",
    icon: Layers,
  },
  {
    title: "Step into the memory",
    body: "The moment opens around you with sound, light, and motion.",
    icon: Sparkles,
  },
];

export default function Interaction() {
  const reduce = useReducedMotion();

  return (
    <section
      id="interaction"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-social-blue">
              How it feels
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-revia-ink sm:text-4xl">
              A quiet portal hiding inside ordinary things.
            </h2>
            <p className="mt-4 max-w-md text-revia-slate">
              Revia stays out of the way until you reach for it. Pick up the
              object, and the memory unfolds — soft motion, real sound, no
              clutter.
            </p>

            <ul className="mt-8 space-y-3">
              {steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.08 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={reduce ? undefined : { y: -3 }}
                  className="glass flex items-start gap-4 rounded-2xl p-4 shadow-soft"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-social-blue to-revia-purple text-white shadow-soft">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-revia-ink">{s.title}</p>
                    <p className="text-sm text-revia-slate">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <InteractionStage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InteractionStage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 -z-10 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,120,244,0.18), rgba(184,181,255,0.4), rgba(58,12,163,0.18), rgba(0,120,244,0.18))",
          filter: "blur(40px)",
        }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[78%] w-[78%]">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{
                borderColor:
                  i === 0
                    ? "rgba(0,120,244,0.55)"
                    : i === 1
                    ? "rgba(184,181,255,0.6)"
                    : i === 2
                    ? "rgba(58,12,163,0.4)"
                    : "rgba(0,120,244,0.25)",
              }}
              animate={{ scale: [0.7, 1.2, 1.45], opacity: [0.85, 0.3, 0] }}
              transition={{
                duration: 4,
                delay: i * 0.6,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          <div className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] shadow-glass">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 60% at 30% 30%, #FFE2B8, transparent 70%), radial-gradient(80% 60% at 70% 80%, #B8B5FF, transparent 60%), linear-gradient(135deg, #FFD6E0, #C8A8FF 60%, #A7C7FF)",
              }}
            />
            <motion.div
              className="absolute inset-0 mix-blend-overlay"
              animate={{
                background: [
                  "radial-gradient(60% 40% at 20% 30%, rgba(255,255,255,0.6), transparent 60%)",
                  "radial-gradient(60% 40% at 80% 70%, rgba(255,255,255,0.6), transparent 60%)",
                  "radial-gradient(60% 40% at 30% 80%, rgba(255,255,255,0.6), transparent 60%)",
                  "radial-gradient(60% 40% at 20% 30%, rgba(255,255,255,0.6), transparent 60%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            className="glass-strong absolute right-[-6%] top-[8%] flex items-center gap-2 rounded-xl p-2 text-xs shadow-soft"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-social-blue text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-revia-ink">Spatial layer</span>
          </motion.div>

          <motion.div
            className="glass-strong absolute left-[-8%] bottom-[12%] flex items-center gap-2 rounded-xl p-2 text-xs shadow-soft"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-revia-purple text-white">
              <MoveDiagonal className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-revia-ink">Parallax · on</span>
          </motion.div>

          <motion.div
            className="glass-strong absolute right-[-4%] bottom-[-2%] flex items-center gap-2 rounded-xl p-2 text-xs shadow-soft"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9,
            }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-revia-ink text-white">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-revia-ink">3 memory layers</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
