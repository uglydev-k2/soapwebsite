-- Replace product category enum with new storefront categories (catalog is empty-safe).
ALTER TYPE "public"."Category" RENAME TO "Category_old";

CREATE TYPE "public"."Category" AS ENUM (
  'BAR_SOAP',
  'BATH_BODY',
  'CANDLES',
  'ACCESSORIES',
  'GIFT_SET'
);

ALTER TABLE "public"."Product"
  ALTER COLUMN "category" TYPE "public"."Category"
  USING (
    CASE "category"::text
      WHEN 'SOAP' THEN 'BAR_SOAP'
      WHEN 'BODY_WASH' THEN 'BATH_BODY'
      WHEN 'LOTION' THEN 'BATH_BODY'
      WHEN 'SCRUB' THEN 'BATH_BODY'
      WHEN 'AROMATHERAPY' THEN 'CANDLES'
      WHEN 'GIFT_SET' THEN 'GIFT_SET'
      ELSE 'BAR_SOAP'
    END
  )::"public"."Category";

DROP TYPE "public"."Category_old";
