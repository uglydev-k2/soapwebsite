import { MarketingPage } from "@/components/marketing/MarketingPage";
import { SUSTAINABILITY_POINTS } from "@/lib/content/ingredients";

export const metadata = { title: "Sustainability — mvlusciouslather" };

export default function SustainabilityPage() {
  return (
    <MarketingPage
      eyebrow="Our Promise"
      title="Sustainability & Craft"
      description="How we source, produce, and package with the planet and your skin in mind."
    >
      <div className="space-y-6">
        {SUSTAINABILITY_POINTS.map((point) => (
          <article
            key={point.title}
            className="border border-green/10 bg-white p-8"
            style={{ borderRadius: "2px" }}
          >
            <h2 className="font-serif text-2xl text-green">{point.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{point.body}</p>
          </article>
        ))}
      </div>
    </MarketingPage>
  );
}
