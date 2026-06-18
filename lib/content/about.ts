export const ABOUT_HERO = {
  image: "/images/hero-collection-soaps.jpg",
  imageAlt: "Handcrafted botanical soaps from MV Luscious Lather",
  eyebrow: "Our Story",
  title: "Where Every Bar Begins with Intention",
  description:
    "MV Luscious Lather is a small-batch apothecary rooted in botanical care. We make bath and body products the slow way — by hand, in limited runs, with ingredients chosen for how they feel on skin and how they transform an ordinary routine into a ritual.",
};

export const ABOUT_ORIGIN = {
  title: "From a Kitchen Table to a Full Ritual",
  paragraphs: [
    "What started as a personal search for gentle, fragrance-rich soaps without harsh additives grew into something we had to share. Friends asked for bars. Then neighbors. Then customers across the country who wanted the same thing we did: products that feel luxurious, honest, and made by real hands.",
    "Today, every formula still begins the same way — with a question about how a scent, oil, or botanical can support the skin and calm the mind. We are not chasing mass production. We are building a brand people trust to show up in their daily self-care.",
  ],
  image: "/images/hero-soaps.jpg",
  imageAlt: "Assorted artisan soap bars on a linen surface",
};

export const CRAFT_PROCESS = [
  {
    step: "01",
    title: "Source with Care",
    body: "We select plant oils, butters, clays, and botanical extracts from suppliers we trust. Shea butter, coconut oil, colloidal oat, essential oils, and fragrance blends are chosen for performance — and for how they wear on sensitive skin.",
    image: "/images/products/botanical-swirl-bar.jpg",
    imageAlt: "Botanical swirl artisan soap bar",
  },
  {
    step: "02",
    title: "Formulate in Small Batches",
    body: "Each recipe is balanced for cleansing, moisture, and scent throw. Bars, scrubs, lotions, and butters are mixed in limited quantities so every batch gets attention. No conveyor belts — just measured ingredients, patience, and craft.",
    image: "/images/products/oat-honey-bar.jpg",
    imageAlt: "Oat and honey comfort soap bar",
  },
  {
    step: "03",
    title: "Pour, Set & Cure",
    body: "Soap is hand-poured into molds, then left to cure so the bar hardens and the lather becomes silky. Curing is not rushed. It is part of why our bars last longer and feel gentler from the first use.",
    image: "/images/products/blush-rose-bar.jpg",
    imageAlt: "Blush rose artisan soap bar",
  },
  {
    step: "04",
    title: "Finish, Inspect & Pack",
    body: "Every piece is trimmed, checked, and packed by hand. We look for consistency in weight, appearance, and scent before anything leaves the studio. Your order is wrapped with the same care we put into making it.",
    image: "/images/hero-soaps.jpg",
    imageAlt: "Finished soap collection ready to ship",
  },
] as const;

export const ABOUT_PROMISE = {
  title: "What You Can Expect in Every Product",
  points: [
    {
      title: "Handcrafted, not factory-made",
      body: "Small batches mean fresher product and formulas we can refine as we learn from our community.",
    },
    {
      title: "Botanical-first formulas",
      body: "We lean on oils, butters, clays, and plant extracts — not fillers that strip or irritate.",
    },
    {
      title: "Scent with purpose",
      body: "From lavender and sage to spearmint and eucalyptus, each fragrance is chosen to set a mood, not overwhelm it.",
    },
    {
      title: "Made to be used daily",
      body: "Our products are designed for real routines — morning showers, evening soaks, and everything in between.",
    },
  ],
};

export const ABOUT_MILESTONES = [
  { year: "2020", label: "Our first handcrafted bar soaps — where MV Luscious Lather began" },
  { year: "2025", label: "Bath & body collection expands — scrubs, lotions, butters, and gift rituals" },
  { year: "2026", label: "Growing nationwide community of customers who shop small-batch botanical care" },
] as const;

export const ABOUT_STATS = [
  { label: "Botanical Ingredients", value: "48+" },
  { label: "Scent Families", value: "6+" },
  { label: "Handcrafted", value: "100%" },
  { label: "Est.", value: "2020" },
] as const;
