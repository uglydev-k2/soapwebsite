import { NextRequest } from "next/server";
import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { productWithScentOptionsSchema } from "@/lib/validations";
import { syncProductScentOptions } from "@/lib/product-scent-options";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { isDatabaseConfigured } from "@/lib/env";
import { parseProductListFilters } from "@/lib/parse-product-filters";
import { getActiveProducts } from "@/lib/products";
import { parseSkinConcern } from "@/lib/skin-concerns";

const PRODUCT_SELECT = {
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
} as const;

type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

function parseProductSort(value: string | null): ProductSort {
  if (
    value === "newest" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name" ||
    value === "featured"
  ) {
    return value;
  }
  return "featured";
}

export const GET = withApiHandler("products.list", async (request: NextRequest) => {
  if (!isDatabaseConfigured()) {
    return jsonResponse([]);
  }

  const { searchParams } = request.nextUrl;
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const active = searchParams.get("active");
  const concern = parseSkinConcern(searchParams.get("concern") ?? undefined);
  const sort = parseProductSort(searchParams.get("sort"));
  const scent = searchParams.get("scent") ?? undefined;
  const q = searchParams.get("q") ?? searchParams.get("search") ?? undefined;

  const where = parseProductListFilters(searchParams);
  if (active !== null && active !== undefined && active !== "")
    where.active = active === "true";
  if (featured === "true") where.featured = true;

  if (concern || scent || q || sort !== "featured") {
    let products = await getActiveProducts({
      concern,
      sort,
      scent,
      q,
      category: where.category as Category | undefined,
    });

    if (where.active === false) {
      products = products.filter((product) => !product.active);
    } else if (where.active === true || active === "true") {
      products = products.filter((product) => product.active);
    }

    if (featured === "true") {
      products = products.filter((product) => product.featured);
    }

    const total = products.length;
    const paged = products.slice((page - 1) * limit, page * limit);

    return jsonResponse(paged, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: PRODUCT_SELECT,
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
  const { session, error } = await requireAdmin("products:write");
  if (error) return error;

  const body = await request.json();
  const parsed = productWithScentOptionsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const { scentOptions, ...productData } = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { slug: productData.slug },
  });
  if (existing) return errorResponse("Slug already exists", 409);

  const product = await prisma.product.create({ data: productData });
  await syncProductScentOptions(product.id, scentOptions);

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
