"use client";

import { motion } from "framer-motion";
import { Users, Heart, MapPin, PawPrint } from "lucide-react";
import type { ElementType } from "react";

interface UseCase {
  icon: ElementType;
  title: string;
  body: string;
  cardGradient: string;
  iconClass: string;
  glowColor: string;
}

const cases: UseCase[] = [
  {
    icon: Users,
    title: "Dad's Birthday",
    body: "Keep a birthday message, photo, or voice note attached to something he'll always recognize.",
    cardGradient: "linear-gradient(135deg, #FFE2B8 0%, #FFB7C5 50%, #C8A8FF 100%)",
    iconClass: "bg-gradient-to-br from-[#FFB7C5] to-[#FFD6A5]",
    glowColor: "rgba(255,183,197,0.55)",
  },
  {
    icon: Heart,
    title: "Long Distance Love",
    body: "Leave a memory on a ring, letter, or gift — something they can revisit when they miss you.",
    cardGradient: "linear-gradient(135deg, #C8A8FF 0%, #FFB7C5 55%, #FFD6E0 100%)",
    iconClass: "bg-gradient-to-br from-[#C8A8FF] to-[#A7C7FF]",
    glowColor: "rgba(200,168,255,0.55)",
  },
  {
    icon: MapPin,
    title: "A Trip to Japan",
    body: "Attach photos, sounds, or small stories to a souvenir so the trip can live beyond the camera roll.",
    cardGradient: "linear-gradient(135deg, #A7C7FF 0%, #B8B5FF 55%, #E8F1FF 100%)",
    iconClass: "bg-gradient-to-br from-social-blue to-revia-lavender",
    glowColor: "rgba(167,199,255,0.55)",
  },
  {
    icon: PawPrint,
    title: "Remembering a Best Friend",
    body: "Preserve a moment with a pet or loved one in a place that still feels close.",
    cardGradient: "linear-gradient(135deg, #FFE7A8 0%, #C6F0E0 55%, #B8B5FF 100%)",
    iconClass: "bg-gradient-to-br from-[#FFE7A8] to-[#C6F0E0]",
    glowColor: "rgba(255,231,168,0.55)",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.22em] text-social-blue"
          >
            Use cases
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 text-balance text-3xl font-bold tracking-tight text-revia-ink sm:text-4xl"
          >
            Made for the moments you want to keep
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="glass overflow-hidden rounded-3xl shadow-glass"
              >
                <div
                  className="relative h-32 w-full"
                  style={{ background: c.cardGradient }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(55% 65% at 25% 25%, rgba(255,255,255,0.55), transparent 65%), radial-gradient(40% 40% at 75% 75%, ${c.glowColor}, transparent 70%)`,
                    }}
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl ${c.iconClass} text-white shadow-glass ring-1 ring-white/50`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-semibold text-revia-ink">{c.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-revia-slate">
                    {c.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
