import type { ProductWithMeta } from "@/types";

/** Homepage featured order — hero bar soaps first, then gift set */
export const FEATURED_PRODUCT_SLUGS = [
  "blush-rose-artisan-bar",
  "botanical-swirl-bar",
  "oat-honey-comfort-bar",
  "full-ritual-gift-set",
] as const;

/** Static catalog — homepage works without a database */
export const STATIC_PRODUCTS: ProductWithMeta[] = [
  {
    id: "static-soap-1",
    name: "Blush Rose Artisan Bar",
    slug: "blush-rose-artisan-bar",
    description:
      "A hand-poured bar with soft rose clay and creamy coconut lather. Gentle enough for daily use, luxurious enough for evening ritual.",
    price: 16,
    comparePrice: null,
    category: "SOAP",
    stock: 52,
    images: ["/images/products/blush-rose-bar.jpg"],
    ingredients:
      "Saponified coconut & olive oils, rose kaolin clay, shea butter, geranium & rose absolute",
    fragrance: "Soft Rose & Petal",
    featured: true,
    active: true,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "static-soap-2",
    name: "Botanical Swirl Bar",
    slug: "botanical-swirl-bar",
    description:
      "Marbled sage and deep blue swirls over a sunny botanical base. Small-batch poured for a rich, silky cleanse with forest-fresh scent.",
    price: 18,
    comparePrice: null,
    category: "SOAP",
    stock: 38,
    images: ["/images/products/botanical-swirl-bar.jpg"],
    ingredients:
      "Coconut oil, olive oil, spirulina & indigo botanicals, eucalyptus & cedarwood essential oils",
    fragrance: "Forest & Eucalyptus",
    featured: true,
    active: true,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "static-soap-3",
    name: "Oat & Honey Comfort Bar",
    slug: "oat-honey-comfort-bar",
    description:
      "Warm caramel tones with colloidal oat and raw honey for skin that feels nourished, never tight. Our go-to for sensitive or dry skin.",
    price: 15,
    comparePrice: null,
    category: "SOAP",
    stock: 44,
    images: ["/images/products/oat-honey-bar.jpg"],
    ingredients:
      "Colloidal oat, raw honey, coconut oil, shea butter, chamomile extract",
    fragrance: "Oat, Honey & Chamomile",
    featured: true,
    active: true,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "static-4",
    name: "The Full Ritual Gift Set",
    slug: "full-ritual-gift-set",
    description:
      "Three signature bars plus body wash and lotion in a hand-wrapped gift box — everything to start (or share) a complete MsVee ritual.",
    price: 89,
    comparePrice: 110,
    category: "GIFT_SET",
    stock: 12,
    images: ["/images/hero-soaps.jpg"],
    ingredients:
      "Includes Blush Rose, Botanical Swirl, and Oat & Honey bars plus cedar body wash and amber lotion",
    fragrance: "Curated Ritual",
    featured: true,
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "static-1",
    name: "Forest Cedar Body Wash",
    slug: "forest-cedar-body-wash",
    description:
      "A grounding botanical wash with cedarwood, pine needle, and wild moss. Cleanses deeply without stripping your skin barrier.",
    price: 28,
    comparePrice: null,
    category: "BODY_WASH",
    stock: 45,
    images: [],
    ingredients:
      "Coconut-derived surfactants, hemp seed oil, cedarwood essential oil, pine needle extract, glycerin",
    fragrance: "Forest & Cedar",
    featured: false,
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "static-3",
    name: "Warm Amber Body Lotion",
    slug: "warm-amber-body-lotion",
    description:
      "Silky hydration with amber resin, vanilla orchid, and shea butter. Absorbs quickly and leaves a soft, healthy glow.",
    price: 34,
    comparePrice: null,
    category: "LOTION",
    stock: 31,
    images: [],
    ingredients:
      "Shea butter, rosehip oil, kokum butter, amber resin, vitamin E",
    fragrance: "Warm Amber",
    featured: false,
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "static-2",
    name: "Citrus Bloom Bar Soap (3-pack)",
    slug: "citrus-bloom-bar-soap",
    description:
      "Bright, sun-kissed citrus layered with neroli and white florals. Three bars per set — perfect for guest baths or gifting.",
    price: 22,
    comparePrice: null,
    category: "SOAP",
    stock: 8,
    images: [],
    ingredients:
      "Coconut oil, bergamot essential oil, neroli, mango seed butter, olive oil",
    fragrance: "Citrus Bloom",
    featured: false,
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "static-7",
    name: "Rosehip Renewal Bar Soap",
    slug: "rosehip-renewal-bar-soap",
    description:
      "Nourishing bar with rosehip and mango seed butter for a silky, radiant cleanse. A floral favorite beyond our hero trio.",
    price: 14,
    comparePrice: null,
    category: "SOAP",
    stock: 40,
    images: [],
    ingredients:
      "Rosehip oil, mango seed butter, coconut oil, kokum butter, olive oil",
    fragrance: "Soft Floral",
    featured: false,
    active: true,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2024-08-01"),
  },
  {
    id: "static-5",
    name: "Lavender Oat Sugar Scrub",
    slug: "lavender-oat-sugar-scrub",
    description:
      "Gentle exfoliation with colloidal oat and calming lavender. Polishes away dullness while comforting stressed skin.",
    price: 26,
    comparePrice: null,
    category: "SCRUB",
    stock: 20,
    images: [],
    ingredients:
      "Colloidal oat, coconut oil, lavender essential oil, raw sugar, shea butter",
    fragrance: "Lavender & Oat",
    featured: false,
    active: true,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "static-6",
    name: "Cedarwood Calm Roll-On",
    slug: "cedarwood-calm-roll-on",
    description:
      "A pocket-sized aromatherapy blend for wrists and pulse points — cedar and lavender to unwind before sleep or travel.",
    price: 18,
    comparePrice: null,
    category: "AROMATHERAPY",
    stock: 35,
    images: [],
    ingredients:
      "Cedarwood essential oil, lavender essential oil, hemp seed oil, jojoba",
    fragrance: "Forest & Lavender",
    featured: false,
    active: true,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
];

export const STATIC_FEATURED = FEATURED_PRODUCT_SLUGS.map((slug) =>
  STATIC_PRODUCTS.find((p) => p.slug === slug)
).filter((p): p is ProductWithMeta => p != null);
