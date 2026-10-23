import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getSquareLocationId,
  getSquareScriptUrl,
  isSquareConfigured,
} from "@/lib/square";
import { getSquareApplicationId } from "@/lib/square-public-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const applicationId = getSquareApplicationId();

  if (!applicationId || !isSquareConfigured()) {
    return errorResponse("Square payments are not configured", 503);
  }

  return jsonResponse({
    applicationId,
    locationId: getSquareLocationId(),
    scriptUrl: getSquareScriptUrl(),
  });
}
