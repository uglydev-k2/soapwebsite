import Link from "next/link";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";
import { SUBSCRIPTION_CADENCES } from "@/lib/subscriptions";

const plans = SUBSCRIPTION_CADENCES.map((cadence) => ({
  title:
    cadence.id === "monthly"
      ? "Monthly Ritual Box"
      : cadence.id === "bimonthly"
        ? "Bi-Monthly Refresh"
        : "Seasonal Discovery",
  cadence: cadence.label,
  perks: cadence.description,
  href: `/collections?sort=featured&subscribe=${cadence.id}`,
}));

export default function SubscriptionSection() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="Save with Subscriptions"
          title="Build Your Ritual, Automatically"
          description="Choose a cadence that fits your lifestyle — 10% off every subscription box at checkout."
        />
        <StaggerContainer className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <StaggerItem key={plan.title}>
              <article className="h-full border border-green/10 bg-cream p-8" style={{ borderRadius: "2px" }}>
                <p className="label-caps text-terra">{plan.cadence}</p>
                <h3 className="mt-3 font-serif text-3xl text-green">{plan.title}</h3>
                <p className="mt-3 text-sm text-muted">{plan.perks}</p>
                <Link
                  href={plan.href}
                  className="mt-8 inline-flex items-center justify-center bg-terra px-6 py-3 text-xs label-caps text-white transition-colors duration-250 hover:bg-terra-2"
                  style={{ borderRadius: 0 }}
                >
                  Shop & Subscribe
                </Link>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <p className="mt-8 text-center text-sm text-muted">
          Add items to cart, then choose <strong>Subscribe</strong> at checkout. Square plan IDs must be configured in production.
        </p>
      </div>
    </section>
  );
}
