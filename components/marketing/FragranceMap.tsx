import Link from "next/link";
import { cn } from "@/lib/utils";

const fragrances = [
  {
    name: "Forest Cedar",
    slug: "forest-cedar",
    description:
      "Grounding notes of cedarwood, fir needle, and moss. Like a walk through an ancient forest.",
    notes: ["Cedarwood", "Fir Needle", "Oakmoss"],
    swatches: ["#2c4a3e", "#3d6454", "#6b5e52"],
  },
  {
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    description:
      "Bright bergamot, neroli, and grapefruit zest. Uplifting and energizing for morning rituals.",
    notes: ["Bergamot", "Neroli", "Grapefruit"],
    swatches: ["#f5d76e", "#e8a838", "#c9a96e"],
  },
  {
    name: "Warm Amber",
    slug: "warm-amber",
    description:
      "Rich amber resin, vanilla orchid, and sandalwood. Wraps you in warmth and comfort.",
    notes: ["Amber", "Vanilla", "Sandalwood"],
    swatches: ["#b5552a", "#c9a96e", "#8c3f1e"],
  },
  {
    name: "Lavender Mist",
    slug: "lavender-mist",
    description:
      "Soft lavender, chamomile, and white tea. Calming and serene for evening unwind.",
    notes: ["Lavender", "Chamomile", "White Tea"],
    swatches: ["#9b8ab8", "#c4b5d4", "#efe9df"],
  },
];

export default function FragranceMap() {
  return (
    <section className="bg-cream-2 py-20 lg:py-28" id="scents">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="label-caps text-terra">Scent Profiles</span>
          <h2 className="mt-4 font-serif text-4xl font-light text-green lg:text-5xl">
            Find Your Signature Scent
          </h2>
          <p className="mt-4 text-muted">
            Each fragrance family is crafted to evoke a mood, a memory, a moment
            of pure botanical bliss.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {fragrances.map((fragrance) => (
            <Link
              key={fragrance.slug}
              href={`/shop?scent=${fragrance.slug}`}
              className={cn(
                "group relative overflow-hidden border border-green/10 bg-white p-8",
                "transition-all duration-300 hover:border-green/30 hover:shadow-lg"
              )}
              style={{ borderRadius: "2px" }}
            >
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {fragrance.swatches.map((color, i) => (
                      <span
                        key={color}
                        className="inline-block h-5 w-5 border border-white shadow-sm"
                        style={{
                          backgroundColor: color,
                          borderRadius: "2px",
                          zIndex: fragrance.swatches.length - i,
                        }}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <h3 className="font-serif text-2xl text-green transition-colors duration-250 group-hover:text-terra">
                    {fragrance.name}
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {fragrance.description}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {fragrance.notes.map((note) => (
                    <li
                      key={note}
                      className="label-caps border border-green/15 px-3 py-1 text-xs text-green"
                      style={{ borderRadius: "2px" }}
                    >
                      {note}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 inline-block label-caps text-green transition-colors duration-250 group-hover:text-terra">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
