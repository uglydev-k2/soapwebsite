import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  getSquareLocationId,
  getSquareScriptUrl,
  isSquareConfigured,
} from "@/lib/square";

export const dynamic = "force-dynamic";

export async function GET() {
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim();

  if (!applicationId || !isSquareConfigured()) {
    return errorResponse("Square payments are not configured", 503);
  }

  return jsonResponse({
    applicationId,
    locationId: getSquareLocationId(),
    scriptUrl: getSquareScriptUrl(),
  });
}
