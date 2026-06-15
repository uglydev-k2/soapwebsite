import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { updateSession } from "@/lib/supabase/middleware";
import { getAuthSecret } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  canAccessAdmin,
  getRequiredPermission,
  hasPermission,
} from "@/lib/rbac";
import type { AdminRole } from "@/lib/rbac";

const CUSTOMER_AUTH_PAGES = ["/login", "/signup"];
const CUSTOMER_PROTECTED_PREFIXES = ["/dashboard", "/account"];

async function handleAdminAuth(
  request: NextRequest,
  pathname: string,
  fallback: NextResponse,
  supabaseAdminRole: AdminRole | null
): Promise<NextResponse | null> {
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  const secret = getAuthSecret();
  const isLoginPage = pathname === "/admin/login";

  let role: string | undefined;
  let isLoggedIn = false;

  if (secret) {
    const token = await getToken({
      req: request,
      secret,
      secureCookie: request.nextUrl.protocol === "https:",
    });
    if (token?.role && canAccessAdmin(token.role as string)) {
      isLoggedIn = true;
      role = token.role as string;
    }
  }

  if (!isLoggedIn && supabaseAdminRole) {
    isLoggedIn = true;
    role = supabaseAdminRole;
  }

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return fallback;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!canAccessAdmin(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const required = getRequiredPermission(pathname);
  if (required && !hasPermission(role, required)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return fallback;
}

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    console.error(
      "Missing or invalid Supabase env vars in middleware — set NEXT_PUBLIC_SUPABASE_URL (https://...) and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    try {
      const adminResult = await handleAdminAuth(
        request,
        request.nextUrl.pathname,
        NextResponse.next(),
        null
      );
      return adminResult ?? NextResponse.next();
    } catch (error) {
      console.error("[middleware] Error without Supabase config:", error);
      return NextResponse.next();
    }
  }

  try {
    const pathname = request.nextUrl.pathname;
    const { supabaseResponse, user, adminRole } = await updateSession(request);

    if (user && CUSTOMER_AUTH_PAGES.some((path) => pathname === path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      !user &&
      CUSTOMER_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const adminResult = await handleAdminAuth(
      request,
      pathname,
      supabaseResponse,
      adminRole
    );
    if (adminResult) {
      return adminResult;
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Unhandled error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
