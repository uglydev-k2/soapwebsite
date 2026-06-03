import { NextRequest } from "next/server";
import { requireAdmin, jsonResponse } from "@/lib/api-helpers";
import { adminGlobalSearch } from "@/lib/admin-overview";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await adminGlobalSearch(q, 10);
  return jsonResponse(results);
}
