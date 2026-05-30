import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-helpers";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function withApiHandler(label: string, handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`[msvee:api:${label}]`, error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return errorResponse(message, 500);
    }
  };
}
