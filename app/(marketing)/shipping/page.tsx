import { MarketingPage } from "@/components/marketing/MarketingPage";
import { SHIPPING_SECTIONS } from "@/lib/content/site-content";

export const metadata = { title: "Shipping & Returns — mvlusciouslather" };

export default function ShippingPage() {
  return (
    <MarketingPage
      eyebrow="Support"
      title="Shipping & Returns"
      description="Transparent policies for a calm shopping experience."
    >
      <div className="space-y-8">
        {SHIPPING_SECTIONS.map((section) => (
          <article
            key={section.title}
            className="border border-green/10 bg-white p-8"
            style={{ borderRadius: "2px" }}
          >
            <h2 className="font-serif text-2xl text-green">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}
      </div>
    </MarketingPage>
  );
}
