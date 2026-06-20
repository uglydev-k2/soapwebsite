import { cn } from "@/lib/utils";
import { getApprovedReviews } from "@/lib/reviews";
import { ReviewSubmitForm } from "@/components/marketing/ReviewSubmitForm";

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

export default async function ProductReviews({ slug }: { slug: string }) {
  const reviews = await getApprovedReviews(slug);

  return (
    <section className="mt-20 border-t border-green/10 pt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-caps text-terra">Customer Reviews</p>
          <h2 className="mt-2 font-serif text-3xl text-green">What Ritualists Say</h2>
        </div>
        <p className="text-sm text-muted">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {reviews.slice(0, 6).map((review) => (
          <article
            key={review.id}
            className="border border-green/10 bg-white p-6"
            style={{ borderRadius: "2px" }}
          >
            <Stars rating={review.rating} />
            <h3 className="mt-3 font-serif text-xl text-green">{review.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{review.body}</p>
            <p className="mt-5 label-caps text-green">{review.authorName}</p>
          </article>
        ))}
      </div>
      <ReviewSubmitForm productSlug={slug} />
    </section>
  );
}
