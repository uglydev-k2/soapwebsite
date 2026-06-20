import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { promoCodeSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin("settings:read");
  if (error) return error;

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(codes);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin("settings:write");
  if (error) return error;

  const body = await request.json();
  const parsed = promoCodeSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid promo code");
  }

  const code = await prisma.promoCode.create({
    data: {
      code: parsed.data.code.trim().toUpperCase(),
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      minSubtotal: parsed.data.minSubtotal ?? null,
      active: parsed.data.active,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      maxUses: parsed.data.maxUses ?? null,
    },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "CREATE",
    entity: "PromoCode",
    entityId: code.id,
    metadata: { code: code.code },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(code);
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin("settings:write");
  if (error) return error;

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return errorResponse("id is required");

  const code = await prisma.promoCode.update({
    where: { id },
    data: {
      active: typeof body.active === "boolean" ? body.active : undefined,
    },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "PromoCode",
    entityId: id,
    metadata: { active: code.active },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(code);
}
