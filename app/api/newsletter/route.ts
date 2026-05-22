import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { newsletterSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid email");
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email },
      update: {},
    });
    await sendWelcomeEmail(parsed.data.email);
    return jsonResponse({ success: true, message: "Welcome to MsVee Soaps" });
  } catch {
    return errorResponse("Could not subscribe. Please try again.");
  }
}
