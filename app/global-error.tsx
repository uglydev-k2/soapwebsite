"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[msvee] App error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#F7F3ED",
          color: "#1C1C1C",
        }}
      >
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#B5552A",
                marginBottom: "1rem",
              }}
            >
              Application Error
            </p>
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 300,
                fontSize: "2rem",
                color: "#2C4A3E",
                marginBottom: "1rem",
              }}
            >
              Something went wrong
            </h1>
            <p style={{ color: "#6B5E52", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              {error.message || "A server-side exception occurred."}
            </p>
            {error.digest && (
              <p style={{ color: "#6B5E52", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
                Digest: <code>{error.digest}</code>
              </p>
            )}
            <p style={{ color: "#6B5E52", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
              Check Vercel → Project → Logs and search for this digest. Ensure{" "}
              <code>DATABASE_URL</code>, <code>AUTH_SECRET</code>, and{" "}
              <code>NEXTAUTH_URL</code> are set.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  background: "#B5552A",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <Link href="/" style={{ color: "#2C4A3E", padding: "0.75rem 1.5rem" }}>
                Go Home
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
