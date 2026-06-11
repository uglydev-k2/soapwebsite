"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { ApiResponse } from "@/types";

type HealthData = {
  status: string;
  database: boolean;
  missingEnv: string[];
};

export function AdminSetupBanner() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((json: ApiResponse<HealthData>) => {
        if (json.data) setHealth(json.data);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  if (!health || health.status === "ok") return null;

  return (
    <div className="mb-8 border border-amber-300 bg-amber-50 px-5 py-5 sm:mb-6 sm:px-4 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
          <div>
            <p className="font-medium text-amber-900">Setup incomplete</p>
            <p className="mt-1 text-sm text-amber-800">
              {health.database
                ? "Some production environment variables are missing."
                : "Database is not connected — admin data may be empty until DATABASE_URL is configured."}
            </p>
            {health.missingEnv.length > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Missing: {health.missingEnv.join(", ")}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/admin/system"
          className="inline-flex items-center gap-1.5 text-sm text-amber-900 underline hover:text-terra"
        >
          Open System Health
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
}
