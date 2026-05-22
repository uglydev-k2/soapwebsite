import { cn } from "@/lib/utils";

const stats = [
  { value: "12K+", label: "Happy Ritualists" },
  { value: "48", label: "Botanical Scents" },
  { value: "100%", label: "Handcrafted" },
  { value: "4.9", label: "Average Rating" },
];

const steps = [
  {
    number: "01",
    title: "Prepare",
    description:
      "Draw warm water and set your intention. Light a candle, play soft music, breathe deeply.",
  },
  {
    number: "02",
    title: "Cleanse",
    description:
      "Work our botanical formula into rich lather. Let the natural oils nourish your skin.",
  },
  {
    number: "03",
    title: "Restore",
    description:
      "Rinse slowly, pat dry with intention. Follow with lotion to lock in moisture and scent.",
  },
];

export default function RitualSection() {
  return (
    <section
      className="relative overflow-hidden bg-green py-20 lg:py-28"
      id="ritual"
    >
      <div className="ritual-rings pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left column — intro & stats */}
          <div>
            <span className="label-caps text-gold">The MsVee Ritual</span>
            <h2 className="mt-4 font-serif text-4xl font-light text-cream lg:text-5xl">
              More Than a Bath —
              <br />
              a Daily Ceremony
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-cream/70">
              We designed every product to transform an ordinary routine into a
              mindful practice. Three simple steps to reconnect with yourself.
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-serif text-3xl text-gold lg:text-4xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 label-caps text-cream/60">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right column — ritual step cards */}
          <div className="grid gap-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className={cn(
                  "group border border-gold/15 bg-green-3/30 p-8",
                  "transition-all duration-300 hover:border-gold/30 hover:bg-green-3/50"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className="label-caps text-gold">{step.number}</span>
                <h3 className="mt-3 font-serif text-2xl text-cream transition-colors duration-250 group-hover:text-gold">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
