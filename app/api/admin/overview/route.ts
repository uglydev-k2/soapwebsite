import { requireAdmin, jsonResponse } from "@/lib/api-helpers";
import { getAdminOverview } from "@/lib/admin-overview";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const overview = await getAdminOverview();
  return jsonResponse(overview);
}
