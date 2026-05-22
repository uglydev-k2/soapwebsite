"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="label-caps mb-4 text-terra">Something went wrong</p>
        <h1 className="mb-4 font-serif text-3xl text-green">
          We&apos;ll be right back
        </h1>
        <p className="mb-2 text-sm text-muted">
          If this site was just deployed, add{" "}
          <code className="text-green">DATABASE_URL</code>,{" "}
          <code className="text-green">AUTH_SECRET</code>, and{" "}
          <code className="text-green">NEXTAUTH_URL</code> in Vercel, then
          redeploy.
        </p>
        {error.digest && (
          <p className="mb-6 text-xs text-muted">Digest: {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/">
            <Button variant="ghost">Go Home</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
