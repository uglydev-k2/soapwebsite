import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { productWithScentOptionsSchema } from "@/lib/validations";
import { syncProductScentOptions } from "@/lib/product-scent-options";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { notifyWaitlistIfRestocked } from "@/lib/stock-notify";

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
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = productWithScentOptionsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const { scentOptions, ...productData } = parsed.data;

  const before = await prisma.product.findUnique({
    where: { id: params.id },
    select: { stock: true, slug: true, name: true },
  });

  const product = await prisma.product.update({
    where: { id: params.id },
    data: productData,
  });
  await syncProductScentOptions(params.id, scentOptions);

  if (before && before.stock !== product.stock) {
    await notifyWaitlistIfRestocked({
      productSlug: product.slug,
      productName: product.name,
      previousStock: before.stock,
      newStock: product.stock,
    });
  }

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "Product",
    entityId: params.id,
    metadata: { name: product.name },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: body,
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "Product",
    entityId: params.id,
    metadata: body,
    ipAddress: getClientIp(request),
  });

  return jsonResponse(product);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin();
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

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: hard ? "DELETE" : "UPDATE",
    entity: "Product",
    entityId: params.id,
    metadata: { hard },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true });
}
