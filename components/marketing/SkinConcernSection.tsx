import Link from "next/link";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";

const concerns = [
  {
    title: "Best for Acne",
    description: "Clarifying bars and washes designed to cleanse without stripping.",
    href: "/collections?scent=charcoal&sort=featured",
  },
  {
    title: "Best for Sensitive Skin",
    description: "Gentle formulas with soft botanicals and no harsh additives.",
    href: "/collections?scent=lavender&sort=featured",
  },
  {
    title: "Best for Eczema",
    description: "Moisture-forward picks with comforting ingredients for dry skin.",
    href: "/collections?scent=milk&sort=featured",
  },
  {
    title: "Best for Men",
    description: "Grounded wood and mint profiles with rich, long-lasting lather.",
    href: "/collections?scent=cedar&sort=featured",
  },
  {
    title: "Best Gifts for Baby",
    description: "Soft, giftable routines tailored for gentle everyday care.",
    href: "/collections?category=GIFT_SET&sort=featured",
  },
];

export default function SkinConcernSection() {
  return (
    <section className="bg-cream-2 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Shop by Skin Concern"
          title="Find the Right Ritual Faster"
          description="Browse curated picks based on skin needs, gifting moments, and fragrance preferences."
        />

        <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger={0.06}>
          {concerns.map((concern) => (
            <StaggerItem key={concern.title}>
              <Link
                href={concern.href}
                className="group block h-full border border-green/12 bg-white p-6 transition-all duration-250 hover:border-terra/35 hover:shadow-sm"
                style={{ borderRadius: "2px" }}
              >
                <h3 className="font-serif text-2xl text-green transition-colors duration-250 group-hover:text-terra">
                  {concern.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{concern.description}</p>
                <span className="mt-6 inline-block label-caps text-green">Explore →</span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
