import { AmbientOrbs } from "@/components/motion/ScrollParallax";
import {
  AnimatedSectionHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { ValuesCard } from "@/components/marketing/ValuesCard";

const values = [
  {
    title: "Botanical Sourcing",
    description:
      "Every ingredient is thoughtfully selected from sustainable farms and ethical suppliers worldwide.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
        <path
          d="M24 44V20M24 20C24 20 12 16 8 8C16 10 24 20 24 20ZM24 20C24 20 36 16 40 8C32 10 24 20 24 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 36C16 36 20 32 24 32C28 32 32 36 32 36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Small Batch Craft",
    description:
      "Each product is poured, cut, and cured by hand in limited quantities for peak freshness.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
        <rect
          x="10"
          y="14"
          width="28"
          height="26"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ borderRadius: "2px" }}
        />
        <path
          d="M18 14V10C18 8.9 18.9 8 20 8H28C29.1 8 30 8.9 30 10V14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M16 24H32M16 30H28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Clean Formulas",
    description:
      "No parabens, sulfates, or synthetic dyes. Just pure botanicals and skin-loving oils.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M24 16V24L30 30"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 8L16 4M30 8L32 4M40 18L44 16M40 30L44 32"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Mindful Ritual",
    description:
      "We believe bathing is a ceremony — a daily pause to reconnect with yourself and nature.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
        <path
          d="M24 8C24 8 14 14 14 24C14 34 24 40 24 40C24 40 34 34 34 24C34 14 24 8 24 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function ValuesSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-14 sm:py-20 lg:py-28" id="about">
      <AmbientOrbs />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Our Philosophy"
          title="Crafted with Intention"
          description="From sourcing to packaging, every detail reflects our commitment to quality, sustainability, and the art of self-care."
        />

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <StaggerItem key={value.title}>
              <ValuesCard
                title={value.title}
                description={value.description}
                icon={value.icon}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
