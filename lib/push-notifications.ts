import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY ?? null;
}

function configureWebPush() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
}

export async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  if (!configureWebPush()) return false;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.adminPushSubscription
        .delete({ where: { endpoint: subscription.endpoint } })
        .catch(() => undefined);
    }
    return false;
  }
}

export async function sendPushToAdminEmail(
  adminEmail: string,
  payload: PushPayload
): Promise<number> {
  if (!isDatabaseConfigured() || !isPushConfigured()) return 0;

  const subscriptions = await prisma.adminPushSubscription.findMany({
    where: { adminEmail: adminEmail.toLowerCase() },
  });

  let sent = 0;
  for (const sub of subscriptions) {
    const ok = await sendPushToSubscription(sub, payload);
    if (ok) sent += 1;
  }
  return sent;
}

export async function sendPushToAllAdmins(payload: PushPayload): Promise<number> {
  if (!isDatabaseConfigured() || !isPushConfigured()) return 0;

  const subscriptions = await prisma.adminPushSubscription.findMany();
  let sent = 0;
  for (const sub of subscriptions) {
    const ok = await sendPushToSubscription(sub, payload);
    if (ok) sent += 1;
  }
  return sent;
}

export type PushSubscriptionInput = {
  adminEmail: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

export async function savePushSubscription(input: PushSubscriptionInput) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  return prisma.adminPushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      adminEmail: input.adminEmail.toLowerCase(),
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent,
    },
    update: {
      adminEmail: input.adminEmail.toLowerCase(),
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent,
    },
  });
}

export async function removePushSubscription(endpoint: string) {
  if (!isDatabaseConfigured()) return;
  await prisma.adminPushSubscription
    .delete({ where: { endpoint } })
    .catch(() => undefined);
}
