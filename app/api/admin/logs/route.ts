import { NextRequest } from "next/server";
import { requireAdmin, jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { getAuditLogs } from "@/lib/audit";

export const GET = withApiHandler("admin.logs", async (request: NextRequest) => {
  const { error } = await requireAdmin("logs:read");
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const entity = searchParams.get("entity") || undefined;
  const action = searchParams.get("action") || undefined;
  const adminId = searchParams.get("adminId") || undefined;
  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const { logs, total } = await getAuditLogs({
    page,
    limit,
    entity,
    action,
    adminId,
    from,
    to,
  });

  return jsonResponse(logs, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});
