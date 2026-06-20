import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { validatePromoCode } from "@/lib/promo-codes";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body.code === "string" ? body.code : "";
  const subtotal = Number(body.subtotal);

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return errorResponse("Invalid cart subtotal");
  }

  const result = await validatePromoCode(code, subtotal);
  if (!result.valid) {
    return errorResponse(result.error, 400);
  }

  return jsonResponse({
    code: result.code,
    discountType: result.discountType,
    discountValue: result.discountValue,
    discountAmount: result.discountAmount,
    discountedSubtotal: result.discountedSubtotal,
  });
}
