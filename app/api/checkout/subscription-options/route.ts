import { jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import {
  SUBSCRIPTION_CADENCES,
  SUBSCRIPTION_DISCOUNT_RATE,
  isSquareSubscriptionPlanConfigured,
} from "@/lib/subscriptions";

export const GET = withApiHandler("checkout.subscription-options", async () => {
  return jsonResponse({
    discountRate: SUBSCRIPTION_DISCOUNT_RATE,
    cadences: SUBSCRIPTION_CADENCES.map((cadence) => ({
      id: cadence.id,
      label: cadence.label,
      description: cadence.description,
      planConfigured: isSquareSubscriptionPlanConfigured(cadence.id),
    })),
  });
});
