import {
  AnimatedSectionHeader,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { CountUpStat } from "@/components/motion/CountUpStat";
import { RitualStepCard } from "@/components/marketing/RitualStepCard";

const stats = [
  { value: "12K+", label: "Happy Ritualists" },
  { value: "48", label: "Botanical Scents" },
  { value: "100%", label: "Handcrafted" },
  { value: "4.9", label: "Average Rating" },
];

const steps = [
  {
    number: "01",
    title: "Prepare",
    description:
      "Draw warm water and set your intention. Light a candle, play soft music, breathe deeply.",
  },
  {
    number: "02",
    title: "Cleanse",
    description:
      "Work our botanical formula into rich lather. Let the natural oils nourish your skin.",
  },
  {
    number: "03",
    title: "Restore",
    description:
      "Rinse slowly, pat dry with intention. Follow with lotion to lock in moisture and scent.",
  },
];

export default function RitualSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-20 lg:py-28"
      id="ritual"
    >
      <ScrollParallax
        className="pointer-events-none absolute inset-0"
        offset={24}
      >
        <div className="ritual-rings h-full w-full" aria-hidden />
      </ScrollParallax>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <AnimatedSectionHeader
              align="left"
              theme="light"
              eyebrow="The MsVee Ritual"
              title={
                <>
                  More Than a Bath —
                  <br />a Daily Ceremony
                </>
              }
              description="We designed every product to transform an ordinary routine into a mindful practice. Three simple steps to reconnect with yourself."
              className="max-w-md"
            />

            <dl className="mt-12 grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-serif text-3xl text-gold lg:text-4xl">
                    <CountUpStat value={stat.value} />
                  </dt>
                  <dd className="mt-1 label-caps text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>

          <StaggerContainer className="grid gap-4">
            {steps.map((step) => (
              <StaggerItem key={step.number}>
                <RitualStepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
