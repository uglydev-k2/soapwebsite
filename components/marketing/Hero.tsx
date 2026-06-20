"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_SAMPLE_PROMO, FREE_SHIPPING_PROMO } from "@/lib/shipping";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, fadeUp, staggerContainer } from "@/lib/motion";

const HERO_IMAGE = "/images/hero-soaps.jpg?v=2";

const headlineWords = [
  { text: "Where", accent: false },
  { text: "Ritual", accent: false },
  { text: "Meets", accent: false },
  { text: "Luxury", accent: true },
];

export default function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const panelY = useTransform(scrollY, [0, 500], [0, reduced ? 0 : 48]);
  const panelScale = useTransform(scrollY, [0, 500], [1, reduced ? 1 : 1.03]);

  return (
    <section className="marketing-header-offset relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <motion.div
          className="flex flex-col gap-8"
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={staggerContainer(0.08, 0.1)}
        >
          <motion.div className="flex flex-wrap items-center gap-3 sm:gap-4" variants={fadeUp}>
            <span className="label-caps text-terra">Premium Botanical Bath</span>
            <span className="hidden h-px max-w-16 flex-1 bg-gold sm:block" aria-hidden />
          </motion.div>

          <motion.div className="flex flex-wrap gap-2" variants={fadeUp}>
            <span className="border border-green/15 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-green">
              {FREE_SHIPPING_PROMO}
            </span>
            <span className="border border-green/15 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-green">
              {FREE_SAMPLE_PROMO}
            </span>
          </motion.div>

          <h1 className="font-serif text-[2.35rem] font-semibold leading-[1.1] text-green sm:text-5xl lg:text-6xl xl:text-7xl">
            {headlineWords.map((word, index) => (
              <motion.span
                key={word.text}
                className={cn(
                  "inline-block mr-[0.28em]",
                  word.accent && "text-terra italic"
                )}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduced ? 0 : 0.15 + index * 0.08,
                  ease: EASE_OUT,
                }}
              >
                {word.text}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="max-w-md text-base leading-relaxed text-text"
            variants={fadeUp}
          >
            Handcrafted soaps and body care infused with botanical essences.
            Transform your daily cleanse into a moment of calm, intention, and
            indulgence.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            variants={fadeUp}
          >
            <Link
              href="/collections"
              className="cta-shimmer inline-flex min-h-[3rem] w-full items-center justify-center gap-2 bg-terra px-8 py-3.5 text-sm label-caps text-white transition-colors duration-250 hover:bg-terra-2 sm:w-auto"
              style={{ borderRadius: 0 }}
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#ritual"
              className="inline-flex min-h-[3rem] w-full items-center justify-center border border-green/30 bg-transparent px-8 py-3.5 text-sm label-caps text-green transition-colors duration-250 hover:border-green hover:bg-green/5 sm:w-auto"
              style={{ borderRadius: 0 }}
            >
              Discover Our Ritual
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden bg-stone-200 lg:aspect-square"
            style={{ y: panelY, scale: panelScale }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Luxury handcrafted soap bars styled on marble with botanical accents"
              className="absolute inset-0 h-full w-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            className={cn(
              "relative z-10 -mt-6 w-full border border-green/10 bg-white p-5 shadow-lg",
              "sm:mt-4 lg:absolute lg:-bottom-8 lg:-left-8 lg:mt-0 lg:w-72"
            )}
            style={{ borderRadius: "2px" }}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: EASE_OUT }}
          >
            <span className="label-caps text-gold">The Collection</span>
            <h3 className="subheading mt-2 text-xl">Botanical Bath & Body</h3>
            <p className="mt-1 text-sm text-muted">
              Soaps, washes, lotions, and ritual sets — crafted in small batches.
            </p>
            <Link
              href="/collections"
              className="mt-4 flex min-h-[3rem] w-full items-center justify-center bg-terra px-6 py-3 text-sm label-caps text-white transition-colors duration-250 hover:bg-terra-2 lg:inline-flex lg:min-h-0 lg:w-auto lg:bg-transparent lg:px-0 lg:py-0 lg:text-green lg:hover:text-terra"
              style={{ borderRadius: 0 }}
            >
              <span className="lg:hidden">Shop now</span>
              <span className="hidden lg:inline">Shop all →</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
