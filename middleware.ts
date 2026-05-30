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

const CUSTOMER_AUTH_PAGES = ["/login", "/signup"];
const CUSTOMER_PROTECTED_PREFIXES = ["/dashboard", "/account"];

async function handleAdminAuth(
  request: NextRequest,
  pathname: string,
  fallback: NextResponse
): Promise<NextResponse | null> {
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  const secret = getAuthSecret();
  if (!secret) {
    console.error("[middleware] Missing AUTH_SECRET / NEXTAUTH_SECRET for admin routes");
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    if (isLoggedIn && canAccessAdmin(role)) {
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
        NextResponse.next()
      );
      return adminResult ?? NextResponse.next();
    } catch (error) {
      console.error("[middleware] Error without Supabase config:", error);
      return NextResponse.next();
    }
  }

  try {
    const pathname = request.nextUrl.pathname;
    const { supabaseResponse, user } = await updateSession(request);

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
      supabaseResponse
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
