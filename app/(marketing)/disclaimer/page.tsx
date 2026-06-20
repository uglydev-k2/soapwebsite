import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";
import { PRODUCT_DISCLAIMER_SECTIONS } from "@/lib/content/disclaimer";

export const metadata = { title: "Product Disclaimer — mvlusciouslather" };

export default function DisclaimerPage() {
  return (
    <MarketingPage
      eyebrow="Legal"
      title="Product Disclaimer"
      description="Please read before purchasing or using MV Luscious Lather products."
    >
      <div className="space-y-8">
        {PRODUCT_DISCLAIMER_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="border border-green/10 bg-white p-6"
            style={{ borderRadius: "2px" }}
          >
            <h2 className="font-serif text-xl text-green">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{section.body}</p>
          </div>
        ))}
        <p className="text-sm text-muted">
          Questions?{" "}
          <Link href="/contact" className="text-green hover:text-terra">
            Contact us
          </Link>{" "}
          or email{" "}
          <a
            href="mailto:hello@mvlusciouslather.com"
            className="text-green hover:text-terra"
          >
            hello@mvlusciouslather.com
          </a>
          .
        </p>
      </div>
    </MarketingPage>
  );
}
