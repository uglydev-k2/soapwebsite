import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { productSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { isDatabaseConfigured } from "@/lib/env";
import { parseProductListFilters } from "@/lib/parse-product-filters";

export const GET = withApiHandler("products.list", async (request: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return jsonResponse([]);
  }

  const { searchParams } = request.nextUrl;
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const active = searchParams.get("active");

  const where = parseProductListFilters(searchParams);
  if (active !== null && active !== undefined && active !== "")
    where.active = active === "true";
  if (featured === "true") where.featured = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        category: true,
        stock: true,
        images: true,
        ingredients: true,
        fragrance: true,
        featured: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return jsonResponse(products, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const POST = withApiHandler("products.create", async (request: NextRequest) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const existing = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) return errorResponse("Slug already exists", 409);

  const product = await prisma.product.create({ data: parsed.data });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "CREATE",
    entity: "Product",
    entityId: product.id,
    metadata: { name: product.name, slug: product.slug },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(product, undefined, 201);
});
