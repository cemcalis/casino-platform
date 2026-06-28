import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database';

// Skip the entire suite when no real database is available.
// Set DATABASE_URL to run locally against a seeded test Postgres instance.
const hasDb = !!process.env['DATABASE_URL'];

describe.skipIf(!hasDb)('AuthService integration', () => {
  let prisma: PrismaService;
  let authService: AuthService;

  // Track created user IDs so we can clean them up precisely
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    // Ensure JWT secrets are available for token signing
    process.env['JWT_ACCESS_SECRET'] = process.env['JWT_ACCESS_SECRET'] ?? 'test-access-secret';
    process.env['JWT_REFRESH_SECRET'] =
      process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret';

    prisma = new PrismaService();
    await prisma.onModuleInit();
    authService = new AuthService(prisma);
  });

  afterAll(async () => {
    // Delete wallets first (FK constraint), then users
    if (createdUserIds.length > 0) {
      await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.onModuleDestroy();
  });

  /** Helper: register a fresh user and track their ID for cleanup. */
  async function registerFresh(suffix: string) {
    const ts = Date.now();
    const dto = {
      email: `test-${ts}-${suffix}@example.com`,
      username: `user-${ts}-${suffix}`,
      password: 'StrongPass1!',
    };
    const tokens = await authService.register(dto);
    // Retrieve the created user so we can record the ID
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (user) createdUserIds.push(user.id);
    return { dto, tokens, user };
  }

  describe('register', () => {
    it('creates a user and returns accessToken + refreshToken', async () => {
      const { tokens } = await registerFresh('reg-basic');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.split('.').length).toBe(3);
      expect(tokens.refreshToken.split('.').length).toBe(3);
    });

    it('creates a wallet for the new user', async () => {
      const { user } = await registerFresh('reg-wallet');
      expect(user).not.toBeNull();
      const wallet = await prisma.wallet.findUnique({ where: { userId: user!.id } });
      expect(wallet).not.toBeNull();
    });

    it('throws ConflictException for a duplicate email', async () => {
      const { dto } = await registerFresh('reg-dup');
      await expect(
        authService.register({
          email: dto.email,
          username: `different-username-${Date.now()}`,
          password: 'AnotherPass1!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException for a duplicate username', async () => {
      const { dto } = await registerFresh('reg-dup-uname');
      await expect(
        authService.register({
          email: `different-${Date.now()}@example.com`,
          username: dto.username,
          password: 'AnotherPass1!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const { dto } = await registerFresh('login-ok');
      const tokens = await authService.login({ email: dto.email, password: dto.password });
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      const { dto } = await registerFresh('login-bad-pw');
      await expect(
        authService.login({ email: dto.email, password: 'WrongPassword99!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for a non-existent email', async () => {
      await expect(
        authService.login({ email: `nobody-${Date.now()}@example.com`, password: 'Any1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshFromToken', () => {
    it('returns a new token pair when presented with a valid refresh token', async () => {
      const { tokens } = await registerFresh('refresh-ok');
      const newTokens = await authService.refreshFromToken(tokens.refreshToken);
      expect(typeof newTokens.accessToken).toBe('string');
      expect(typeof newTokens.refreshToken).toBe('string');
    });

    it('throws UnauthorizedException when the refresh token has already been rotated', async () => {
      const { tokens } = await registerFresh('refresh-reuse');
      // First use — valid, rotates the stored hash
      await authService.refreshFromToken(tokens.refreshToken);
      // Second use of the same token — hash no longer matches
      await expect(
        authService.refreshFromToken(tokens.refreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for a completely invalid token string', async () => {
      await expect(
        authService.refreshFromToken('not-a-valid-jwt'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logoutFromToken', () => {
    it('clears refreshTokenHash in the DB', async () => {
      const { tokens, user } = await registerFresh('logout-ok');
      await authService.logoutFromToken(tokens.refreshToken);

      const updated = await prisma.user.findUnique({ where: { id: user!.id } });
      expect(updated?.refreshTokenHash).toBeNull();
    });

    it('throws UnauthorizedException for an invalid token on logout', async () => {
      await expect(
        authService.logoutFromToken('garbage'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
