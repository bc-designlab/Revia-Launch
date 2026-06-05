"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #E4DEFF 0%, #DCE9FF 38%, #F4E3FF 72%, #E8DAFF 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute -top-32 -left-24 h-[640px] w-[640px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,120,244,0.40), rgba(0,120,244,0) 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.1 }}
        className="absolute top-[6%] right-[-14%] h-[720px] w-[720px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(184,181,255,0.65), rgba(184,181,255,0) 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.15 }}
        className="absolute top-[40%] left-[35%] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,205,235,0.55), rgba(255,205,235,0) 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
        className="absolute bottom-[-18%] left-[10%] h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(58,12,163,0.28), rgba(58,12,163,0) 70%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.25 }}
        className="absolute bottom-[-10%] right-[5%] h-[560px] w-[560px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,120,244,0.28), rgba(0,120,244,0) 70%)",
        }}
      />

      <Particles />
    </div>
  );
}

function Particles() {
  const dots = Array.from({ length: 22 });
  return (
    <div className="absolute inset-0">
      {dots.map((_, i) => {
        const left = (i * 53) % 100;
        const top = (i * 37) % 100;
        const size = 2 + (i % 4);
        const delay = (i % 6) * 0.6;
        const duration = 6 + (i % 5);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background:
                i % 3 === 0
                  ? "rgba(0,120,244,0.55)"
                  : i % 3 === 1
                  ? "rgba(184,181,255,0.7)"
                  : "rgba(58,12,163,0.45)",
              boxShadow: "0 0 12px rgba(0,120,244,0.35)",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: [-6, -22, -6] }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
