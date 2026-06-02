export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
  body: string[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "morning-ritual-guide",
    title: "Design a Morning Ritual That Actually Sticks",
    excerpt:
      "Small, sensory cues turn a rushed shower into a grounding start to your day.",
    category: "Ritual",
    readMinutes: 4,
    publishedAt: "2025-11-12",
    body: [
      "The best morning rituals are short enough to repeat and rich enough to feel intentional. Start with warm water, one breath, and a scent that signals 'awake' — citrus and green notes work beautifully.",
      "Layer texture intentionally: cleanse with a botanical wash or bar, pat dry without rubbing, then lock in moisture while skin is still dewy. This sequence takes under ten minutes but changes how the whole day feels.",
      "Keep your products visible. When your soap and lotion live within reach, consistency becomes effortless. Rotate scents seasonally so the ritual stays fresh without losing its structure.",
    ],
  },
  {
    slug: "reading-ingredient-labels",
    title: "How to Read Bath & Body Labels Like an Apothecary",
    excerpt:
      "What to look for — and what we leave out — when choosing clean botanical care.",
    category: "Ingredients",
    readMinutes: 5,
    publishedAt: "2025-10-28",
    body: [
      "A thoughtful label tells a story in order: base oils and butters first, then active botanicals, then fragrance. If the first ingredients are synthetic detergents, your skin may feel clean but stripped.",
      "We avoid parabens, sulfates, and synthetic dyes. Instead we use plant-derived cleansers, nourishing oils, and essential-oil-based scent profiles composed like fine fragrance.",
      "Fragrance can appear as essential oils, natural isolates, or 'parfum.' We list key notes on every product page so you know whether you're reaching for calm lavender or grounding cedar.",
    ],
  },
  {
    slug: "gift-rituals-that-feel-luxury",
    title: "Gift Rituals That Feel Luxurious (Without the Price Tag)",
    excerpt:
      "Presentation, scent, and pacing make botanical gifts unforgettable.",
    category: "Gifting",
    readMinutes: 3,
    publishedAt: "2025-12-02",
    body: [
      "A gift set works best when it tells a story: cleanse, treat, scent. Pair a bar or wash with lotion in the same fragrance family so the experience feels complete.",
      "Wrap with texture — kraft paper, dried botanicals, a handwritten note about why you chose this scent for them. The ritual begins before they open the box.",
      "For hosts and teachers, single hero products in seasonal scents feel personal without overwhelming. Add a sample vial so they can discover your favorite note.",
    ],
  },
  {
    slug: "evening-wind-down",
    title: "The Evening Wind-Down: Scent as a Sleep Cue",
    excerpt:
      "Lavender, chamomile, and warm amber can signal your nervous system that the day is done.",
    category: "Wellness",
    readMinutes: 4,
    publishedAt: "2026-01-15",
    body: [
      "Your brain learns through repetition. When the same scent appears at the end of each day, it becomes a reliable cue for rest — much like dimming the lights.",
      "Choose slower rituals at night: a longer soak or shower, slower drying, richer lotion. Avoid bright citrus notes before bed if you're sensitive to stimulation.",
      "Keep screens out of the bathroom when possible. Let scent, warm water, and touch be the only inputs for fifteen minutes. Your sleep quality may surprise you.",
    ],
  },
];

export function getJournalPost(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}
