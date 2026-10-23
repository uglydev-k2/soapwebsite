import { jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { verifySquareAccessToken } from "@/lib/square-verify";

export const dynamic = "force-dynamic";

/** Validates production Square credentials without exposing secrets. */
export const GET = withApiHandler("checkout.square-health", async () => {
  const check = await verifySquareAccessToken();
  return jsonResponse(check);
});
