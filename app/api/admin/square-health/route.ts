import { jsonResponse, requireAdmin } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { verifySquareAccessToken } from "@/lib/square-verify";

export const dynamic = "force-dynamic";

/** Admin-only: validates Square credentials without exposing secrets publicly. */
export const GET = withApiHandler("admin.square-health", async () => {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const check = await verifySquareAccessToken();
  return jsonResponse(check);
});
