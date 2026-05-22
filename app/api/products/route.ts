import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { productSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const active = searchParams.get("active");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = category as Prisma.ProductWhereInput["category"];
  if (active !== null && active !== undefined && active !== "")
    where.active = active === "true";
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

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
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
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
  return jsonResponse(product, undefined, 201);
}
