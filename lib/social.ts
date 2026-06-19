/** Public handle shown on Instagram, TikTok, Pinterest, Facebook, etc. */
export const SOCIAL_HANDLE = "mv luscious lather";

/** URL-safe slug derived from the handle (spaces removed). */
export const SOCIAL_HANDLE_SLUG = SOCIAL_HANDLE.replace(/\s+/g, "").toLowerCase();

export const SOCIAL_PROFILES = [
  {
    platform: "Instagram",
    href: `https://instagram.com/${SOCIAL_HANDLE_SLUG}`,
  },
  {
    platform: "Facebook",
    href: `https://facebook.com/${SOCIAL_HANDLE_SLUG}`,
  },
  {
    platform: "Pinterest",
    href: `https://pinterest.com/${SOCIAL_HANDLE_SLUG}`,
  },
  {
    platform: "TikTok",
    href: `https://tiktok.com/@${SOCIAL_HANDLE_SLUG}`,
  },
] as const;

export function socialProfileLabel(platform: string): string {
  return `Follow ${SOCIAL_HANDLE} on ${platform}`;
}

export function socialProfileUrls(): string[] {
  return SOCIAL_PROFILES.map((profile) => profile.href);
}
