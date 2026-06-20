import { getNavbarAuthUser } from "@/lib/profile";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getMaintenanceMessage, isMaintenanceMode } from "@/lib/maintenance";
import { StoreSettingsProvider } from "@/components/marketing/StoreSettingsContext";
import { getPublicStoreSettings } from "@/lib/store-settings";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { getGaMeasurementId } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialUser, storeSettings] = await Promise.all([
    getNavbarAuthUser(),
    getPublicStoreSettings(),
  ]);
  const maintenance = isMaintenanceMode();
  const gaId = getGaMeasurementId();

  return (
    <StoreSettingsProvider settings={storeSettings}>
      {gaId ? <GoogleAnalytics measurementId={gaId} /> : null}
      <MarketingShell
        initialUser={initialUser}
        maintenance={maintenance}
        maintenanceMessage={maintenance ? getMaintenanceMessage() : undefined}
      >
        {children}
      </MarketingShell>
    </StoreSettingsProvider>
  );
}
