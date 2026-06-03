export type IngredientEntry = {
  name: string;
  benefit: string;
  description: string;
  /** Match against product name, description, fragrance, and ingredients */
  keywords: readonly string[];
};

export const INGREDIENT_GLOSSARY: IngredientEntry[] = [
  {
    name: "Shea Butter",
    benefit: "Deep moisture",
    keywords: ["shea"],
    description:
      "Rich in vitamins A and E; softens skin and helps lock in hydration after cleansing.",
  },
  {
    name: "Mango Seed Butter",
    benefit: "Deep moisture",
    keywords: ["mango"],
    description:
      "Lightweight, non-greasy butter rich in antioxidants; nourishes dry skin without heaviness.",
  },
  {
    name: "Kokum Butter",
    benefit: "Deep moisture",
    keywords: ["kokum"],
    description:
      "Silky, fast-absorbing butter that melts on contact; helps restore softness without a greasy feel.",
  },
  {
    name: "Coconut Oil",
    benefit: "Gentle cleanse",
    keywords: ["coconut"],
    description:
      "Creates a creamy lather in bar soaps while supporting the skin barrier.",
  },
  {
    name: "Rosehip Oil",
    benefit: "Nourishing",
    keywords: ["rosehip"],
    description:
      "Cold-pressed and rich in vitamins A and C; supports a smooth, radiant complexion after cleansing.",
  },
  {
    name: "Hemp Seed Oil",
    benefit: "Nourishing",
    keywords: ["hemp"],
    description:
      "Lightweight oil rich in omega fatty acids; helps balance and comfort skin without clogging pores.",
  },
  {
    name: "Cedarwood Oil",
    benefit: "Essential oils",
    keywords: ["cedarwood", "cedar"],
    description:
      "Woody, calming aroma often used in evening rituals and forest-inspired blends.",
  },
  {
    name: "Lavender Oil",
    benefit: "Calming",
    keywords: ["lavender"],
    description:
      "Classic botanical for relaxation; pairs well with chamomile in wind-down routines.",
  },
  {
    name: "Bergamot",
    benefit: "Bright uplift",
    keywords: ["bergamot", "citrus"],
    description:
      "Citrus top note that adds sparkle to morning washes without harsh synthetic fragrance.",
  },
  {
    name: "Colloidal Oat",
    benefit: "Sensitive skin",
    keywords: ["oat", "colloidal"],
    description:
      "Soothes irritation and supports comfort for dry or reactive skin types.",
  },
];

export const SUSTAINABILITY_POINTS = [
  {
    title: "Small-batch production",
    body: "We pour, cut, and cure in limited runs so every product reaches you at peak freshness.",
  },
  {
    title: "Thoughtful packaging",
    body: "Recyclable boxes and minimal plastic. Gift sets use reusable wraps where possible.",
  },
  {
    title: "Ethical sourcing",
    body: "Botanical suppliers are vetted for quality and responsible harvesting practices.",
  },
  {
    title: "Clean formulas",
    body: "No parabens, sulfates, or synthetic dyes — only ingredients we'd use on our own skin.",
  },
] as const;
