import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { Prisma } from "@prisma/client";

export interface AuditEntry {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAdminAction(entry: AuditEntry): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.auditLog.create({
      data: {
        adminId: entry.adminId,
        adminEmail: entry.adminEmail,
        adminRole: entry.adminRole,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    console.error("[msvee:audit] Failed to log action:", error);
  }
}

export async function getRecentActivity(limit = 10) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getAuditLogs(filters: {
  adminId?: string;
  entity?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  if (!isDatabaseConfigured()) return { logs: [], total: 0 };
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const where: Record<string, unknown> = {};
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.entity) where.entity = filters.entity;
  if (filters.action) where.action = { contains: filters.action, mode: "insensitive" };
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }
  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
  } catch {
    return { logs: [], total: 0 };
  }
}
