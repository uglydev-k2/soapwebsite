"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[msvee] Root error boundary:", error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="label-caps mb-4 text-terra">Application Error</p>
        <h1 className="mb-4 font-serif text-3xl font-medium text-green">
          Something went wrong
        </h1>
        <p className="mb-2 text-sm text-muted">
          {error.message || "A server-side exception occurred."}
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-muted">
            Digest: <code className="text-green">{error.digest}</code>
          </p>
        )}
        <details className="mb-6 text-left text-xs text-muted">
          <summary className="cursor-pointer label-caps">Deployment checklist</summary>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <code>DATABASE_URL</code> — PostgreSQL connection string
            </li>
            <li>
              <code>AUTH_SECRET</code> — generate with{" "}
              <code>openssl rand -base64 32</code>
            </li>
            <li>
              <code>NEXTAUTH_URL</code> — your production URL
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code> — full https:// URL from Supabase dashboard
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> — Supabase anon public key
            </li>
            <li>Run <code>npm run db:seed</code> once after first deploy</li>
          </ul>
        </details>
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
