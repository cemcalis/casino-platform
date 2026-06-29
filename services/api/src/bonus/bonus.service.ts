import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { Prisma } from '@prisma/client';

const DAILY_BONUS_AMOUNT = new Prisma.Decimal(1000);

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async claimDailyBonus(userId: string): Promise<{ balance: string; nextClaimAt: Date }> {
    const now = new Date();
    // UTC midnight for today — bonus is available once per UTC calendar day
    const todayUTCMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const newBalance = await this.prisma.$transaction(async (tx) => {
      // Atomic check-and-set: only advances if bonus was not already claimed today.
      // Using updateMany ensures the WHERE + UPDATE are a single database statement,
      // eliminating the TOCTOU race between reading lastBonusClaim and writing it.
      const userUpdate = await tx.user.updateMany({
        where: {
          id: userId,
          OR: [{ lastBonusClaim: null }, { lastBonusClaim: { lt: todayUTCMidnight } }],
        },
        data: { lastBonusClaim: now },
      });

      if (userUpdate.count === 0) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { lastBonusClaim: true },
        });
        if (!user) throw new NotFoundException('User not found');

        const claim = user.lastBonusClaim!;
        const nextClaimAt = new Date(
          Date.UTC(claim.getUTCFullYear(), claim.getUTCMonth(), claim.getUTCDate() + 1),
        );
        throw new BadRequestException({
          message: 'Daily bonus already claimed',
          nextClaimAt: nextClaimAt.toISOString(),
        });
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { id: true, balance: true, version: true },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const updatedBalance = wallet.balance.add(DAILY_BONUS_AMOUNT);

      const walletUpdate = await tx.wallet.updateMany({
        where: { userId, version: wallet.version },
        data: { balance: updatedBalance, version: wallet.version + 1 },
      });
      if (walletUpdate.count === 0) throw new BadRequestException('Concurrent update — retry');

      await tx.ledgerEntry.create({
        data: {
          userId,
          type: 'CREDIT',
          amount: DAILY_BONUS_AMOUNT,
          balanceBefore: wallet.balance,
          balanceAfter: updatedBalance,
          referenceId: 'daily-bonus',
        },
      });

      return updatedBalance;
    });

    const nextClaimAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    return { balance: newBalance.toFixed(2), nextClaimAt };
  }
}
