import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalWon: string;
  totalSpins: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopPlayers(gameType?: string, limit = 20): Promise<LeaderboardEntry[]> {
    const where = gameType ? { gameType } : {};

    const grouped = await this.prisma.gameSession.groupBy({
      by: ['userId'],
      where,
      _sum: { winAmount: true },
      _count: { id: true },
      orderBy: { _sum: { winAmount: 'desc' } },
      take: Math.min(limit, 100),
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const usernameMap = new Map(users.map((u) => [u.id, u.username]));

    return grouped.map((g, i) => ({
      rank: i + 1,
      userId: g.userId,
      username: usernameMap.get(g.userId) ?? 'Unknown',
      totalWon: (g._sum.winAmount ?? 0).toString(),
      totalSpins: g._count.id,
    }));
  }
}
