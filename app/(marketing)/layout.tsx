import { getNavbarAuthUser } from "@/lib/profile";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getNavbarAuthUser();

  return <MarketingShell initialUser={initialUser}>{children}</MarketingShell>;
}
