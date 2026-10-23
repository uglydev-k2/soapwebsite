import Link from "next/link";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";

const concerns = [
  {
    title: "Best for Acne",
    description: "Clarifying bars and washes designed to cleanse without stripping.",
    href: "/collections?concern=acne&sort=featured",
  },
  {
    title: "Best for Sensitive Skin",
    description: "Gentle formulas with soft botanicals and no harsh additives.",
    href: "/collections?concern=sensitive&sort=featured",
  },
  {
    title: "Best for Eczema",
    description: "Moisture-forward picks with comforting ingredients for dry skin.",
    href: "/collections?concern=eczema&sort=featured",
  },
  {
    title: "Best for Men",
    description: "Grounded wood and mint profiles with rich, long-lasting lather.",
    href: "/collections?concern=men&sort=featured",
  },
  {
    title: "Best Gifts for Baby",
    description: "Soft, giftable routines tailored for gentle everyday care.",
    href: "/collections?concern=baby&sort=featured",
  },
];

export default function SkinConcernSection() {
  return (
    <section className="lavender-wash py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSectionHeader
          accent="lavender"
          eyebrow="Shop by Skin Concern"
          title="Find the Right Ritual Faster"
          description="Browse curated picks based on skin needs, gifting moments, and fragrance preferences."
        />

        <StaggerContainer
          className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5"
          stagger={0.06}
        >
          {concerns.map((concern) => (
            <StaggerItem key={concern.title}>
              <InteractiveCard>
                <Link
                  href={concern.href}
                  className="lavender-card-accent group block h-full p-5 transition-all duration-250 hover:border-lavender/35 hover:shadow-md sm:p-6"
                  style={{ borderRadius: "2px" }}
                >
                  <h3 className="font-serif text-xl text-green transition-colors duration-250 group-hover:text-lavender-3 sm:text-2xl">
                    {concern.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text/85">{concern.description}</p>
                  <span className="mt-6 inline-block label-caps text-lavender-3 transition-transform duration-250 group-hover:translate-x-1 group-hover:text-lavender">
                    Explore →
                  </span>
                </Link>
              </InteractiveCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
