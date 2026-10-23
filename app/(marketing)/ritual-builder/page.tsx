import RitualBuilder from "@/components/marketing/RitualBuilder";
import { brandTitle } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("/ritual-builder", {
  title: brandTitle("Ritual Builder"),
  description:
    "Build a personalized botanical bath ritual with soaps, scrubs, and body care matched to your preferences.",
});

export default function RitualBuilderPage() {
  return (
    <>
      <div className="marketing-header-offset bg-cream px-4 pb-4 text-center sm:px-6">
        <p className="label-caps text-terra">Personalized</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-green">Ritual Builder</h1>
      </div>
      <RitualBuilder />
    </>
  );
}
