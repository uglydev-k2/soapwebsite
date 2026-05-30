import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { getNavbarAuthUser } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getNavbarAuthUser();

  return (
    <>
      <Navbar initialUser={initialUser} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
