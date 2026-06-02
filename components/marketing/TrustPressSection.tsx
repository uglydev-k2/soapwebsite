import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";

const badges = [
  "Cruelty-Free",
  "Small Batch",
  "Handcrafted in USA",
  "Paraben-Free",
  "Eco-Conscious Packaging",
];

const press = ["Vogue Living", "The Ritual Edit", "Botanical Review", "Clean Beauty Daily"];

export default function TrustPressSection() {
  return (
    <section className="border-y border-green/10 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Trusted Ritual"
          title="Loved by Conscious Bathers"
          description="Editor favorites and clean-beauty community picks."
        />
        <StaggerContainer className="mt-10 flex flex-wrap justify-center gap-3" stagger={0.05}>
          {badges.map((badge) => (
            <StaggerItem key={badge}>
              <span
                className="inline-block border border-green/15 bg-cream px-4 py-2 text-xs uppercase tracking-[0.14em] text-green"
                style={{ borderRadius: "2px" }}
              >
                {badge}
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <p className="mt-12 text-center label-caps text-muted">As seen in</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {press.map((name) => (
            <li
              key={name}
              className="font-serif text-base text-green/40 transition-colors hover:text-green/70 sm:text-xl"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
