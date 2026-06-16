import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Unauthorized — mvlusciouslather",
};

export default function UnauthorizedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="label-caps mb-4 text-terra">Access Denied</p>
        <h1 className="mb-4 font-serif text-4xl font-semibold text-green">
          Unauthorized
        </h1>
        <p className="mb-8 text-sm text-muted leading-relaxed">
          You don&apos;t have permission to access this area. Contact a super admin
          if you believe this is an error.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/admin">
            <Button variant="ghost">Admin Home</Button>
          </Link>
          <Link href="/">
            <Button>Back to Site</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
