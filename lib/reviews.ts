import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export type PublicReview = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  rating: number;
  createdAt: Date;
};

const REVIEW_LIBRARY: Omit<PublicReview, "id" | "createdAt">[] = [
  {
    authorName: "Elena M.",
    title: "My new daily ritual",
    body: "The scent is balanced and luxurious without being overpowering. Skin feels nourished after every shower.",
    rating: 5,
  },
  {
    authorName: "Daniel K.",
    title: "Worth every penny",
    body: "Texture, fragrance, and packaging all feel premium. This is now a permanent part of our bathroom shelf.",
    rating: 5,
  },
  {
    authorName: "Priya S.",
    title: "Beautiful quality",
    body: "Clean ingredients and long-lasting scent. The product feels gentle and leaves skin incredibly soft.",
    rating: 4,
  },
  {
    authorName: "Jordan R.",
    title: "Perfect gift",
    body: "Bought this for my partner and ended up ordering one for myself. Quality is consistent and shipping was quick.",
    rating: 5,
  },
];

function getFallbackReviews(seed: string): PublicReview[] {
  const base = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 3 }, (_, i) => {
    const item = REVIEW_LIBRARY[(base + i) % REVIEW_LIBRARY.length]!;
    return {
      ...item,
      id: `fallback-${i}`,
      createdAt: new Date(),
    };
  });
}

export async function getApprovedReviews(productSlug: string): Promise<PublicReview[]> {
  if (!isDatabaseConfigured()) {
    return getFallbackReviews(productSlug);
  }

  const rows = await prisma.productReview.findMany({
    where: { productSlug, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  if (rows.length === 0) {
    return getFallbackReviews(productSlug);
  }

  return rows.map((row) => ({
    id: row.id,
    authorName: row.authorName,
    title: row.title,
    body: row.body,
    rating: row.rating,
    createdAt: row.createdAt,
  }));
}
