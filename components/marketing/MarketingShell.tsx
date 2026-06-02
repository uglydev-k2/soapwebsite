"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[55] px-6 md:hidden">
        <Link
          href="/collections"
          className="pointer-events-auto cta-shimmer inline-flex w-full items-center justify-center bg-terra px-8 py-4 text-sm label-caps text-white shadow-lg transition-colors duration-250 hover:bg-terra-2"
          style={{ borderRadius: 0 }}
        >
          Shop Now
        </Link>
      </div>
      <Footer />
    </>
  );
}
