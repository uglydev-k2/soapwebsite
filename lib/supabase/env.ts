/** Returns true only when Supabase URL is a valid http(s) URL and anon key is set. */
export function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return isValidSupabaseUrl(url) && Boolean(key);
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!isValidSupabaseUrl(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing or invalid — set a full https:// URL in your environment variables"
    );
  }
  return url!;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
  }
  return key;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      isSupabaseConfigured()
  );
}
