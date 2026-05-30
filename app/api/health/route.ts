import { jsonResponse } from "@/lib/api-helpers";
import { getMissingProductionEnv, isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const missing = getMissingProductionEnv();
  return jsonResponse({
    status: missing.length === 0 && isDatabaseConfigured() ? "ok" : "degraded",
    database: isDatabaseConfigured(),
    missingEnv: missing,
    timestamp: new Date().toISOString(),
  });
}
