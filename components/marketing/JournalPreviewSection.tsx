import Link from "next/link";
import { JOURNAL_POSTS } from "@/lib/content/journal";
import { AnimatedSectionHeader, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";

export default function JournalPreviewSection() {
  const posts = JOURNAL_POSTS.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-white to-lavender-light py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <AnimatedSectionHeader
          accent="lavender"
          eyebrow="The Journal"
          title="Rituals, Ingredients & Slow Living"
          description="Guides from our apothecary on building a bath routine that feels intentional."
        />
        <StaggerContainer className="mt-12 grid gap-6 lg:grid-cols-3" stagger={0.08}>
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <article
                className="lavender-card-accent group flex h-full flex-col p-8 transition-all hover:border-lavender/30 hover:shadow-md"
                style={{ borderRadius: "2px" }}
              >
                <span className="label-caps text-lavender-3">{post.category}</span>
                <h3 className="mt-3 font-serif text-2xl text-green group-hover:text-lavender-3">
                  <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text/85">
                  {post.excerpt}
                </p>
                <p className="mt-6 text-xs text-text/70">
                  {post.readMinutes} min read
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <div className="mt-10 text-center">
          <Link
            href="/journal"
            className="label-caps text-lavender-3 transition-colors hover:text-lavender"
          >
            Read the journal →
          </Link>
        </div>
      </div>
    </section>
  );
}
