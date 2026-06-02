import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";
import { FRAGRANCE_PROFILES } from "@/lib/content/fragrances";

export const metadata = { title: "Scent Guide — MsVee Soaps" };

export default function ScentsPage() {
  return (
    <MarketingPage
      eyebrow="Fragrance"
      title="Scent Guide"
      description="Explore our signature fragrance families — each composed like fine perfume, designed for ritual."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {FRAGRANCE_PROFILES.map((fragrance) => (
          <article
            key={fragrance.slug}
            className="border border-green/10 bg-white p-8"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex gap-2">
              {fragrance.swatches.map((color) => (
                <span
                  key={color}
                  className="h-8 w-8 border border-green/10"
                  style={{ backgroundColor: color, borderRadius: "2px" }}
                  aria-hidden
                />
              ))}
            </div>
            <h2 className="mt-6 font-serif text-3xl text-green">{fragrance.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {fragrance.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {fragrance.notes.map((note) => (
                <li
                  key={note}
                  className="border border-green/15 px-3 py-1 text-xs uppercase tracking-wider text-green"
                  style={{ borderRadius: "2px" }}
                >
                  {note}
                </li>
              ))}
            </ul>
            <Link
              href={fragrance.shopHref}
              className="mt-6 inline-block label-caps text-terra hover:text-terra-2"
            >
              Shop {fragrance.name} →
            </Link>
          </article>
        ))}
      </div>
    </MarketingPage>
  );
}
