import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/env";

/**
 * Edge-safe auth config (no Prisma). Used by middleware.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret:
    getAuthSecret() ??
    (process.env.NODE_ENV === "production" ? undefined : "development-only-secret"),
  providers: [],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", request.nextUrl));
        }
        return true;
      }

      if (isAdminRoute) return isLoggedIn;
      return true;
    },
  },
};
