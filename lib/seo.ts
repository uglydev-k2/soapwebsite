import type { Metadata } from "next";
import type { Product } from "@prisma/client";
import {
  BRAND_DISPLAY_NAME,
  BRAND_EMAIL,
  BRAND_SITE_URL,
  BRAND_TAGLINE,
  brandTitle,
} from "@/lib/brand";
import { socialProfileUrls } from "@/lib/social";
const DEFAULT_OG_IMAGE = `${BRAND_SITE_URL}/images/mv-luscious-lather-logo.jpg`;

export function absoluteUrl(path: string): string {
  if (!path) return DEFAULT_OG_IMAGE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BRAND_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
  title: {
    default: brandTitle(),
    template: `%s — ${BRAND_DISPLAY_NAME}`,
  },
  description:
    "Artisanal botanical bath and body care handcrafted in small batches. Soaps, scrubs, candles, and gift sets — where ritual meets luxury.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BRAND_SITE_URL,
    siteName: BRAND_DISPLAY_NAME,
    title: brandTitle(),
    description:
      "Artisanal botanical bath and body care handcrafted in small batches.",
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${BRAND_DISPLAY_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: brandTitle(),
    description: BRAND_TAGLINE,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: BRAND_SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};

export function buildProductMetadata(product: Product): Metadata {
  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description;
  const image = product.images[0] ? absoluteUrl(product.images[0]) : DEFAULT_OG_IMAGE;
  const url = `${BRAND_SITE_URL}/collections/${product.slug}`;

  return {
    title: product.name,
    description,
    openGraph: {
      type: "website",
      url,
      title: `${product.name} — ${BRAND_DISPLAY_NAME}`,
      description,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export function buildProductJsonLd(product: Product): Record<string, unknown> {
  const url = `${BRAND_SITE_URL}/collections/${product.slug}`;
  const image = product.images[0] ? absoluteUrl(product.images[0]) : DEFAULT_OG_IMAGE;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.length ? product.images.map(absoluteUrl) : [image],
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: BRAND_DISPLAY_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      ...(product.comparePrice
        ? { priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) }
        : {}),
    },
    ...(product.fragrance ? { material: product.fragrance } : {}),
  };
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_DISPLAY_NAME,
    url: BRAND_SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: BRAND_TAGLINE,
    email: BRAND_EMAIL,
    sameAs: socialProfileUrls(),
  };
}
