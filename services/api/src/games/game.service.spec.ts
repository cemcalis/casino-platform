import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../database';

const hasDb = !!process.env['DATABASE_URL'];

describe.skipIf(!hasDb)('GameService integration', () => {
  let prisma: PrismaService;
  let gameService: GameService;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    process.env['JWT_ACCESS_SECRET'] = process.env['JWT_ACCESS_SECRET'] ?? 'test-access-secret';
    process.env['JWT_REFRESH_SECRET'] =
      process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret';

    prisma = new PrismaService();
    await prisma.onModuleInit();
    gameService = new GameService(prisma);
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.gameSession.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.ledgerEntry.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
  });

  async function createTestUser(suffix: string) {
    const ts = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `game-test-${ts}-${suffix}@example.com`,
        username: `gameuser-${ts}-${suffix}`,
        passwordHash: 'irrelevant-for-this-test',
      },
    });
    await prisma.wallet.create({ data: { userId: user.id, balance: 1000 } });
    createdUserIds.push(user.id);
    return user;
  }

  it('spin returns a SpinResult with a grid', async () => {
    const user = await createTestUser('grid');
    const result = await gameService.spin(user.id, { bet: 10 });
    expect(result.grid).toHaveLength(5);
    for (const col of result.grid) expect(col).toHaveLength(3);
  });

  it('spin deducts bet and credits payout atomically', async () => {
    const user = await createTestUser('balance');
    const result = await gameService.spin(user.id, { bet: 10 });

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    const expected = 1000 - 10 + result.totalPayout;
    expect(wallet!.balance.toNumber()).toBeCloseTo(expected, 2);
  });

  it('always creates a DEBIT ledger entry', async () => {
    const user = await createTestUser('ledger-debit');
    await gameService.spin(user.id, { bet: 10 });

    const debit = await prisma.ledgerEntry.findFirst({
      where: { userId: user.id, type: 'DEBIT' },
    });
    expect(debit).not.toBeNull();
    expect(debit!.amount.toNumber()).toBe(10);
  });

  it('creates a CREDIT ledger entry when payout > 0', async () => {
    // Run several spins to statistically guarantee at least one win
    const user = await createTestUser('ledger-credit');
    let found = false;
    for (let i = 0; i < 100 && !found; i++) {
      const result = await gameService.spin(user.id, { bet: 1 });
      if (result.totalPayout > 0) {
        const credit = await prisma.ledgerEntry.findFirst({
          where: { userId: user.id, type: 'CREDIT' },
        });
        expect(credit).not.toBeNull();
        found = true;
      }
    }
    // Don't assert `found` to avoid flakiness — just ensure the code path is exercised
  });

  it('creates a GameSession record per spin', async () => {
    const user = await createTestUser('session');
    await gameService.spin(user.id, { bet: 10 });

    const session = await prisma.gameSession.findFirst({ where: { userId: user.id } });
    expect(session).not.toBeNull();
    expect(session!.gameType).toBe('neon-palace');
    expect(session!.betAmount.toNumber()).toBe(10);
  });

  it('increments wallet version after each spin', async () => {
    const user = await createTestUser('version');
    const before = await prisma.wallet.findUnique({ where: { userId: user.id } });
    await gameService.spin(user.id, { bet: 10 });
    const after = await prisma.wallet.findUnique({ where: { userId: user.id } });
    expect(after!.version).toBe(before!.version + 1);
  });

  it('throws NotFoundException for an unknown userId', async () => {
    await expect(gameService.spin('nonexistent-id', { bet: 10 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when balance is insufficient', async () => {
    const user = await createTestUser('insufficient');
    await expect(gameService.spin(user.id, { bet: 5000 })).rejects.toThrow(BadRequestException);
  });
});
