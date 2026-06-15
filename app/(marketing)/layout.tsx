import { getNavbarAuthUser } from "@/lib/profile";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getMaintenanceMessage, isMaintenanceMode } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getNavbarAuthUser();
  const maintenance = isMaintenanceMode();

  return (
    <MarketingShell
      initialUser={initialUser}
      maintenance={maintenance}
      maintenanceMessage={maintenance ? getMaintenanceMessage() : undefined}
    >
      {children}
    </MarketingShell>
  );
}
