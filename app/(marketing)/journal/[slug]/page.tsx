import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPost, JOURNAL_POSTS } from "@/lib/content/journal";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ShopThisRitual } from "@/components/marketing/ShopThisRitual";

export function generateStaticParams() {
  return JOURNAL_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getJournalPost(params.slug);
  return { title: post ? `${post.title} — MsVee Journal` : "Journal" };
}

export default function JournalArticlePage({ params }: { params: { slug: string } }) {
  const post = getJournalPost(params.slug);
  if (!post) notFound();

  return (
    <article className="marketing-header-offset min-h-screen bg-cream px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: post.title },
          ]}
        />
        <span className="label-caps text-terra">{post.category}</span>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-green md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-muted">
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {post.readMinutes} min read
        </p>
        <div className="mt-10 space-y-6 text-muted leading-relaxed">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        {post.shopSlugs && post.shopSlugs.length > 0 && (
          <ShopThisRitual productSlugs={post.shopSlugs} />
        )}
        <Link
          href="/journal"
          className="mt-12 inline-block label-caps text-green hover:text-terra"
        >
          ← Back to journal
        </Link>
      </div>
    </article>
  );
}
