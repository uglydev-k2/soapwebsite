export const FRAGRANCE_PROFILES = [
  {
    name: "Forest Cedar",
    slug: "forest-cedar",
    description:
      "Grounding notes of cedarwood, fir needle, and moss. Like a walk through an ancient forest.",
    notes: ["Cedarwood", "Fir Needle", "Oakmoss"],
    swatches: ["#2c4a3e", "#3d6454", "#6b5e52"],
    shopHref: "/collections?scent=cedar",
  },
  {
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    description:
      "Bright bergamot, neroli, and grapefruit zest. Uplifting and energizing for morning rituals.",
    notes: ["Bergamot", "Neroli", "Grapefruit"],
    swatches: ["#f5d76e", "#e8a838", "#c9a96e"],
    shopHref: "/collections?scent=citrus",
  },
  {
    name: "Warm Amber",
    slug: "warm-amber",
    description:
      "Rich amber resin, vanilla orchid, and sandalwood. Wraps you in warmth and comfort.",
    notes: ["Amber", "Vanilla", "Sandalwood"],
    swatches: ["#b5552a", "#c9a96e", "#8c3f1e"],
    shopHref: "/collections?scent=amber",
  },
  {
    name: "Lavender Mist",
    slug: "lavender-mist",
    description:
      "Soft lavender, chamomile, and white tea. Calming and serene for evening unwind.",
    notes: ["Lavender", "Chamomile", "White Tea"],
    swatches: ["#9b8ab8", "#c4b5d4", "#efe9df"],
    shopHref: "/collections?scent=lavender",
  },
] as const;
