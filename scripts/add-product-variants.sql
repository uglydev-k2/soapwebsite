ALTER TABLE "public"."Product"
ADD COLUMN IF NOT EXISTS "variantGroup" TEXT,
ADD COLUMN IF NOT EXISTS "variantLabel" TEXT;

CREATE INDEX IF NOT EXISTS "Product_variantGroup_idx"
ON "public"."Product" ("variantGroup");
