import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { verifyCronRequest } from "@/lib/cron-auth";
import { processDueSubscriptionCharges } from "@/lib/subscription-renewal";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const GET = withApiHandler(
  "cron.subscription-charges",
  async (request: NextRequest) => {
    if (!verifyCronRequest(request)) {
      return errorResponse("Unauthorized", 401);
    }

    const summary = await processDueSubscriptionCharges();
    return jsonResponse(summary);
  }
);
