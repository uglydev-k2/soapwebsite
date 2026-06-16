-- Backfill shipping weight from category defaults (matches lib/product-weight.ts).
UPDATE "Product"
SET "weightOz" = 4
WHERE "weightOz" IS NULL
  AND (
    LOWER("name") LIKE '%sample%'
    OR LOWER("slug") LIKE '%sample%'
  );

UPDATE "Product"
SET "weightOz" = 6
WHERE "weightOz" IS NULL AND "category" = 'BAR_SOAP';

UPDATE "Product"
SET "weightOz" = 10
WHERE "weightOz" IS NULL AND "category" = 'BATH_BODY';

UPDATE "Product"
SET "weightOz" = 10
WHERE "weightOz" IS NULL AND "category" = 'CANDLES';

UPDATE "Product"
SET "weightOz" = 4
WHERE "weightOz" IS NULL AND "category" = 'ACCESSORIES';

UPDATE "Product"
SET "weightOz" = 18
WHERE "weightOz" IS NULL AND "category" = 'GIFT_SET';

-- Legacy category values (pre-migration catalog)
UPDATE "Product"
SET "weightOz" = 6
WHERE "weightOz" IS NULL AND "category" IN ('SOAP', 'BODY_WASH', 'LOTION', 'SCRUB', 'AROMATHERAPY');
