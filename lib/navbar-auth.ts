import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

export type NavbarAuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function toNavbarAuthUser(
  user: Pick<User, "id" | "email" | "user_metadata">,
  profile?: Profile | null
): NavbarAuthUser {
  const metadata = user.user_metadata as {
    full_name?: string;
    avatar_url?: string;
  };

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    full_name: profile?.full_name ?? metadata.full_name ?? null,
    avatar_url: profile?.avatar_url ?? metadata.avatar_url ?? null,
  };
}
