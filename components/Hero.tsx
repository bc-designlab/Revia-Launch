"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HeroVisual from "./HeroVisual";
import Orb from "./Orb";
import { useWaitlist } from "./WaitlistContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.12,
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Hero() {
  const openModal = useWaitlist();

  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pb-32 lg:pt-32">
        <div className="relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.32em] text-revia-slate"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-social-blue opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-social-blue" />
            </span>
            Now in development
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-9 text-balance text-[clamp(2.75rem,6.4vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-revia-ink"
          >
            Attach memories to the things you love.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-7 max-w-[26rem] text-balance text-lg leading-[1.55] text-revia-slate sm:text-[1.2rem]"
          >
            Tie a moment to the things you keep close. Hold them again — and the
            moment is here.
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-3 max-w-[26rem] text-[12px] italic leading-relaxed text-revia-slate/50"
          >
            Some memories deserve a place in space.
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-4 max-w-[26rem] text-[13px] leading-relaxed text-revia-slate/70"
          >
            Create a spatial memory and revisit it later through AR.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-10"
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={openModal}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-revia-ink px-6 py-3.5 text-[14px] font-medium text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <a
                href="#features"
                className="group inline-flex items-center justify-center gap-1.5 px-3 py-3.5 text-[14px] font-medium text-revia-ink transition-colors duration-200 hover:text-revia-purple"
              >
                See How It Works
                <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </a>
            </div>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-revia-slate/50">
              Private beta access by invitation
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <Orb
            tone="yellow"
            size={28}
            className="left-[14%] top-[2%]"
            duration={6}
            delay={0.2}
          />
          <Orb
            tone="white"
            size={36}
            className="left-[2%] top-[26%]"
            duration={8}
            delay={0.5}
          />
          <Orb
            tone="pink"
            size={22}
            className="left-[24%] top-[58%]"
            duration={7}
            delay={1.1}
          />
          <Orb
            tone="blue"
            size={26}
            className="right-[12%] top-[6%]"
            duration={7.5}
            delay={0.4}
          />
          <Orb
            tone="lavender"
            size={42}
            className="right-[-3%] top-[44%]"
            duration={9}
            delay={0.8}
            range={18}
          />
          <Orb
            tone="purple"
            size={56}
            className="left-[6%] bottom-[2%]"
            duration={10}
            delay={1.4}
            range={20}
          />
          <Orb
            tone="white"
            size={18}
            className="right-[22%] bottom-[12%]"
            duration={6.5}
            delay={0.9}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroVisual />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
