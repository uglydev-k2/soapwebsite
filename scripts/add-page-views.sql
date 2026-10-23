-- Storefront visitor / page-view tracking (Supabase-compatible, idempotent)
CREATE TABLE IF NOT EXISTS "public"."PageView" (
  "id" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "public"."PageView" ("createdAt");
CREATE INDEX IF NOT EXISTS "PageView_visitorId_idx" ON "public"."PageView" ("visitorId");
CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx" ON "public"."PageView" ("sessionId");
