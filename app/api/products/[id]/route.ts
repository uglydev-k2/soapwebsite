import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { productSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
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
  });
  if (!product) return errorResponse("Product not found", 404);
  return jsonResponse(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return jsonResponse(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: body,
  });
  return jsonResponse(product);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const hard = searchParams.get("hard") === "true";

  if (hard) {
    await prisma.product.delete({ where: { id: params.id } });
  } else {
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    });
  }
  return jsonResponse({ success: true });
}
