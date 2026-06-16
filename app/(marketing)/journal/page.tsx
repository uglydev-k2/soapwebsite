import Link from "next/link";
import { MarketingPage } from "@/components/marketing/MarketingPage";
import { JOURNAL_POSTS } from "@/lib/content/journal";

export const metadata = { title: "Journal — mvlusciouslather" };

export default function JournalPage() {
  return (
    <MarketingPage
      eyebrow="The Journal"
      title="Rituals, Ingredients & Slow Living"
      description="Apothecary notes on building a bath routine that feels intentional."
      wide
    >
      <ul className="grid gap-6 lg:grid-cols-2">
        {JOURNAL_POSTS.map((post) => (
          <li key={post.slug}>
            <article
              className="group h-full border border-green/10 bg-white p-8 transition-shadow hover:shadow-md"
              style={{ borderRadius: "2px" }}
            >
              <span className="label-caps text-terra">{post.category}</span>
              <h2 className="mt-3 font-serif text-2xl text-green group-hover:text-terra">
                <Link href={`/journal/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <p className="mt-6 text-xs text-muted">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {post.readMinutes} min read
              </p>
            </article>
          </li>
        ))}
      </ul>
    </MarketingPage>
  );
}
