import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../database';
import { AuthService } from '../auth/auth.service';
import { verifyToken } from '@casino/auth';

const hasDb = !!process.env['DATABASE_URL'];

describe.skipIf(!hasDb)('WalletService integration', () => {
  let prisma: PrismaService;
  let walletService: WalletService;
  let userId: string;

  beforeAll(async () => {
    process.env['JWT_ACCESS_SECRET'] =
      process.env['JWT_ACCESS_SECRET'] ?? 'test-access-secret-32-chars-long!!';
    process.env['JWT_REFRESH_SECRET'] =
      process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-32-chars-long!';

    prisma = new PrismaService();
    await prisma.onModuleInit();
    walletService = new WalletService(prisma);

    const authService = new AuthService(prisma);
    const ts = Date.now();
    const result = await authService.register({
      email: `wallet-test-${ts}@example.com`,
      username: `wlttest${ts}`.slice(0, 20),
      password: 'Password123!',
    });

    const payload = verifyToken(result.accessToken, 'access');
    userId = payload.sub;
  });

  afterAll(async () => {
    await prisma.wallet.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  it('getWallet returns balance as fixed-precision string', async () => {
    const wallet = await walletService.getWallet(userId);
    expect(wallet.id).toBeDefined();
    // Decimal values stored via Prisma are serialised to a fixed-2 string by the service
    expect(wallet.balance).toMatch(/^\d+\.\d{2}$/);
    expect(wallet.updatedAt).toBeInstanceOf(Date);
  });

  it('getWallet throws NotFoundException for unknown user', async () => {
    await expect(walletService.getWallet('nonexistent-id')).rejects.toThrow(NotFoundException);
  });
});
