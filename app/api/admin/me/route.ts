import { getAdminSession } from "@/lib/admin-auth";
import { jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return jsonResponse(null);
  }
  return jsonResponse(session);
}
