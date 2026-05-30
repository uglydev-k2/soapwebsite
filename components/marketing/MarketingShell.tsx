"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SplashScreen } from "@/components/motion/SplashScreen";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { pageTransition } from "@/lib/motion";
import type { NavbarAuthUser } from "@/lib/navbar-auth";

export function MarketingShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: NavbarAuthUser | null;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <>
      <SplashScreen />
      <ScrollProgress />
      <Navbar initialUser={initialUser} />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduced ? 1 : 0 }}
          transition={pageTransition(!!reduced)}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
