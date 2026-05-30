import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { hasPermission, type Permission } from "@/lib/rbac";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function requireAdmin(permission?: Permission) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        session: null,
        error: NextResponse.json<ApiResponse<null>>(
          { error: "Unauthorized" },
          { status: 401 }
        ),
      };
    }

    const role = (session.user as { role?: string }).role;
    if (permission && !hasPermission(role, permission)) {
      return {
        session: null,
        error: NextResponse.json<ApiResponse<null>>(
          { error: "Forbidden — insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    return { session, error: null };
  } catch (error) {
    console.error("[msvee] Auth check failed:", error);
    return {
      session: null,
      error: NextResponse.json<ApiResponse<null>>(
        { error: "Authentication service unavailable" },
        { status: 503 }
      ),
    };
  }
}

export function requireRateLimit(
  request: Request,
  key: string,
  limit = 30
): NextResponse | null {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`${key}:${ip}`, limit);
  if (!ok) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  return null;
}

export function jsonResponse<T>(
  data: T,
  meta?: ApiResponse<T>["meta"],
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>({ data, meta }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>({ error: message }, { status });
}
