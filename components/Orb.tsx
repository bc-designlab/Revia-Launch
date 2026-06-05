"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

type Tone =
  | "lavender"
  | "blue"
  | "pink"
  | "yellow"
  | "purple"
  | "white"
  | "mint";

const tones: Record<Tone, { core: string; mid: string; deep: string }> = {
  lavender: { core: "#FFFFFF", mid: "#CFC9FF", deep: "#8A86E0" },
  blue: { core: "#FFFFFF", mid: "#B6D4FF", deep: "#3F7BD8" },
  pink: { core: "#FFFFFF", mid: "#FFC8E0", deep: "#E07AAE" },
  yellow: { core: "#FFFFFF", mid: "#FFE6A8", deep: "#E0B040" },
  purple: { core: "#FFFFFF", mid: "#C8A8FF", deep: "#5A2DC4" },
  white: { core: "#FFFFFF", mid: "#F0EEFF", deep: "#C9C6E6" },
  mint: { core: "#FFFFFF", mid: "#C6F0E0", deep: "#4FB89A" },
};

export default function Orb({
  tone = "lavender",
  size = 48,
  className = "",
  style = {},
  delay = 0,
  duration = 7,
  range = 14,
  rotate = false,
}: {
  tone?: Tone;
  size?: number;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  range?: number;
  rotate?: boolean;
}) {
  const t = tones[tone];
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 28%, ${t.core} 0%, ${t.mid} 38%, ${t.deep} 100%)`,
        boxShadow: `inset -${Math.max(3, size * 0.08)}px -${Math.max(
          3,
          size * 0.08,
        )}px ${Math.max(8, size * 0.25)}px ${hex(
          t.deep,
          0.35,
        )}, 0 ${Math.max(8, size * 0.2)}px ${Math.max(
          14,
          size * 0.4,
        )}px ${hex(t.deep, 0.18)}`,
        ...style,
      }}
      animate={{
        y: [0, -range, 0],
        rotate: rotate ? [0, 8, -6, 0] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function hex(c: string, a: number) {
  // c is "#RRGGBB"
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
