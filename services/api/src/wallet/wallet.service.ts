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
}
