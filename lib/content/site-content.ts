export const FAQ_ITEMS = [
  {
    question: "Are your products truly natural?",
    answer:
      "Yes. We formulate without parabens, sulfates, phthalates, or synthetic dyes. Every ingredient is chosen for skin benefit and scent integrity.",
  },
  {
    question: "How long do bar soaps last?",
    answer:
      "With proper drainage, a single bar typically lasts 3–4 weeks of daily use. Keep your soap dry between uses to maximize longevity.",
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "Orders over $60 qualify for free standard shipping within the continental United States. A flat $8 rate applies to smaller orders.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Unopened items may be returned within 30 days of delivery. Opened bath products cannot be resold for hygiene reasons — contact us if something arrives damaged.",
  },
  {
    question: "Are your products safe for sensitive skin?",
    answer:
      "Many customers with sensitive skin love our Lavender Mist and gentle milk-based formulas. We recommend patch testing any new product before full use.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "No. We ship to United States addresses only, including Alaska, Hawaii, and U.S. territories where carriers deliver.",
  },
] as const;

export const SHIPPING_SECTIONS = [
  {
    title: "Processing",
    body: "Orders are handcrafted and packed within 1–3 business days. You will receive a confirmation email when your order ships.",
  },
  {
    title: "Rates",
    body: "Standard shipping is $8 flat rate. Orders over $60 ship free within the continental United States.",
  },
  {
    title: "Returns",
    body: "Unopened products may be returned within 30 days for a full refund. Damaged or incorrect items will be replaced at no charge — email hello@mvlusciouslather.com with your order number.",
  },
  {
    title: "Exchanges",
    body: "We are happy to help with scent or product exchanges on unopened items. Reach out within 14 days of delivery and we will guide you through the process.",
  },
] as const;

export const GIFT_GUIDE_SECTIONS = [
  {
    title: "For the Ritual Lover",
    description: "Complete bath sets and body washes for someone who treats self-care as sacred.",
    href: "/collections/category/gift-set",
    cta: "Shop gift sets",
  },
  {
    title: "For Sensitive Skin",
    description: "Gentle lavender and chamomile profiles without harsh additives.",
    href: "/collections?scent=lavender&sort=featured",
    cta: "Shop gentle scents",
  },
  {
    title: "For Him",
    description: "Woody cedar and fresh mint profiles with rich, lasting lather.",
    href: "/collections?scent=cedar&sort=featured",
    cta: "Shop men's picks",
  },
  {
    title: "Under $30",
    description: "Thoughtful botanical gifts that feel luxurious without the splurge.",
    href: "/collections?sort=price-asc",
    cta: "Shop affordable rituals",
  },
] as const;

export const SCENT_FINDER_OPTIONS = {
  mood: [
    { label: "Calm & unwind", value: "lavender", href: "/collections?scent=lavender" },
    { label: "Grounded & earthy", value: "cedar", href: "/collections?scent=cedar" },
    { label: "Bright & uplifting", value: "citrus", href: "/collections?scent=citrus" },
    { label: "Warm & cozy", value: "amber", href: "/collections?scent=amber" },
  ],
  format: [
    { label: "Bar Soap", value: "BAR_SOAP", href: "/collections/category/bar-soap" },
    {
      label: "Bath & Body Products",
      value: "BATH_BODY",
      href: "/collections/category/bath-body",
    },
    { label: "Candles", value: "CANDLES", href: "/collections/category/candles" },
    {
      label: "Accessories",
      value: "ACCESSORIES",
      href: "/collections/category/accessories",
    },
    { label: "Gift Set", value: "GIFT_SET", href: "/collections/category/gift-set" },
  ],
} as const;
