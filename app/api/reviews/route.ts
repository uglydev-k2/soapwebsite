import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { reviewSubmitSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return errorResponse("Reviews are unavailable right now", 503);
  }

  const body = await request.json();
  const parsed = reviewSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid review");
  }

  const review = await prisma.productReview.create({
    data: {
      productSlug: parsed.data.productSlug,
      authorName: parsed.data.authorName.trim(),
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
      rating: parsed.data.rating,
      status: "PENDING",
    },
  });

  return jsonResponse({
    success: true,
    message: "Thank you! Your review will appear after moderation.",
    id: review.id,
  });
}
