import Link from "next/link";
import { JOURNAL_POSTS } from "@/lib/content/journal";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";

export default function JournalPreviewSection() {
  const posts = JOURNAL_POSTS.slice(0, 3);

  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          eyebrow="The Journal"
          title="Rituals, Ingredients & Slow Living"
          description="Guides from our apothecary on building a bath routine that feels intentional."
        />
        <StaggerContainer className="mt-12 grid gap-6 lg:grid-cols-3" stagger={0.08}>
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <article
                className="group flex h-full flex-col border border-green/10 bg-white p-8 transition-shadow hover:shadow-md"
                style={{ borderRadius: "2px" }}
              >
                <span className="label-caps text-terra">{post.category}</span>
                <h3 className="mt-3 font-serif text-2xl text-green group-hover:text-terra">
                  <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <p className="mt-6 text-xs text-muted">
                  {post.readMinutes} min read
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <div className="mt-10 text-center">
          <Link
            href="/journal"
            className="label-caps text-green transition-colors hover:text-terra"
          >
            Read the journal →
          </Link>
        </div>
      </div>
    </section>
  );
}
