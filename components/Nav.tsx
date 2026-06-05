"use client";

import { motion } from "framer-motion";
import ReviaLogo from "./ReviaLogo";
import { useWaitlist } from "./WaitlistContext";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#interaction" },
];

export default function Nav() {
  const openModal = useWaitlist();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-[100] w-full"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:py-6">
        <a
          href="#"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <ReviaLogo height={47} />
        </a>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[13px] font-medium text-revia-slate transition-colors duration-200 hover:text-revia-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={openModal}
          className="rounded-full bg-revia-ink px-4 py-2 text-[13px] font-medium text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#1a1f4a]"
        >
          Join the Waitlist
        </button>
      </div>
    </motion.header>
  );
}
