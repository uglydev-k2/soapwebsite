import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json<ApiResponse<null>>({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export function jsonResponse<T>(data: T, meta?: ApiResponse<T>["meta"], status = 200) {
  return NextResponse.json<ApiResponse<T>>({ data, meta }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>({ error: message }, { status });
}
