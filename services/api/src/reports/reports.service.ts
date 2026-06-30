import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinanceReport(from: Date, to: Date) {
    const [aggResult, dailyRows, gameRows, playerRows, walletCount] = await Promise.all([
      this.prisma.gameSession.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { betAmount: true, winAmount: true },
        _count: { id: true },
      }),
      this.prisma.$queryRaw<{ day: string; bets: number; wins: number; sessions: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
          COALESCE(SUM("betAmount")::numeric, 0) AS bets,
          COALESCE(SUM("winAmount")::numeric, 0) AS wins,
          COUNT(id) AS sessions
        FROM "GameSession"
        WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY DATE_TRUNC('day', "createdAt") ASC
      `,
      this.prisma.$queryRaw<{ gameType: string; bets: number; wins: number; sessions: number }[]>`
        SELECT
          "gameType",
          COALESCE(SUM("betAmount")::numeric, 0) AS bets,
          COALESCE(SUM("winAmount")::numeric, 0) AS wins,
          COUNT(id) AS sessions
        FROM "GameSession"
        WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        GROUP BY "gameType"
        ORDER BY SUM("betAmount") DESC
      `,
      this.prisma.$queryRaw<{ userId: string; username: string; bets: number; wins: number; sessions: number }[]>`
        SELECT
          gs."userId",
          u."username",
          COALESCE(SUM(gs."betAmount")::numeric, 0) AS bets,
          COALESCE(SUM(gs."winAmount")::numeric, 0) AS wins,
          COUNT(gs.id) AS sessions
        FROM "GameSession" gs
        JOIN "User" u ON u.id = gs."userId"
        WHERE gs."createdAt" >= ${from} AND gs."createdAt" <= ${to}
        GROUP BY gs."userId", u."username"
        ORDER BY SUM(gs."betAmount") DESC
        LIMIT 10
      `,
      this.prisma.wallet.count(),
    ]);

    const totalBets = Number(aggResult._sum.betAmount ?? 0);
    const totalWins = Number(aggResult._sum.winAmount ?? 0);
    const ggr = totalBets - totalWins;
    const rtp = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
    const ngr = ggr * 0.85;

    const daily = dailyRows.map(r => ({
      day: r.day,
      bets: Number(r.bets),
      wins: Number(r.wins),
      ggr: Number(r.bets) - Number(r.wins),
      sessions: Number(r.sessions),
    }));

    const games = gameRows.map(r => ({
      gameType: r.gameType,
      bets: Number(r.bets),
      wins: Number(r.wins),
      ggr: Number(r.bets) - Number(r.wins),
      sessions: Number(r.sessions),
      rtp: Number(r.bets) > 0 ? ((Number(r.wins) / Number(r.bets)) * 100).toFixed(2) : '0.00',
    }));

    const players = playerRows.map(r => ({
      userId: r.userId,
      username: r.username,
      bets: Number(r.bets),
      wins: Number(r.wins),
      ggr: Number(r.bets) - Number(r.wins),
      sessions: Number(r.sessions),
    }));

    return {
      summary: {
        totalBets: totalBets.toFixed(2),
        totalWins: totalWins.toFixed(2),
        ggr: ggr.toFixed(2),
        ngr: ngr.toFixed(2),
        rtp: rtp.toFixed(2),
        totalSessions: aggResult._count.id,
        totalWallets: walletCount,
      },
      daily,
      games,
      players,
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }
}
