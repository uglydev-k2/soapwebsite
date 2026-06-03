import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import {
  getLowStockProducts,
  LOW_STOCK_THRESHOLD,
} from "@/lib/admin-inventory";

export const dynamic = "force-dynamic";

const stockUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        stock: z.coerce.number().int().min(0),
      })
    )
    .min(1),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("products:read");
  if (error) return error;

  const threshold = Number(request.nextUrl.searchParams.get("threshold")) ||
    LOW_STOCK_THRESHOLD;

  const products = await getLowStockProducts(threshold);
  return jsonResponse({ products, threshold });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin("products:write");
  if (error) return error;

  const body = await request.json();
  const parsed = stockUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const results = [];
  for (const update of parsed.data.updates) {
    const product = await prisma.product.update({
      where: { id: update.id },
      data: { stock: update.stock },
    });
    results.push(product);
  }

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "Product",
    metadata: {
      stockUpdates: parsed.data.updates,
    },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ updated: results.length, products: results });
}
