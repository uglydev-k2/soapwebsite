DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionCadence') THEN
    CREATE TYPE "public"."SubscriptionCadence" AS ENUM ('monthly', 'bimonthly', 'quarterly');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CustomerSubStatus') THEN
    CREATE TYPE "public"."CustomerSubStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."CustomerSubscription" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "status" "public"."CustomerSubStatus" NOT NULL DEFAULT 'ACTIVE',
  "cadence" "public"."SubscriptionCadence" NOT NULL,
  "squareCustomerId" TEXT NOT NULL,
  "squareCardId" TEXT NOT NULL,
  "sourceOrderId" TEXT,
  "sourceOrderNumber" TEXT NOT NULL,
  "cartSnapshot" JSONB NOT NULL,
  "nextChargeAt" TIMESTAMP(3) NOT NULL,
  "lastChargedAt" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSubscription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomerSubscription_customerId_status_idx"
ON "public"."CustomerSubscription" ("customerId", "status");

CREATE INDEX IF NOT EXISTS "CustomerSubscription_nextChargeAt_status_idx"
ON "public"."CustomerSubscription" ("nextChargeAt", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CustomerSubscription_customerId_fkey'
  ) THEN
    ALTER TABLE "public"."CustomerSubscription"
      ADD CONSTRAINT "CustomerSubscription_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
