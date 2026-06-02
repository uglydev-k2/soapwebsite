"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatedSectionHeader } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/utils";

const goals = [
  {
    id: "cleanse",
    label: "Daily cleanse",
    href: "/collections/category/bar-soap",
    scent: "citrus",
  },
  {
    id: "moisture",
    label: "Deep moisture",
    href: "/collections/category/lotion",
    scent: "amber",
  },
  {
    id: "gift",
    label: "Gift-ready set",
    href: "/collections/category/gift-set",
    scent: "lavender",
  },
] as const;

const scents = [
  { id: "cedar", label: "Forest & cedar", param: "cedar" },
  { id: "citrus", label: "Citrus bloom", param: "citrus" },
  { id: "amber", label: "Warm amber", param: "amber" },
  { id: "lavender", label: "Lavender mist", param: "lavender" },
] as const;

export default function RitualBuilder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [scent, setScent] = useState<string | null>(null);

  const goalData = goals.find((g) => g.id === goal);
  const scentData = scents.find((s) => s.id === scent);

  let resultHref: string | null = null;
  if (goalData && scentData) {
    const url = new URL(goalData.href, "https://msvee.local");
    url.searchParams.set("scent", scentData.param);
    resultHref = `${url.pathname}${url.search}`;
  } else if (goalData) {
    resultHref = goalData.href;
  }

  return (
    <section className="bg-cream-2 py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Ritual Builder"
          title="Build Your Perfect Routine"
          description="Two choices — we'll send you to the right collection."
        />

        <div className="mt-12 space-y-10">
          <div>
            <p className="label-caps text-muted">Step 1 — Your goal</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {goals.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setGoal(option.id)}
                  className={cn(
                    "border px-4 py-2 text-sm transition-colors",
                    goal === option.id
                      ? "border-green bg-green text-cream"
                      : "border-green/20 bg-white text-green hover:border-green/40"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps text-muted">Step 2 — Scent mood</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {scents.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setScent(option.id)}
                  className={cn(
                    "border px-4 py-2 text-sm transition-colors",
                    scent === option.id
                      ? "border-terra bg-terra text-white"
                      : "border-green/20 bg-white text-green hover:border-green/40"
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
              className="cta-shimmer inline-flex items-center justify-center bg-terra px-8 py-4 text-sm label-caps text-white hover:bg-terra-2"
              style={{ borderRadius: 0 }}
            >
              Shop my ritual →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
