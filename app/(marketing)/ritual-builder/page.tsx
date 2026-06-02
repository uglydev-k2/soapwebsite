import RitualBuilder from "@/components/marketing/RitualBuilder";

export const metadata = { title: "Ritual Builder — MsVee Soaps" };

export default function RitualBuilderPage() {
  return (
    <>
      <div className="bg-cream pt-32 pb-4 px-6 text-center">
        <p className="label-caps text-terra">Personalized</p>
        <h1 className="mt-2 font-serif text-4xl font-light text-green">Ritual Builder</h1>
      </div>
      <RitualBuilder />
    </>
  );
}
