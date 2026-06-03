import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getVapidPublicKey,
  isPushConfigured,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function GET() {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  return jsonResponse({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin("dashboard:read");
  if (error) return error;

  if (!isPushConfigured()) {
    return errorResponse(
      "Push notifications are not configured. Add VAPID keys to your environment.",
      503
    );
  }

  const body = await request.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid subscription");
  }

  const adminEmail = session!.user!.email;
  if (!adminEmail) return errorResponse("Admin email required", 400);

  const subscription = await savePushSubscription({
    adminEmail,
    endpoint: parsed.data.endpoint,
    keys: parsed.data.keys,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return jsonResponse({ success: true, id: subscription.id });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;
  if (!endpoint) return errorResponse("Subscription endpoint required");

  await removePushSubscription(endpoint);
  return jsonResponse({ success: true });
}
