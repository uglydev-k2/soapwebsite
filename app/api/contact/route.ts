import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid form data");
  }

  try {
    await sendContactEmail(parsed.data);
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Could not send your message. Please try again.");
  }
}
