import { MarketingPage } from "@/components/marketing/MarketingPage";
import { getShippingSections } from "@/lib/content/site-content";
import { getPublicStoreSettings } from "@/lib/store-settings";

export const metadata = { title: "Shipping & Returns — mvlusciouslather" };

export default async function ShippingPage() {
  const settings = await getPublicStoreSettings();

  return (
    <MarketingPage
      eyebrow="Support"
      title="Shipping & Returns"
      description="Transparent policies for a calm shopping experience."
    >
      <div className="space-y-8">
        {getShippingSections(settings).map((section) => (
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
