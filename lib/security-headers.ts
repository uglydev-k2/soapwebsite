import type { NextResponse } from "next/server";

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    // Next.js emits inline bootstrap scripts on statically-rendered pages that
    // cannot carry a per-request nonce, so a nonce + 'strict-dynamic' policy
    // blocks all client JS on those pages (breaking hydration/forms). Allow
    // same-origin scripts plus 'unsafe-inline' for Next's inline runtime.
    [
      "script-src 'self'",
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      "https://web.squarecdn.com",
      "https://sandbox.web.squarecdn.com",
    ].join(" "),
    "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
    "img-src 'self' data: blob: https:",
    [
      "font-src 'self'",
      "data:",
      "https://square-fonts-production-f.squarecdn.com",
      "https://d1g145x70srn7h.cloudfront.net",
    ].join(" "),
    [
      "connect-src 'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://analytics.google.com",
      "https://connect.squareup.com",
      "https://connect.squareupsandbox.com",
      "https://pci-connect.squareup.com",
      "https://pci-connect.squareupsandbox.com",
      "https://web.squarecdn.com",
      "https://sandbox.web.squarecdn.com",
      "https://o160250.ingest.sentry.io",
      "https://uploadthing.com",
      "https://*.uploadthing.com",
      "https://utfs.io",
    ].join(" "),
    [
      "frame-src 'self'",
      "https://web.squarecdn.com",
      "https://sandbox.web.squarecdn.com",
      "https://pci-connect.squareup.com",
      "https://pci-connect.squareupsandbox.com",
    ].join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  [
    "payment=(self",
    '"https://web.squarecdn.com"',
    '"https://sandbox.web.squarecdn.com"',
    '"https://pci-connect.squareup.com"',
    '"https://pci-connect.squareupsandbox.com")',
  ].join(" "),
  "usb=()",
].join(", ");

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", PERMISSIONS_POLICY);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}
