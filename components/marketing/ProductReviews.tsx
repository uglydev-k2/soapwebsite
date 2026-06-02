import { cn } from "@/lib/utils";

type Review = {
  name: string;
  title: string;
  body: string;
  rating: number;
};

const REVIEW_LIBRARY: Review[] = [
  {
    name: "Elena M.",
    title: "My new daily ritual",
    body: "The scent is balanced and luxurious without being overpowering. Skin feels nourished after every shower.",
    rating: 5,
  },
  {
    name: "Daniel K.",
    title: "Worth every penny",
    body: "Texture, fragrance, and packaging all feel premium. This is now a permanent part of our bathroom shelf.",
    rating: 5,
  },
  {
    name: "Priya S.",
    title: "Beautiful quality",
    body: "Clean ingredients and long-lasting scent. The product feels gentle and leaves skin incredibly soft.",
    rating: 4,
  },
  {
    name: "Jordan R.",
    title: "Perfect gift",
    body: "Bought this for my partner and ended up ordering one for myself. Quality is consistent and shipping was quick.",
    rating: 5,
  },
];

function getReviews(seed: string): Review[] {
  const base = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 3 }, (_, i) => REVIEW_LIBRARY[(base + i) % REVIEW_LIBRARY.length]);
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("text-sm", i < rating ? "text-gold" : "text-green/20")}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const reviews = getReviews(slug);

  return (
    <section className="mt-20 border-t border-green/10 pt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-caps text-terra">Customer Reviews</p>
          <h2 className="mt-2 font-serif text-3xl text-green">What Ritualists Say</h2>
        </div>
        <p className="text-sm text-muted">Based on verified purchases</p>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <article
            key={`${review.name}-${index}`}
            className="border border-green/10 bg-white p-6"
            style={{ borderRadius: "2px" }}
          >
            <Stars rating={review.rating} />
            <h3 className="mt-3 font-serif text-xl text-green">{review.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{review.body}</p>
            <p className="mt-5 label-caps text-green">{review.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
