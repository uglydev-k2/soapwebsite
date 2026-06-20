import type { MetadataRoute } from "next";
import { BRAND_SITE_URL } from "@/lib/brand";
import { VISIBLE_SHOP_CATEGORY_MENU } from "@/lib/categories";
import { JOURNAL_POSTS } from "@/lib/content/journal";
import { getActiveProductSlugs } from "@/lib/products";

const STATIC_ROUTES = [
  "",
  "/collections",
  "/cart",
  "/about",
  "/scents",
  "/gift-guide",
  "/ritual-builder",
  "/journal",
  "/contact",
  "/wholesale",
  "/shipping",
  "/faq",
  "/privacy",
  "/terms",
  "/sustainability",
  "/ingredients",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = VISIBLE_SHOP_CATEGORY_MENU.map(
    (category) => ({
      url: `${base}/collections/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const journalEntries: MetadataRoute.Sitemap = JOURNAL_POSTS.map((post) => ({
    url: `${base}/journal/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const products = await getActiveProductSlugs();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/collections/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...journalEntries,
    ...productEntries,
  ];
}
