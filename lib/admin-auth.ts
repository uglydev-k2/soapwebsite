import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminSession } from "@/types";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getProfile } from "@/lib/profile";
import {
  canAccessAdmin,
  mapSupabaseProfileRole,
  normalizeRole,
  type AdminRole,
} from "@/lib/rbac";

export type { AdminSession } from "@/types";

/** Resolve admin session from NextAuth (Prisma admin) or Supabase profile role. */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const session = await auth();
    if (session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role && canAccessAdmin(role)) {
        return {
          id: session.user.id!,
          email: session.user.email ?? "",
          name: session.user.name ?? null,
          role: normalizeRole(role),
          source: "nextauth",
        };
      }
    }
  } catch {
    /* fall through to Supabase */
  }

  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await getProfile(user.id);
    const role = mapSupabaseProfileRole(profile?.role);
    if (!role || !canAccessAdmin(role)) return null;

    return {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      name: profile?.full_name ?? null,
      role,
      source: "supabase",
    };
  } catch {
    return null;
  }
}

export async function getSupabaseAdminRole(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminRole | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    const role = mapSupabaseProfileRole(data?.role);
    if (!role || !canAccessAdmin(role)) return null;
    return role;
  } catch {
    return null;
  }
}
