import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../database';

const hasDb = !!process.env['DATABASE_URL'];

describe.skipIf(!hasDb)('LeaderboardService integration', () => {
  let prisma: PrismaService;
  let service: LeaderboardService;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new LeaderboardService(prisma);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.gameSession.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
  });

  async function createUserWithSessions(suffix: string, wins: number[]) {
    const ts = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `lb-test-${ts}-${suffix}@example.com`,
        username: `lb-user-${ts}-${suffix}`,
        passwordHash: 'irrelevant',
      },
    });
    await prisma.wallet.create({ data: { userId: user.id, balance: 1000 } });
    for (const win of wins) {
      await prisma.gameSession.create({
        data: {
          userId: user.id,
          gameType: 'neon-palace',
          betAmount: 10,
          winAmount: win,
          result: {},
          serverSeed: `seed-${Math.random()}`,
          nonce: 1,
        },
      });
    }
    createdUserIds.push(user.id);
    return user;
  }

  it('returns entries ordered by total win descending', async () => {
    const userA = await createUserWithSessions('a', [100, 200]);
    const userB = await createUserWithSessions('b', [500]);

    const results = await service.getTopPlayers();
    const ids = results.map((r) => r.userId);
    const posA = ids.indexOf(userA.id);
    const posB = ids.indexOf(userB.id);

    expect(posB).toBeGreaterThanOrEqual(0);
    expect(posA).toBeGreaterThanOrEqual(0);
    expect(posB).toBeLessThan(posA);
  });

  it('returns correct totalWon and totalSpins', async () => {
    const user = await createUserWithSessions('totals', [50, 150]);
    const results = await service.getTopPlayers();
    const entry = results.find((r) => r.userId === user.id);
    expect(entry).toBeDefined();
    expect(parseFloat(entry!.totalWon)).toBeCloseTo(200, 1);
    expect(entry!.totalSpins).toBe(2);
  });

  it('returns empty array when no sessions exist for a gameType filter', async () => {
    const results = await service.getTopPlayers('nonexistent-game');
    expect(results).toEqual([]);
  });
});
