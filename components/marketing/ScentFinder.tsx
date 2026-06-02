"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatedSectionHeader } from "@/components/motion/ScrollReveal";
import { SCENT_FINDER_OPTIONS } from "@/lib/content/site-content";
import { cn } from "@/lib/utils";

export default function ScentFinder() {
  const [mood, setMood] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  const moodOption = SCENT_FINDER_OPTIONS.mood.find((o) => o.value === mood);
  const formatOption = SCENT_FINDER_OPTIONS.format.find((o) => o.value === format);

  let resultHref: string | null = null;
  if (formatOption && moodOption) {
    const url = new URL(formatOption.href, "https://msvee.local");
    const scent = new URL(moodOption.href, "https://msvee.local").searchParams.get(
      "scent"
    );
    if (scent) url.searchParams.set("scent", scent);
    resultHref = `${url.pathname}${url.search}`;
  } else if (formatOption) {
    resultHref = formatOption.href;
  } else if (moodOption) {
    resultHref = moodOption.href;
  }

  return (
    <section className="bg-green-3 py-14 text-cream sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 [&_button]:text-inherit">
        <AnimatedSectionHeader
          theme="dark"
          eyebrow="Scent Finder"
          title="Find Your Signature Ritual"
          description="Answer two quick questions and we'll point you to the right collection."
        />

        <div className="mt-12 space-y-10">
          <div>
            <p className="label-caps text-gold">How do you want to feel?</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              {SCENT_FINDER_OPTIONS.mood.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={cn(
                    "min-h-[2.75rem] border px-4 py-2.5 text-sm transition-colors duration-250 sm:py-2",
                    mood === option.value
                      ? "border-gold bg-gold/25 text-cream"
                      : "border-cream/40 bg-white/5 text-cream hover:border-cream/70 hover:bg-white/10"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps text-gold">What format?</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              {SCENT_FINDER_OPTIONS.format.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  className={cn(
                    "min-h-[2.75rem] border px-4 py-2.5 text-sm transition-colors duration-250 sm:py-2",
                    format === option.value
                      ? "border-gold bg-gold/25 text-cream"
                      : "border-cream/40 bg-white/5 text-cream hover:border-cream/70 hover:bg-white/10"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {resultHref && (
            <Link
              href={resultHref}
              className="cta-shimmer inline-flex min-h-[3rem] w-full items-center justify-center bg-terra px-8 py-3.5 text-sm label-caps text-white hover:bg-terra-2 sm:w-auto"
              style={{ borderRadius: 0 }}
            >
              See your matches →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
