import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { adminProductSelect } from "@/lib/admin-product-select";
import { parseProductListFilters } from "@/lib/parse-product-filters";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const GET = withApiHandler("admin.products.list", async (request: NextRequest) => {
  const { error } = await requireAdmin("products:read");
  if (error) return error;

  if (!isDatabaseConfigured()) {
    return errorResponse("Database is not configured", 503);
  }

  const where = parseProductListFilters(request.nextUrl.searchParams);

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: adminProductSelect,
  });

  return jsonResponse(products, { total: products.length });
});
