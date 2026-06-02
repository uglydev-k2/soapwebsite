import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { stockNotifySchema } from "@/lib/validations";
import { sendStockNotifyRequest } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = stockNotifySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid request");
  }

  try {
    await sendStockNotifyRequest(parsed.data);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Could not save your request. Please try again.");
  }
}
