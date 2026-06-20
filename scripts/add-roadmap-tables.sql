-- Back-in-stock waitlist, product reviews, promo codes (Supabase-safe, idempotent)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PromoDiscountType') THEN
    CREATE TYPE "public"."PromoDiscountType" AS ENUM ('PERCENT', 'FIXED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."StockNotifyRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "scentOptionId" TEXT,
    "scentLabel" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockNotifyRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StockNotifyRequest_productSlug_notifiedAt_idx"
ON "public"."StockNotifyRequest" ("productSlug", "notifiedAt");

CREATE INDEX IF NOT EXISTS "StockNotifyRequest_email_idx"
ON "public"."StockNotifyRequest" ("email");

CREATE TABLE IF NOT EXISTS "public"."ProductReview" (
    "id" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductReview_productSlug_status_idx"
ON "public"."ProductReview" ("productSlug", "status");

CREATE TABLE IF NOT EXISTS "public"."PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "public"."PromoDiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minSubtotal" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key"
ON "public"."PromoCode" ("code");
