import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { getMaintenanceMessage, isMaintenanceMode } from "@/lib/maintenance";

export async function getCheckoutBlockReason(): Promise<string | null> {
  if (isMaintenanceMode()) {
    return getMaintenanceMessage();
  }

  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: { maintenanceMode: true, featureCheckout: true },
    });
    if (settings?.maintenanceMode) {
      return getMaintenanceMessage();
    }
    if (settings?.featureCheckout === false) {
      return "Checkout is temporarily unavailable";
    }
  } catch {
    /* fall through */
  }

  return null;
}
