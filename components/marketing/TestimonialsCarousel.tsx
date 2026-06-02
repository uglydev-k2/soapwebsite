"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedSectionHeader } from "@/components/motion/ScrollReveal";
import { EASE_OUT } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "The Forest Cedar body wash has completely transformed my evening routine. The scent lingers beautifully and my skin has never felt softer.",
    name: "Elena M.",
    location: "Portland, OR",
    product: "Forest Cedar Body Wash",
    rating: 5,
  },
  {
    quote:
      "I've tried countless 'natural' soaps, but MsVee is in a league of its own. The Citrus Bloom bars are bright, creamy, and last forever.",
    name: "James R.",
    location: "Austin, TX",
    product: "Citrus Bloom Bar Soap",
    rating: 5,
  },
  {
    quote:
      "The Full Ritual Gift Set was the perfect birthday present for my sister. The packaging alone feels like unwrapping something truly special.",
    name: "Priya S.",
    location: "Brooklyn, NY",
    product: "The Full Ritual Gift Set",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 fill-gold"
          aria-hidden
        >
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.27l-3.52 1.85.67-3.92L2.3 5.64l3.94-.57L8 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsCarousel() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [reduced]);

  const testimonial = testimonials[active];

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader eyebrow="Kind Words" title="Loved by Ritualists" />

        <div className="relative mt-16">
          <div className="hidden gap-8 lg:grid lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className={cn(
                  "flex h-full flex-col border border-green/10 bg-cream p-8",
                  "transition-shadow duration-300 hover:shadow-md"
                )}
              >
                <StarRating count={item.rating} />
                <p className="mt-6 flex-1 font-serif text-lg leading-relaxed text-green">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-8 border-t border-green/10 pt-6">
                  <cite className="not-italic">
                    <span className="block font-sans text-sm font-normal text-green">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {item.location}
                    </span>
                  </cite>
                  <span className="mt-3 block label-caps text-gold">
                    {item.product}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={testimonial.name}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="flex min-h-[280px] flex-col border border-green/10 bg-cream p-8"
              >
                <StarRating count={testimonial.rating} />
                <p className="mt-6 flex-1 font-serif text-lg leading-relaxed text-green">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-8 border-t border-green/10 pt-6">
                  <cite className="not-italic">
                    <span className="block font-sans text-sm font-normal text-green">
                      {testimonial.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {testimonial.location}
                    </span>
                  </cite>
                  <span className="mt-3 block label-caps text-gold">
                    {testimonial.product}
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-6 flex justify-center gap-2">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`Show review from ${item.name}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-2 w-2 transition-all duration-250",
                    index === active
                      ? "w-8 bg-terra"
                      : "bg-green/25 hover:bg-green/40"
                  )}
                  style={{ borderRadius: "2px" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
