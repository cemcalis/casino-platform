-- CreateTable
CREATE TABLE "Jackpot" (
    "id" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "seedAmount" DECIMAL(18,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jackpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jackpot_gameType_key" ON "Jackpot"("gameType");

-- Seed initial jackpot pool for neon-palace
INSERT INTO "Jackpot" ("id", "gameType", "amount", "seedAmount", "updatedAt")
VALUES ('cld-neonpalace-jackpot-seed', 'neon-palace', 10000.00, 10000.00, NOW());
