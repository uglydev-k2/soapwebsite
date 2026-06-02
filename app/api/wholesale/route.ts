import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { wholesaleSchema } from "@/lib/validations";
import { sendWholesaleInquiry } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = wholesaleSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid form data");
  }

  try {
    await sendWholesaleInquiry(parsed.data);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Could not submit inquiry. Please try again.");
  }
}
