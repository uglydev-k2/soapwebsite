import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { updateSession } from "@/lib/supabase/middleware";
import { getAuthSecret } from "@/lib/env";
import {
  canAccessAdmin,
  getRequiredPermission,
  hasPermission,
} from "@/lib/rbac";

const CUSTOMER_AUTH_PAGES = ["/login", "/signup"];
const CUSTOMER_PROTECTED_PREFIXES = ["/dashboard", "/account"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabaseResponse, user } = await updateSession(request);

  if (
    user &&
    CUSTOMER_AUTH_PAGES.some((path) => pathname === path)
  ) {
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

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: getAuthSecret(),
    });
    const isLoggedIn = !!token;
    const role = token?.role as string | undefined;
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
      if (isLoggedIn && canAccessAdmin(role)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return supabaseResponse;
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
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
