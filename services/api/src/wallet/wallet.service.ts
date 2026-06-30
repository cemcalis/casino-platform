import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';

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
}
