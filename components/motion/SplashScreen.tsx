"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

export function SplashScreen() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!reduced);

  useEffect(() => {
    if (reduced) return;
    const seen = sessionStorage.getItem("msvee-splash-seen");
    if (seen) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem("msvee-splash-seen", "1");
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-green-3"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <BrandLogo size="lg" variant="light" />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-cream"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
