import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  async listPlayers(search: string, status: string, page: number, pageSize: number) {
    const where = {
      role: 'PLAYER' as const,
      ...(search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
      ...(status === 'banned' ? { isBanned: true } : status === 'active' ? { isBanned: false } : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, username: true, isBanned: true,
          bannedAt: true, lastLogin: true, createdAt: true,
          wallet: { select: { balance: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      players: users.map(u => ({
        ...u,
        balance: u.wallet?.balance.toFixed(2) ?? '0.00',
        wallet: undefined,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getPlayerDetail(playerId: string) {
    const [user, agg] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: playerId },
        select: {
          id: true, email: true, username: true, role: true,
          isBanned: true, bannedAt: true, lastLogin: true, createdAt: true,
          wallet: { select: { balance: true } },
        },
      }),
      this.prisma.gameSession.aggregate({
        where: { userId: playerId },
        _count: { id: true },
        _sum: { betAmount: true, winAmount: true },
      }),
    ]);
    if (!user) throw new NotFoundException('Player not found');

    const totalBet = Number(agg._sum.betAmount ?? 0);
    const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const THRESHOLDS = [0, 1000, 10000, 50000];
    const tierIdx = THRESHOLDS.filter(t => totalBet >= t).length - 1;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      balance: user.wallet?.balance.toFixed(2) ?? '0.00',
      totalBet: agg._sum.betAmount?.toString() ?? '0',
      totalWon: agg._sum.winAmount?.toString() ?? '0',
      totalSpins: agg._count.id,
      vipTier: TIERS[tierIdx] ?? 'Bronze',
    };
  }

  async banPlayer(playerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: playerId }, select: { isBanned: true, role: true } });
    if (!user) throw new NotFoundException('Player not found');
    if (user.role !== 'PLAYER') throw new BadRequestException('Cannot ban non-player accounts');
    if (user.isBanned) throw new BadRequestException('Player is already banned');
    return this.prisma.user.update({
      where: { id: playerId },
      data: { isBanned: true, bannedAt: new Date() },
      select: { id: true, isBanned: true, bannedAt: true },
    });
  }

  async unbanPlayer(playerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: playerId }, select: { isBanned: true } });
    if (!user) throw new NotFoundException('Player not found');
    if (!user.isBanned) throw new BadRequestException('Player is not banned');
    return this.prisma.user.update({
      where: { id: playerId },
      data: { isBanned: false, bannedAt: null },
      select: { id: true, isBanned: true, bannedAt: true },
    });
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
