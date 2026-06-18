CREATE TABLE IF NOT EXISTS "public"."ProductScentOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fragrance" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductScentOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductScentOption_productId_idx"
ON "public"."ProductScentOption" ("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductScentOption_productId_fkey'
  ) THEN
    ALTER TABLE "public"."ProductScentOption"
    ADD CONSTRAINT "ProductScentOption_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "public"."Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "public"."OrderItem"
ADD COLUMN IF NOT EXISTS "scentOptionId" TEXT,
ADD COLUMN IF NOT EXISTS "scentLabel" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_scentOptionId_fkey'
  ) THEN
    ALTER TABLE "public"."OrderItem"
    ADD CONSTRAINT "OrderItem_scentOptionId_fkey"
    FOREIGN KEY ("scentOptionId") REFERENCES "public"."ProductScentOption"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
