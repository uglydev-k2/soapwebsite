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
import {
  formatRetailLocationTitle,
  RETAIL_LOCATION,
  retailLocationGoogleMapsUrl,
} from "@/lib/retail-location";
const DEFAULT_OG_IMAGE = `${BRAND_SITE_URL}/images/mv-luscious-lather-logo.jpg`;

export const DEFAULT_SITE_DESCRIPTION =
  "Artisanal botanical bath and body care handcrafted in small batches. Soaps, scrubs, candles, and gift sets — where ritual meets luxury.";

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
  description: DEFAULT_SITE_DESCRIPTION,
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
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "48x48" },
      { url: "/favicon.png?v=2", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png?v=2", sizes: "180x180" }],
    shortcut: "/favicon.ico?v=2",
  },
};

export function buildPageMetadata(
  path: string,
  options: {
    title: string;
    description?: string;
    robots?: Metadata["robots"];
  }
): Metadata {
  const url = absoluteUrl(path);
  const description = options.description;

  return {
    title: options.title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: {
      url,
      title: options.title,
      ...(description ? { description } : {}),
    },
    ...(options.robots ? { robots: options.robots } : {}),
  };
}

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

export function buildRetailLocationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: `${BRAND_DISPLAY_NAME} at ${formatRetailLocationTitle()}`,
    description: `Shop MV Luscious Lather in person at ${RETAIL_LOCATION.hostName}, ${RETAIL_LOCATION.hostArea}.`,
    url: `${BRAND_SITE_URL}/contact`,
    email: BRAND_EMAIL,
    hasMap: retailLocationGoogleMapsUrl(),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${RETAIL_LOCATION.streetAddress}, ${RETAIL_LOCATION.suite}`,
      addressLocality: RETAIL_LOCATION.city,
      addressRegion: RETAIL_LOCATION.state,
      postalCode: RETAIL_LOCATION.postalCode,
      addressCountry: RETAIL_LOCATION.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    parentOrganization: {
      "@type": "Organization",
      name: BRAND_DISPLAY_NAME,
      url: BRAND_SITE_URL,
    },
  };
}
