"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Music, Play, ScanLine, Heart } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[5/6] w-full max-w-[520px]">
      <div
        aria-hidden
        className="absolute inset-[-8%] -z-20 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,200,224,0.55) 0%, rgba(184,181,255,0.45) 35%, rgba(0,120,244,0.18) 60%, transparent 75%)",
        }}
      />

      <motion.div
        aria-hidden
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[4%] -z-10 rounded-full"
        style={{
          background:
            "conic-gradient(from 120deg at 50% 50%, rgba(0,120,244,0.30), rgba(184,181,255,0.45), rgba(58,12,163,0.28), rgba(255,205,235,0.32), rgba(0,120,244,0.30))",
          filter: "blur(28px)",
          opacity: 0.9,
        }}
      />

      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor:
                i === 0
                  ? "rgba(0,120,244,0.55)"
                  : i === 1
                  ? "rgba(184,181,255,0.55)"
                  : "rgba(58,12,163,0.4)",
            }}
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: [0.6, 1.2, 1.5], opacity: [0.7, 0.25, 0] }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 w-[64%] -translate-x-1/2 -translate-y-1/2"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <PhonePreview />
      </motion.div>

      <motion.div
        className="glass-strong absolute left-[-2%] top-[8%] z-20 w-[42%] rounded-2xl p-3 shadow-glass"
        animate={{ y: [0, -10, 0], rotate: [-3, -1, -3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-revia-slate">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-social-blue to-revia-lavender text-white">
            <ImageIcon className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-revia-ink">Sunset, Lisbon</span>
            <span className="text-[10px] text-revia-slate/80">
              4 photos · 12s clip
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="aspect-square rounded-md bg-gradient-to-br from-[#FFD6A5] via-[#FFB7C5] to-[#B8B5FF]" />
          <div className="aspect-square rounded-md bg-gradient-to-br from-[#B8B5FF] via-[#A7C7FF] to-[#0078F4]" />
          <div className="aspect-square rounded-md bg-gradient-to-br from-[#FFE7A8] via-[#FFB1B1] to-[#C8A8FF]" />
        </div>
      </motion.div>

      <motion.div
        className="glass-strong absolute right-[-3%] top-[18%] z-20 w-[44%] rounded-2xl p-3 shadow-glass"
        animate={{ y: [0, -12, 0], rotate: [3, 1, 3] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-revia-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-revia-ink text-white">
              <Music className="h-3.5 w-3.5" />
            </span>
            Voice note
          </div>
          <span className="text-[10px] text-revia-slate/80">0:34</span>
        </div>
        <div className="mt-3 flex h-8 items-center gap-[3px]">
          {Array.from({ length: 22 }).map((_, i) => {
            const h = 8 + ((i * 7) % 22);
            return (
              <span
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-b from-social-blue to-revia-purple"
                style={{ height: `${h}px`, opacity: 0.65 + (i % 3) * 0.12 }}
              />
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="glass-strong absolute bottom-[6%] left-[-4%] z-20 w-[44%] rounded-2xl p-3 shadow-glass"
        animate={{ y: [0, -8, 0], rotate: [-2, 0, -2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-revia-purple to-social-blue text-white">
            <Play className="h-3.5 w-3.5 fill-current" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-revia-ink">First steps</span>
            <span className="text-[10px] text-revia-slate/80">
              Clip · 0:08
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-revia-mist">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-social-blue via-revia-lavender to-revia-purple"
            initial={{ width: "20%" }}
            animate={{ width: ["20%", "82%", "20%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <motion.div
        className="glass-strong absolute bottom-[18%] right-[-4%] z-20 flex w-[40%] items-center gap-3 rounded-2xl p-3 shadow-glass"
        animate={{ y: [0, -10, 0], rotate: [2, 0, 2] }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.1,
        }}
      >
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-soft">
          <ScanLine className="h-5 w-5 text-social-blue" />
          <motion.span
            className="absolute inset-x-1 top-2 h-px bg-gradient-to-r from-transparent via-social-blue to-transparent"
            animate={{ y: [0, 22, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-semibold text-revia-ink">Hold to recall</span>
          <span className="text-[10px] text-revia-slate/80">
            The moment returns
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[6%] top-[2%] z-30 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFE2B8] to-[#FFB7C5] shadow-soft"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="h-4 w-4 text-white" />
      </motion.div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div
      className="relative aspect-[9/19] w-full rounded-[2.25rem] border border-white/80 bg-gradient-to-b from-white to-[#F6F4FF] p-2 shadow-glass"
      style={{ perspective: "1000px" }}
    >
      <div className="absolute inset-x-0 top-2 mx-auto h-1.5 w-16 rounded-full bg-revia-ink/15" />

      <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#F4F2FF] via-white to-[#E8F1FF]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 0%, rgba(0,120,244,0.18), transparent 60%), radial-gradient(80% 50% at 50% 100%, rgba(184,181,255,0.55), transparent 60%)",
          }}
        />

        <div className="relative flex items-center justify-between px-4 pt-5 text-[10px] font-medium text-revia-slate">
          <span>9:41</span>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-revia-purple shadow-soft">
            Revia
          </span>
        </div>

        <div className="relative mt-4 px-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-revia-slate">
            Memory
          </p>
          <p className="mt-1 text-sm font-semibold leading-tight text-revia-ink">
            Grandma&apos;s teacup
          </p>
        </div>

        <div className="relative mx-4 mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-white/80 shadow-soft">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 60% at 30% 30%, #FFE2B8, transparent 70%), radial-gradient(80% 60% at 70% 70%, #B8B5FF, transparent 60%), linear-gradient(135deg, #FFD6E0, #C8A8FF 60%, #A7C7FF)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div
              aria-hidden
              className="relative grid h-16 w-16 place-items-center rounded-full bg-white/70 backdrop-blur"
            >
              <ScanLine className="h-6 w-6 text-revia-purple" />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-social-blue/70"
                animate={{ scale: [0.9, 1.25], opacity: [0.7, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-xl bg-white/60 px-2 py-1.5 text-[10px] font-medium text-revia-ink backdrop-blur">
            <span>Hold to revisit</span>
            <span className="text-social-blue">Ready</span>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 px-4">
          {[
            "from-[#FFD6A5] to-[#FFB7C5]",
            "from-[#B8B5FF] to-[#A7C7FF]",
            "from-[#FFE7A8] to-[#C8A8FF]",
          ].map((g, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg bg-gradient-to-br ${g} shadow-soft`}
            />
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-revia-ink px-3 py-2 text-[10px] font-semibold text-white shadow-lift">
          <span>Open the moment</span>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15">
            <ScanLine className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
