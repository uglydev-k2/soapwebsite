import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";
import { INGREDIENT_GLOSSARY } from "@/lib/content/ingredients";

export const metadata = { title: "Ingredients — MsVee Soaps" };

export default function IngredientsPage() {
  return (
    <MarketingPage
      eyebrow="Transparency"
      title="Ingredient Glossary"
      description="The botanicals and bases we reach for — and why your skin loves them."
      wide
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INGREDIENT_GLOSSARY.map((item) => (
          <li
            key={item.name}
            className="border border-green/10 bg-white p-6"
            style={{ borderRadius: "2px" }}
          >
            <p className="label-caps text-terra">{item.benefit}</p>
            <h2 className="mt-2 font-serif text-xl text-green">{item.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-12 text-center text-sm text-muted">
        Every product page lists full ingredients. Questions?{" "}
        <Link href="/contact" className="text-green hover:text-terra">
          Contact us
        </Link>
        .
      </p>
    </MarketingPage>
  );
}
