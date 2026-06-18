import Image from "next/image";
import Link from "next/link";
import { AmbientOrbs } from "@/components/motion/ScrollParallax";
import {
  AnimatedSectionHeader,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { ValuesCard } from "@/components/marketing/ValuesCard";
import { ABOUT_ORIGIN, CRAFT_PROCESS } from "@/lib/content/about";

const values = [
  {
    title: "Botanical Sourcing",
    description:
      "Plant oils, butters, and extracts chosen from ethical suppliers for how they perform on skin.",
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
      "Every bar is poured, cured, trimmed, and packed by hand — never mass-produced on a line.",
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
      "No parabens, sulfates, or synthetic dyes — just botanicals and skin-loving oils.",
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
      "Bathing is a ceremony — a daily pause to reconnect with yourself and nature.",
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
          eyebrow="Our Story"
          title="Crafted with Intention"
          description="We make bath and body care the slow way — by hand, in small batches, with ingredients chosen for how they feel on skin and how they turn an ordinary routine into a ritual."
        />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <p className="label-caps text-terra">The Beginning</p>
            <h3 className="mt-3 font-serif text-3xl text-green sm:text-4xl">
              {ABOUT_ORIGIN.title}
            </h3>
            <div className="mt-6 space-y-4 text-muted leading-relaxed">
              {ABOUT_ORIGIN.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <Link
              href="/about"
              className="label-caps mt-8 inline-block text-green transition-colors hover:text-terra"
            >
              Read our full story →
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div
              className="relative aspect-[4/5] overflow-hidden border border-green/10 bg-stone-100"
              style={{ borderRadius: "2px" }}
            >
              <Image
                src={ABOUT_ORIGIN.image}
                alt={ABOUT_ORIGIN.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-20 lg:mt-28">
          <ScrollReveal>
            <p className="label-caps text-terra">How It&apos;s Made</p>
            <h3 className="mt-3 font-serif text-3xl text-green sm:text-4xl">
              Small-Batch from Start to Finish
            </h3>
            <p className="mt-4 max-w-2xl text-muted leading-relaxed">
              Every product moves through the same careful process before it reaches your door.
            </p>
          </ScrollReveal>

          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2" stagger={0.08}>
            {CRAFT_PROCESS.map((step) => (
              <StaggerItem key={step.step}>
                <article
                  className="group h-full overflow-hidden border border-green/10 bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <span className="font-serif text-2xl text-gold">{step.step}</span>
                    <h4 className="mt-2 font-serif text-xl text-green">{step.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <div className="mt-20 lg:mt-28">
          <ScrollReveal>
            <p className="label-caps text-terra">Our Philosophy</p>
            <h3 className="mt-3 font-serif text-3xl text-green">What Guides Every Batch</h3>
          </ScrollReveal>

          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
