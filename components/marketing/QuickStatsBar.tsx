"use client";

import { CountUpStat } from "@/components/motion/CountUpStat";
import { StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";
const stats = [
  { value: "6", label: "Product Categories" },
  { value: "30+", label: "Botanical Scents" },
  { value: "4.9", label: "Average Rating" },
  { value: "100%", label: "Handcrafted" },
];

export default function QuickStatsBar() {
  return (
    <section className="border-y border-green/10 bg-white py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <StaggerContainer
          className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12"
          stagger={0.1}
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center lg:text-left">
                <p className="font-serif text-3xl text-terra lg:text-4xl">
                  <CountUpStat value={stat.value} />
                </p>
                <p className="mt-2 label-caps text-muted">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
