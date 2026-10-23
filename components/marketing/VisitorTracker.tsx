"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fires a lightweight page-view beacon to /api/track on each storefront route. */
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      }),
      keepalive: true,
    }).catch(() => {
      /* tracking is best-effort */
    });
  }, [pathname]);

  return null;
}
