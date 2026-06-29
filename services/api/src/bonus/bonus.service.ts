import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { Prisma } from '@prisma/client';

const DAILY_BONUS_AMOUNT = new Prisma.Decimal(1000);

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async claimDailyBonus(userId: string): Promise<{ balance: string; nextClaimAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastBonusClaim: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    if (user.lastBonusClaim) {
      const claimUTC = new Date(user.lastBonusClaim);
      const nextMidnightUTC = new Date(
        Date.UTC(
          claimUTC.getUTCFullYear(),
          claimUTC.getUTCMonth(),
          claimUTC.getUTCDate() + 1,
        ),
      );
      if (now < nextMidnightUTC) {
        throw new BadRequestException({
          message: 'Daily bonus already claimed',
          nextClaimAt: nextMidnightUTC.toISOString(),
        });
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { id: true, balance: true, version: true },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const newBalance = wallet.balance.add(DAILY_BONUS_AMOUNT);

      const result = await tx.wallet.updateMany({
        where: { userId, version: wallet.version },
        data: { balance: newBalance, version: wallet.version + 1 },
      });
      if (result.count === 0) throw new BadRequestException('Concurrent update — retry');

      await tx.ledgerEntry.create({
        data: {
          userId,
          type: 'CREDIT',
          amount: DAILY_BONUS_AMOUNT,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          referenceId: 'daily-bonus',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { lastBonusClaim: now },
      });

      return newBalance;
    });

    const nextClaimAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );

    return { balance: updated.toFixed(2), nextClaimAt };
  }
}
