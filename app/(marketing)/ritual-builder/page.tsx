import RitualBuilder from "@/components/marketing/RitualBuilder";

export const metadata = { title: "Ritual Builder — MsVee Soaps" };

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
