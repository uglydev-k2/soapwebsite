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
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="label-caps text-terra mb-4">Something went wrong</p>
        <h1 className="font-serif text-3xl text-green mb-4">We&apos;ll be right back</h1>
        <p className="text-muted text-sm mb-2">
          The site hit a temporary error. If you just deployed, ensure{" "}
          <code className="text-green">DATABASE_URL</code> is set in your hosting
          environment and the database schema has been applied.
        </p>
        {error.digest && (
          <p className="text-xs text-muted mb-6">Digest: {error.digest}</p>
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
