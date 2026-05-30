import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  requireRateLimit,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

export const GET = withApiHandler("admin.users.list", async () => {
  const { error } = await requireAdmin("users:read");
  if (error) return error;

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse(admins);
});

export const POST = withApiHandler("admin.users.create", async (request: NextRequest) => {
  const limited = requireRateLimit(request, "admin-users", 10);
  if (limited) return limited;

  const { session, error } = await requireAdmin("users:write");
  if (error) return error;

  const body = await request.json();
  const { email, name, role, password } = body as {
    email: string;
    name: string;
    role: Role;
    password?: string;
  };

  if (!email || !name || !role) {
    return errorResponse("Email, name, and role are required");
  }

  const tempPass = password ?? "changeme123";
  const hashed = await bcrypt.hash(tempPass, 12);

  const admin = await prisma.adminUser.create({
    data: { email, name, role, password: hashed },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "CREATE",
    entity: "AdminUser",
    entityId: admin.id,
    metadata: { email, role },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(admin, undefined, 201);
});

export const PATCH = withApiHandler("admin.users.update", async (request: NextRequest) => {
  const { session, error } = await requireAdmin("users:write");
  if (error) return error;

  const body = await request.json();
  const { id, role, active, name } = body as {
    id: string;
    role?: Role;
    active?: boolean;
    name?: string;
  };

  if (!id) return errorResponse("ID required");

  const admin = await prisma.adminUser.update({
    where: { id },
    data: { ...(role && { role }), ...(active !== undefined && { active }), ...(name && { name }) },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "AdminUser",
    entityId: id,
    metadata: { role, active, name },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(admin);
});

export const DELETE = withApiHandler("admin.users.delete", async (request: NextRequest) => {
  const { session, error } = await requireAdmin("users:delete");
  if (error) return error;

  const { id } = await request.json();
  if (!id) return errorResponse("ID required");
  if (id === session!.user!.id) return errorResponse("Cannot delete your own account");

  await prisma.adminUser.delete({ where: { id } });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "DELETE",
    entity: "AdminUser",
    entityId: id,
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true });
});
