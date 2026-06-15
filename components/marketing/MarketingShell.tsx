"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { PromoBanner } from "@/components/marketing/PromoBanner";
import { MaintenanceOverlay, useMaintenanceDismissed } from "@/components/marketing/MaintenanceOverlay";
import { SplashScreen } from "@/components/motion/SplashScreen";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { pageTransition } from "@/lib/motion";
import type { NavbarAuthUser } from "@/lib/navbar-auth";

export function MarketingShell({
  children,
  initialUser,
  maintenance = false,
  maintenanceMessage,
}: {
  children: React.ReactNode;
  initialUser?: NavbarAuthUser | null;
  maintenance?: boolean;
  maintenanceMessage?: string;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const mobileCtaY = useTransform(scrollY, [0, 120], [reduced ? 0 : 80, 0]);
  const mobileCtaOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const { dismissed, dismiss, ready } = useMaintenanceDismissed();
  const showMaintenance = maintenance && ready && !dismissed;
  const showStorefrontChrome = !maintenance || dismissed;

  return (
    <>
      {showStorefrontChrome && <SplashScreen />}
      <ScrollProgress />
      {showStorefrontChrome && <PromoBanner />}
      <Navbar initialUser={initialUser} />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="marketing-main-pad"
          initial={
            reduced ? false : { opacity: 0, y: 12 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -8 }}
          transition={pageTransition(!!reduced)}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showStorefrontChrome && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          style={{ y: mobileCtaY, opacity: reduced ? 1 : mobileCtaOpacity }}
        >
          <Link
            href="/collections"
            className="pointer-events-auto cta-shimmer inline-flex min-h-[3rem] w-full items-center justify-center bg-terra px-8 py-3.5 text-sm label-caps text-white shadow-lg transition-colors duration-250 hover:bg-terra-2"
            style={{ borderRadius: 0 }}
          >
            Shop Now
          </Link>
        </motion.div>
      )}
      <Footer />
      {showMaintenance && maintenanceMessage ? (
        <MaintenanceOverlay message={maintenanceMessage} onClose={dismiss} />
      ) : null}
    </>
  );
}
