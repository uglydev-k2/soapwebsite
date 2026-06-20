import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { sendBackInStockEmail, sendStockNotifyRequest } from "@/lib/resend";

export type StockNotifyInput = {
  email: string;
  productSlug: string;
  productName: string;
  scentOptionId?: string;
  scentLabel?: string;
};

export async function saveStockNotifyRequest(input: StockNotifyInput) {
  if (!isDatabaseConfigured()) {
    await sendStockNotifyRequest(input);
    return;
  }

  const existing = await prisma.stockNotifyRequest.findFirst({
    where: {
      email: input.email.toLowerCase(),
      productSlug: input.productSlug,
      scentOptionId: input.scentOptionId ?? null,
      notifiedAt: null,
    },
  });

  if (existing) return existing;

  const row = await prisma.stockNotifyRequest.create({
    data: {
      email: input.email.toLowerCase(),
      productSlug: input.productSlug,
      productName: input.productName,
      scentOptionId: input.scentOptionId ?? null,
      scentLabel: input.scentLabel ?? null,
    },
  });

  await sendStockNotifyRequest(input);
  return row;
}

export async function notifyWaitlistIfRestocked(input: {
  productSlug: string;
  productName: string;
  previousStock: number;
  newStock: number;
  scentOptionId?: string;
  scentLabel?: string;
}) {
  if (input.previousStock > 0 || input.newStock <= 0) return;
  if (!isDatabaseConfigured()) return;

  const waitlist = await prisma.stockNotifyRequest.findMany({
    where: {
      productSlug: input.productSlug,
      scentOptionId: input.scentOptionId ?? null,
      notifiedAt: null,
    },
  });

  if (waitlist.length === 0) return;

  const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
  const productUrl = `${siteUrl}/collections/${input.productSlug}`;
  const label = input.scentLabel
    ? `${input.productName} (${input.scentLabel})`
    : input.productName;

  for (const row of waitlist) {
    await sendBackInStockEmail({
      email: row.email,
      productName: label,
      productUrl,
    });
  }

  await prisma.stockNotifyRequest.updateMany({
    where: { id: { in: waitlist.map((row) => row.id) } },
    data: { notifiedAt: new Date() },
  });
}
