import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { isDatabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

const VISITOR_COOKIE = "mv_vid";
const SESSION_COOKIE = "mv_sid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const SESSION_MAX_AGE = 60 * 30; // 30 minutes (sliding)

/** Records a storefront page view. Fire-and-forget from the client. */
export const POST = withApiHandler("track", async (request: NextRequest) => {
  const response = new NextResponse(null, { status: 204 });

  if (!isDatabaseConfigured()) return response;

  const bot = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(
    request.headers.get("user-agent") ?? ""
  );
  if (bot) return response;

  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
    });
  }

  let sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = randomUUID();
  // Refresh the session cookie on every hit so it expires after 30 min idle.
  response.cookies.set(SESSION_COOKIE, sessionId, {
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  });

  let body: { path?: unknown; referrer?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* ignore malformed body */
  }

  const path =
    typeof body.path === "string" ? body.path.slice(0, 512) : "unknown";
  const referrer =
    typeof body.referrer === "string" && body.referrer
      ? body.referrer.slice(0, 512)
      : null;

  try {
    await prisma.pageView.create({
      data: { visitorId, sessionId, path, referrer },
    });
  } catch (error) {
    console.error("[msvee:api:track] failed to record page view", error);
  }

  return response;
});
