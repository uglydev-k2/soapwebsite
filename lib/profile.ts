import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  toNavbarAuthUser,
  type NavbarAuthUser,
  type Profile,
} from "@/lib/navbar-auth";

export type { NavbarAuthUser, Profile } from "@/lib/navbar-auth";

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, created_at")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

/** Server-side auth state for navbar — uses session cookie refreshed by middleware. */
export async function getNavbarAuthUser(): Promise<NavbarAuthUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await getProfile(user.id);
    return toNavbarAuthUser(user, profile);
  } catch {
    return null;
  }
}

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  if (!isSupabaseConfigured()) {
    return { user: null, profile: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const profile = await getProfile(user.id);
    return { user: { id: user.id, email: user.email }, profile };
  } catch {
    return { user: null, profile: null };
  }
}
