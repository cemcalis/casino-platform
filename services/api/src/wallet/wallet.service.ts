import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database';

const DAILY_BONUS_AMOUNT = 500;
const DAILY_BONUS_REF = 'daily_bonus';
const WELCOME_BONUS_AMOUNT = 5000;
const WELCOME_BONUS_REF = 'welcome_bonus';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string): Promise<{ id: string; balance: string; updatedAt: Date }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, balance: true, updatedAt: true },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return {
      id: wallet.id,
      balance: wallet.balance.toFixed(2),
      updatedAt: wallet.updatedAt,
    };
  }

  async getLedger(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    entries: Array<{
      id: string;
      type: string;
      amount: string;
      balanceBefore: string;
      balanceAfter: string;
      referenceId: string | null;
      createdAt: Date;
    }>;
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          type: true,
          amount: true,
          balanceBefore: true,
          balanceAfter: true,
          referenceId: true,
          createdAt: true,
        },
      }),
      this.prisma.ledgerEntry.count({ where: { userId } }),
    ]);

    return {
      entries: entries.map((e: typeof entries[number]) => ({
        id: e.id,
        type: e.type,
        amount: e.amount.toFixed(2),
        balanceBefore: e.balanceBefore.toFixed(2),
        balanceAfter: e.balanceAfter.toFixed(2),
        referenceId: e.referenceId,
        createdAt: e.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async claimDailyBonus(userId: string): Promise<{ balance: string; bonusAmount: string }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyClaimed = await this.prisma.ledgerEntry.findFirst({
      where: { userId, referenceId: DAILY_BONUS_REF, createdAt: { gte: todayStart } },
    });
    if (alreadyClaimed) throw new BadRequestException('Daily bonus already claimed today');

    return this.creditBonus(userId, DAILY_BONUS_AMOUNT, DAILY_BONUS_REF);
  }

  async claimWelcomeBonus(userId: string): Promise<{ balance: string; bonusAmount: string }> {
    const alreadyClaimed = await this.prisma.ledgerEntry.findFirst({
      where: { userId, referenceId: WELCOME_BONUS_REF },
    });
    if (alreadyClaimed) throw new BadRequestException('Welcome bonus already claimed');

    return this.creditBonus(userId, WELCOME_BONUS_AMOUNT, WELCOME_BONUS_REF);
  }

  private async creditBonus(
    userId: string,
    amount: number,
    referenceId: string,
  ): Promise<{ balance: string; bonusAmount: string }> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const newBalance = wallet.balance.add(amount);

    await this.prisma.$transaction([
      this.prisma.wallet.update({ where: { userId }, data: { balance: newBalance } }),
      this.prisma.ledgerEntry.create({
        data: {
          userId,
          type: 'CREDIT',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          referenceId,
        },
      }),
    ]);

    return { balance: newBalance.toFixed(2), bonusAmount: amount.toFixed(2) };
  }

  async getBonusStatus(userId: string): Promise<{
    welcomeClaimed: boolean;
    dailyClaimedToday: boolean;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [welcome, daily] = await Promise.all([
      this.prisma.ledgerEntry.findFirst({ where: { userId, referenceId: WELCOME_BONUS_REF } }),
      this.prisma.ledgerEntry.findFirst({ where: { userId, referenceId: DAILY_BONUS_REF, createdAt: { gte: todayStart } } }),
    ]);

    return { welcomeClaimed: !!welcome, dailyClaimedToday: !!daily };
  }
}
