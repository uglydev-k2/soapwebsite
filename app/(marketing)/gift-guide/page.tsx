import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";
import { GIFT_GUIDE_SECTIONS } from "@/lib/content/site-content";

export const metadata = { title: "Gift Guide — MsVee Soaps" };

export default function GiftGuidePage() {
  return (
    <MarketingPage
      eyebrow="Gifting"
      title="The MsVee Gift Guide"
      description="Curated botanical rituals for every person and every moment."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {GIFT_GUIDE_SECTIONS.map((section) => (
          <article
            key={section.title}
            className="group flex h-full flex-col border border-green/10 bg-white p-8 transition-shadow duration-300 hover:shadow-md"
            style={{ borderRadius: "2px" }}
          >
            <h2 className="font-serif text-2xl text-green group-hover:text-terra">
              {section.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              {section.description}
            </p>
            <Link
              href={section.href}
              className="mt-6 inline-block label-caps text-green transition-colors hover:text-terra"
            >
              {section.cta} →
            </Link>
          </article>
        ))}
      </div>
    </MarketingPage>
  );
}
