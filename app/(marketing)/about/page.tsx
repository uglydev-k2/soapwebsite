import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";

export const metadata = { title: "About — mvlusciouslather" };

const milestones = [
  { year: "2024", label: "Founded in small-batch apothecary tradition" },
  { year: "2025", label: "Expanded to six scent families & gift rituals" },
  { year: "2026", label: "Growing community of ritualists nationwide" },
];

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="Our Story"
      title="Crafted with Intention"
      description="mvlusciouslather was born from a simple belief: daily rituals deserve the same care as special occasions."
    >
      <div className="space-y-6 text-muted leading-relaxed">
        <p>
          Every bar, bottle, and balm in our collection is hand-crafted in small batches
          using botanical extracts, essential oils, and clean formulations your skin will
          love.
        </p>
        <p>
          We draw inspiration from apothecary traditions and the quiet beauty of the
          natural world. Our scents are composed like fine fragrance — layered, balanced,
          and designed to transform an ordinary moment into something sacred.
        </p>
        <p>
          We never use parabens, sulfates, or synthetic dyes. From forest cedar to warm
          amber, each scent profile tells a story — and invites you to write your own.
        </p>
      </div>

      <div className="mt-16 space-y-6 border-t border-green/10 pt-12">
        {milestones.map((item) => (
          <div key={item.year} className="flex gap-8 border-l-2 border-gold pl-6">
            <span className="font-serif text-2xl text-terra">{item.year}</span>
            <p className="pt-1 text-green">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 border-t border-green/10 pt-12 md:grid-cols-4">
        {[
          { label: "Ingredients", value: "48+" },
          { label: "Scent Profiles", value: "4" },
          { label: "Clean", value: "100%" },
          { label: "Est.", value: "2024" },
        ].map((stat) => (
          <div key={stat.label} className="border-l-2 border-gold pl-4">
            <p className="font-serif text-3xl text-green">{stat.value}</p>
            <p className="label-caps mt-1 text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap gap-4">
        <Link
          href="/ingredients"
          className="label-caps text-green hover:text-terra"
        >
          Ingredient glossary →
        </Link>
        <Link
          href="/sustainability"
          className="label-caps text-green hover:text-terra"
        >
          Sustainability →
        </Link>
        <Link href="/journal" className="label-caps text-green hover:text-terra">
          Read the journal →
        </Link>
      </div>
    </MarketingPage>
  );
}
