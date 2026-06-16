import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { UserMenu } from "@/components/auth/UserMenu";
import { getNavbarAuthUser } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getNavbarAuthUser();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-green/10 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group transition-opacity hover:opacity-90">
            <BrandLogo size="md" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="label-caps text-sm text-muted transition-colors hover:text-green"
            >
              Dashboard
            </Link>
            <Link
              href="/collections"
              className="label-caps text-sm text-muted transition-colors hover:text-green"
            >
              Shop
            </Link>
            <UserMenu initialUser={initialUser} />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
