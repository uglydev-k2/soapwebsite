import type { MetadataRoute } from "next";
import { BRAND_SITE_URL } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = BRAND_SITE_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard", "/account", "/login", "/signup"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
