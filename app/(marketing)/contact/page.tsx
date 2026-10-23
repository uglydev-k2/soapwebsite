import { MarketingPage } from "@/components/marketing/MarketingPage";
import { ContactForm } from "@/components/marketing/ContactForm";
import { RetailLocationCard } from "@/components/marketing/RetailLocationCard";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/contact", {
  title: brandTitle("Contact"),
  description:
    "Visit us at The Collective Boutique, Cinco Ranch (G9), Katy TX — or email about orders, wholesale, and scents.",
});

export default function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Support"
      title="Get in Touch"
      description="Questions about an order, wholesale, or finding your perfect scent? We would love to hear from you."
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <RetailLocationCard />
          <div className="border border-green/10 bg-white p-6" style={{ borderRadius: "2px" }}>
            <p className="label-caps text-muted">Email</p>
            <a
              href="mailto:hello@mvlusciouslather.com"
              className="mt-2 block font-serif text-xl text-green hover:text-terra"
            >
              hello@mvlusciouslather.com
            </a>
          </div>
          <p className="text-sm text-muted">
            We respond within 1–2 business days. For order issues, include your order number.
          </p>
        </div>
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </MarketingPage>
  );
}
