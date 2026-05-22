"use client";

import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="admin-card max-w-md text-center">
        <h2 className="font-serif text-2xl text-green mb-4">Something went wrong</h2>
        <p className="text-muted text-sm mb-6">{error.message}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
