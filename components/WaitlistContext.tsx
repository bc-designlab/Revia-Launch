"use client";

import { createContext, useContext, useState } from "react";
import WaitlistModal from "./WaitlistModal";

const WaitlistContext = createContext<() => void>(() => {});

export function useWaitlist(): () => void {
  return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <WaitlistContext.Provider value={() => setOpen(true)}>
      {children}
      <WaitlistModal isOpen={open} onClose={() => setOpen(false)} />
    </WaitlistContext.Provider>
  );
}
