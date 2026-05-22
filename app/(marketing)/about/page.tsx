export const metadata = {
  title: "About — MsVee Soaps",
};

export default function AboutPage() {
  return (
    <section className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <p className="label-caps text-terra mb-4">Our Story</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-green tracking-wide mb-8">
          Crafted with Intention
        </h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            MsVee Soaps was born from a simple belief: daily rituals deserve the same care and
            attention as special occasions. Every bar, bottle, and balm in our collection is
            hand-crafted in small batches using botanical extracts, essential oils, and clean
            formulations your skin will love.
          </p>
          <p>
            Founded in 2024, we draw inspiration from apothecary traditions and the quiet beauty
            of the natural world. Our scents are composed like fine fragrance — layered, balanced,
            and designed to transform an ordinary moment into something sacred.
          </p>
          <p>
            We never use parabens, sulfates, or synthetic dyes. Every ingredient is chosen for its
            benefit to skin and spirit. From forest cedar to warm amber, each scent profile tells
            a story — and invites you to write your own.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-green/10 pt-12">
          {[
            { label: "Ingredients", value: "48+" },
            { label: "Scent Profiles", value: "6" },
            { label: "Clean", value: "100%" },
            { label: "Est.", value: "2024" },
          ].map((stat) => (
            <div key={stat.label} className="border-l-2 border-gold pl-4">
              <p className="font-serif text-3xl text-green">{stat.value}</p>
              <p className="label-caps text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
