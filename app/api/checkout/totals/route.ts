import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { checkoutTotalsSchema } from "@/lib/validations";
import { computeCheckoutTotals } from "@/lib/checkout-totals";

export const POST = withApiHandler("checkout.totals", async (request: NextRequest) => {
  const body = await request.json();
  const parsed = checkoutTotalsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid checkout data");
  }

  const { totals, error } = await computeCheckoutTotals(parsed.data);
  if (error) return errorResponse(error);

  return jsonResponse(totals);
});
