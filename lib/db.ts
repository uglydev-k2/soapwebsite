import { isDatabaseConfigured } from "@/lib/env";

/**
 * Run a Prisma query safely. Returns fallback when DATABASE_URL is missing
 * or the query throws (connection refused, missing tables, etc.).
 */
export async function safeDbQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isDatabaseConfigured()) {
    console.warn(`[msvee:db:${label}] DATABASE_URL not set — using fallback`);
    return fallback;
  }
  try {
    return await fn();
  } catch (error) {
    console.error(`[msvee:db:${label}] Query failed:`, error);
    return fallback;
  }
}

export async function safeDbQueryOrThrow<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured (DATABASE_URL missing)");
  }
  try {
    return await fn();
  } catch (error) {
    console.error(`[msvee:db:${label}] Query failed:`, error);
    throw error;
  }
}
