import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminRole } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "./env";
import type { AdminRole } from "@/lib/rbac";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return { supabaseResponse, user: null, adminRole: null as AdminRole | null };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("[middleware] Supabase getUser error:", error.message);
    }

    let adminRole: AdminRole | null = null;
    if (user) {
      adminRole = await getSupabaseAdminRole(supabase, user.id);
    }

    return { supabaseResponse, user: user ?? null, adminRole };
  } catch (error) {
    console.error("[middleware] Supabase session update failed:", error);
    return {
      supabaseResponse: NextResponse.next({ request }),
      user: null,
      adminRole: null as AdminRole | null,
    };
  }
}
