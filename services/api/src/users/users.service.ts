import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getStats(userId: string) {
    const [agg, biggestWinRow] = await Promise.all([
      this.prisma.gameSession.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { betAmount: true, winAmount: true },
      }),
      this.prisma.gameSession.findFirst({
        where: { userId },
        orderBy: { winAmount: 'desc' },
        select: { winAmount: true },
      }),
    ]);

    const totalBet = agg._sum.betAmount ?? 0;
    const totalWon = agg._sum.winAmount ?? 0;
    return {
      totalSpins: agg._count.id,
      totalBet: totalBet.toString(),
      totalWon: totalWon.toString(),
      netResult: (Number(totalWon) - Number(totalBet)).toFixed(2),
      biggestWin: (biggestWinRow?.winAmount ?? 0).toString(),
    };
  }

  async getVipStatus(userId: string) {
    const agg = await this.prisma.gameSession.aggregate({
      where: { userId },
      _sum: { betAmount: true },
      _count: { id: true },
    });
    const totalBet = Number(agg._sum.betAmount ?? 0);

    const TIERS = [
      { name: 'Bronze',   min: 0,      max: 999,    next: 1000,   cashback: 0,    dailyBonus: 500,  color: '#cd7f32', icon: '🥉' },
      { name: 'Silver',   min: 1000,   max: 9999,   next: 10000,  cashback: 3,    dailyBonus: 1000, color: '#c0c0c0', icon: '🥈' },
      { name: 'Gold',     min: 10000,  max: 49999,  next: 50000,  cashback: 7,    dailyBonus: 2000, color: '#f4c430', icon: '🥇' },
      { name: 'Platinum', min: 50000,  max: Infinity, next: null, cashback: 15,   dailyBonus: 5000, color: '#e5e4e2', icon: '💎' },
    ];

    const tier = TIERS.find(t => totalBet >= t.min && (t.max === Infinity || totalBet <= t.max)) ?? TIERS[0]!;
    const nextTier = tier.next ? TIERS.find(t => t.min === tier.next) ?? null : null;
    const progressPct = tier.next
      ? Math.min(100, Math.round(((totalBet - tier.min) / (tier.next - tier.min)) * 100))
      : 100;

    return {
      tier: tier.name,
      tierIcon: tier.icon,
      tierColor: tier.color,
      totalBetVcoin: Math.round(totalBet),
      totalSpins: agg._count.id,
      progressPct,
      vcoinToNextTier: tier.next ? Math.max(0, Math.round(tier.next - totalBet)) : 0,
      nextTierName: nextTier?.name ?? null,
      benefits: {
        cashbackPct: tier.cashback,
        dailyBonusVcoin: tier.dailyBonus,
      },
      allTiers: TIERS.map(t => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        minBet: t.min,
        cashback: t.cashback,
        dailyBonus: t.dailyBonus,
        unlocked: totalBet >= t.min,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Username already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { username: dto.username },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });
  }
}
