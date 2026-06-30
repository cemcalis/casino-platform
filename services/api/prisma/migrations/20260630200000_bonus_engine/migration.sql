-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('WELCOME', 'DAILY', 'CASHBACK');

-- CreateTable BonusConfig
CREATE TABLE "BonusConfig" (
    "id" TEXT NOT NULL,
    "type" "BonusType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "baseAmount" DECIMAL(18,2) NOT NULL,
    "tierMultipliers" JSONB NOT NULL DEFAULT '{"SILVER":2,"GOLD":4,"PLATINUM":10}',
    "cashbackPct" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "expiresInDays" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BonusConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserBonus
CREATE TABLE "UserBonus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BonusType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBonus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BonusConfig_type_key" ON "BonusConfig"("type");
CREATE INDEX "UserBonus_userId_idx" ON "UserBonus"("userId");
CREATE INDEX "UserBonus_expiresAt_idx" ON "UserBonus"("expiresAt");

-- AddForeignKey
ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default BonusConfig rows
INSERT INTO "BonusConfig" ("id", "type", "enabled", "baseAmount", "tierMultipliers", "cashbackPct", "expiresInDays", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'WELCOME',  true, 5000, '{"SILVER":1,"GOLD":1,"PLATINUM":1}', 0,  30, NOW()),
  (gen_random_uuid()::text, 'DAILY',    true, 500,  '{"SILVER":2,"GOLD":4,"PLATINUM":10}', 0, 1,  NOW()),
  (gen_random_uuid()::text, 'CASHBACK', true, 0,    '{"SILVER":1,"GOLD":1,"PLATINUM":1}', 5,  7,  NOW());
