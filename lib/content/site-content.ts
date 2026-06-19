import type { PublicStoreSettings } from "@/lib/store-settings";
import { formatPrice } from "@/lib/utils";

export function getFaqItems(settings: PublicStoreSettings) {
  return [
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
      question: "How much is shipping?",
      answer: `U.S. orders ship via USPS Ground Advantage. Shipping is free on domestic orders of ${formatPrice(settings.freeShippingThreshold)} or more. Below that, rates are calculated at checkout based on package weight and destination.`,
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
        "Yes. We ship to select countries via USPS international rates calculated at checkout based on weight and destination.",
    },
  ] as const;
}

export function getShippingSections() {
  return [
    {
      title: "Processing",
      body: "Orders are handcrafted and packed within 1–3 business days. You will receive a confirmation email when your order ships.",
    },
    {
      title: "Rates",
      body: `U.S. standard shipping is calculated at checkout via USPS Ground Advantage based on weight and destination. International rates are calculated at checkout.`,
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
}

/** @deprecated Use getFaqItems(settings) for accurate shipping copy. */
export const FAQ_ITEMS = getFaqItems({
  flatShippingRate: 8,
  freeShippingThreshold: 75,
});

/** @deprecated Use getShippingSections() for accurate shipping copy. */
export const SHIPPING_SECTIONS = getShippingSections();

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
    href: "/collections?concern=sensitive&sort=featured",
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