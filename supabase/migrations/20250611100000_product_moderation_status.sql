-- Ensure ModerationStatus enum and Product.moderationStatus exist (older DBs may lack these).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModerationStatus') THEN
    CREATE TYPE "public"."ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
  END IF;
END $$;

ALTER TABLE "public"."Product"
  ADD COLUMN IF NOT EXISTS "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'APPROVED';
