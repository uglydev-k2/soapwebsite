"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { BotanicalParticles } from "@/components/motion/BotanicalParticles";
import { EASE_OUT, fadeUp, staggerContainer } from "@/lib/motion";

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
    <section className="relative overflow-hidden pt-18">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <motion.div
          className="flex flex-col gap-8"
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={staggerContainer(0.08, 0.1)}
        >
          <motion.div className="flex items-center gap-4" variants={fadeUp}>
            <span className="label-caps text-terra">Premium Botanical Bath</span>
            <span className="h-px max-w-16 flex-1 bg-gold" aria-hidden />
          </motion.div>

          <motion.div className="flex flex-wrap gap-2" variants={fadeUp}>
            <span className="border border-green/15 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-green">
              Free shipping on $60+
            </span>
            <span className="border border-green/15 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-green">
              Free sample every order
            </span>
          </motion.div>

          <h1 className="font-serif text-5xl font-light leading-[1.08] text-green lg:text-6xl xl:text-7xl">
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
            className="max-w-md text-base leading-relaxed text-muted"
            variants={fadeUp}
          >
            Handcrafted soaps and body care infused with botanical essences.
            Transform your daily cleanse into a moment of calm, intention, and
            indulgence.
          </motion.p>

          <motion.div className="flex flex-wrap items-center gap-4" variants={fadeUp}>
            <Link
              href="/collections"
              className="cta-shimmer inline-flex items-center justify-center gap-2 bg-terra px-8 py-4 text-sm label-caps text-white transition-colors duration-250 hover:bg-terra-2"
              style={{ borderRadius: 0 }}
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#ritual"
              className="inline-flex items-center justify-center border border-green/30 bg-transparent px-8 py-4 text-sm label-caps text-green transition-colors duration-250 hover:border-green hover:bg-green/5"
              style={{ borderRadius: 0 }}
            >
              Discover Our Ritual
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden bg-green lg:aspect-square"
            style={{ y: panelY, scale: panelScale }}
          >
            <BotanicalParticles />
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <path
                d="M200 380 C200 380 80 280 80 180 C80 100 130 40 200 40 C270 40 320 100 320 180 C320 280 200 380 200 380Z"
                fill="none"
                stroke="rgba(201,169,110,0.35)"
                strokeWidth="1"
                className="animate-draw-stroke"
                style={{ strokeDasharray: 800, strokeDashoffset: 800 }}
              />
              <path
                d="M200 340 C200 340 120 260 120 180 C120 120 155 80 200 80 C245 80 280 120 280 180 C280 260 200 340 200 340Z"
                fill="none"
                stroke="rgba(201,169,110,0.22)"
                strokeWidth="1"
                className="animate-draw-stroke"
                style={{
                  strokeDasharray: 600,
                  strokeDashoffset: 600,
                  animationDelay: "0.4s",
                }}
              />
              <path
                d="M200 60 L200 320 M160 140 Q200 100 240 140 M150 200 Q200 160 250 200 M155 260 Q200 220 245 260"
                fill="none"
                stroke="rgba(247,243,237,0.28)"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="animate-draw-stroke"
                style={{
                  strokeDasharray: 500,
                  strokeDashoffset: 500,
                  animationDelay: "0.8s",
                }}
              />
              <circle cx="200" cy="180" r="5" fill="rgba(201,169,110,0.55)" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-green-3/50 via-transparent to-green-3/10" />
          </motion.div>

          <motion.div
            className={cn(
              "absolute -bottom-6 -left-4 w-64 border border-green/10 bg-white p-5 shadow-xl",
              "lg:-bottom-8 lg:-left-8 lg:w-72",
              !reduced && "animate-float-gentle"
            )}
            style={{ borderRadius: "2px" }}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: EASE_OUT }}
          >
            <span className="label-caps text-gold">The Collection</span>
            <h3 className="mt-2 font-serif text-xl text-green">
              Botanical Bath & Body
            </h3>
            <p className="mt-1 text-sm text-muted">
              Soaps, washes, lotions, and ritual sets — crafted in small batches.
            </p>
            <Link
              href="/collections"
              className="mt-4 inline-block label-caps text-green transition-colors duration-250 hover:text-terra"
            >
              Shop all →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
