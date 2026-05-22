import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { storeSettingsSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return jsonResponse({ settings, admins });
}

export async function PUT(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { type, ...data } = body;

  if (type === "store") {
    const parsed = storeSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
    }
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...parsed.data },
      update: parsed.data,
    });
    return jsonResponse(settings);
  }

  if (type === "password") {
    const { currentPassword, newPassword } = data;
    const admin = await prisma.adminUser.findUnique({
      where: { id: session!.user!.id },
    });
    if (!admin) return errorResponse("User not found", 404);
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return errorResponse("Current password is incorrect");
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { password: hashed },
    });
    return jsonResponse({ success: true });
  }

  if (type === "invite") {
    const { email, name } = data;
    const tempPass = await bcrypt.hash("changeme123", 12);
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, name, password: tempPass, role: "EDITOR" },
      update: { name },
    });
    const { sendAdminInvite } = await import("@/lib/resend");
    await sendAdminInvite(email, name);
    return jsonResponse({ success: true });
  }

  return errorResponse("Invalid request type");
}
