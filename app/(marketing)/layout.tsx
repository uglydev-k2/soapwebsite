import { getNavbarAuthUser } from "@/lib/profile";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getMaintenanceMessage, isMaintenanceMode } from "@/lib/maintenance";
import { StoreSettingsProvider } from "@/components/marketing/StoreSettingsContext";
import { getPublicStoreSettings } from "@/lib/store-settings";

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

  return (
    <StoreSettingsProvider settings={storeSettings}>
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
