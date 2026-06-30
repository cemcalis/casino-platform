-- AlterTable: add freeSpinsRemaining to Wallet for server-side free spin tracking
ALTER TABLE "Wallet" ADD COLUMN "freeSpinsRemaining" INTEGER NOT NULL DEFAULT 0;
