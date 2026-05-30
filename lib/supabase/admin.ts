import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, isValidSupabaseUrl } from "./env";

export function isSupabaseAdminConfigured(): boolean {
  return (
    isSupabaseConfigured() &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!isValidSupabaseUrl(url) || !serviceKey) {
    throw new Error("Supabase service role is not configured");
  }

  return createClient(url!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
