import Image from "next/image";
import Link from "next/link";
import {
  ABOUT_HERO,
  ABOUT_MILESTONES,
  ABOUT_ORIGIN,
  ABOUT_PROMISE,
  ABOUT_STATS,
  CRAFT_PROCESS,
} from "@/lib/content/about";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export function AboutStory() {
  return (
    <div className="space-y-20 sm:space-y-28">
      <div className="relative overflow-hidden border border-green/10 bg-white" style={{ borderRadius: "2px" }}>
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src={ABOUT_HERO.image}
            alt={ABOUT_HERO.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1152px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green/80 via-green/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="label-caps text-gold">{ABOUT_HERO.eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl text-white sm:text-4xl">
              {ABOUT_HERO.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              {ABOUT_HERO.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="label-caps text-terra">The Beginning</p>
          <h2 className="mt-3 font-serif text-3xl text-green sm:text-4xl">
            {ABOUT_ORIGIN.title}
          </h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            {ABOUT_ORIGIN.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden border border-green/10 bg-stone-100" style={{ borderRadius: "2px" }}>
          <Image
            src={ABOUT_ORIGIN.image}
            alt={ABOUT_ORIGIN.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <div>
        <p className="label-caps text-terra">How It&apos;s Made</p>
        <h2 className="mt-3 font-serif text-3xl text-green sm:text-4xl">
          Small-Batch from Start to Finish
        </h2>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          Every {BRAND_DISPLAY_NAME} product moves through the same careful process.
          Here is how your bar, scrub, or butter is made before it reaches your door.
        </p>

        <div className="mt-12 space-y-16">
          {CRAFT_PROCESS.map((step, index) => (
            <article
              key={step.step}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-green/10 bg-stone-100" style={{ borderRadius: "2px" }}>
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <span className="font-serif text-4xl text-gold">{step.step}</span>
                <h3 className="mt-2 font-serif text-2xl text-green">{step.title}</h3>
                <p className="mt-4 text-muted leading-relaxed">{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="border border-green/10 bg-white p-8 sm:p-12" style={{ borderRadius: "2px" }}>
        <p className="label-caps text-terra">Our Promise</p>
        <h2 className="mt-3 font-serif text-3xl text-green">{ABOUT_PROMISE.title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ABOUT_PROMISE.points.map((point) => (
            <div key={point.title} className="border-l-2 border-gold pl-5">
              <h3 className="font-serif text-xl text-green">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{point.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 border-t border-green/10 pt-12">
        <p className="label-caps text-terra">Our Journey</p>
        {ABOUT_MILESTONES.map((item) => (
          <div key={item.year} className="flex gap-6 border-l-2 border-gold pl-6 sm:gap-8">
            <span className="shrink-0 font-serif text-2xl text-terra">{item.year}</span>
            <p className="pt-1 text-green">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-green/10 pt-12 md:grid-cols-4">
        {ABOUT_STATS.map((stat) => (
          <div key={stat.label} className="border-l-2 border-gold pl-4">
            <p className="font-serif text-3xl text-green">{stat.value}</p>
            <p className="label-caps mt-1 text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-4 border-t border-green/10 pt-12 sm:flex-row sm:flex-wrap sm:gap-6">
        <Link href="/collections" className="label-caps text-green hover:text-terra">
          Shop the collection →
        </Link>
        <Link href="/ingredients" className="label-caps text-green hover:text-terra">
          Ingredient glossary →
        </Link>
        <Link href="/sustainability" className="label-caps text-green hover:text-terra">
          Sustainability →
        </Link>
        <Link href="/journal" className="label-caps text-green hover:text-terra">
          Read the journal →
        </Link>
      </div>
    </div>
  );
}
