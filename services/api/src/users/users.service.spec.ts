import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../database';
import { AuthService } from '../auth/auth.service';
import { verifyToken } from '@casino/auth';

const hasDb = !!process.env['DATABASE_URL'];

describe.skipIf(!hasDb)('UsersService integration', () => {
  let prisma: PrismaService;
  let usersService: UsersService;
  let userId: string;

  beforeAll(async () => {
    process.env['JWT_ACCESS_SECRET'] =
      process.env['JWT_ACCESS_SECRET'] ?? 'test-access-secret-32-chars-long!!';
    process.env['JWT_REFRESH_SECRET'] =
      process.env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-32-chars-long!';

    prisma = new PrismaService();
    await prisma.onModuleInit();
    usersService = new UsersService(prisma);

    const authService = new AuthService(prisma);
    const ts = Date.now();
    const result = await authService.register({
      email: `users-test-${ts}@example.com`,
      username: `usrtest${ts}`.slice(0, 20),
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

  it('getProfile returns user without sensitive fields', async () => {
    const profile = await usersService.getProfile(userId);
    expect(profile.id).toBe(userId);
    expect(profile.email).toContain('@example.com');
    expect(profile).not.toHaveProperty('passwordHash');
    expect(profile).not.toHaveProperty('refreshTokenHash');
  });

  it('getProfile throws NotFoundException for unknown user', async () => {
    await expect(usersService.getProfile('nonexistent-id')).rejects.toThrow(NotFoundException);
  });

  it('updateProfile changes username', async () => {
    const newUsername = `updated${Date.now()}`.slice(0, 20);
    const updated = await usersService.updateProfile(userId, { username: newUsername });
    expect(updated.username).toBe(newUsername);
  });

  it('updateProfile throws ConflictException for taken username', async () => {
    // The current user owns their username; trying to claim it from a different user ID
    // triggers the duplicate-username check in updateProfile.
    const profile = await usersService.getProfile(userId);
    await expect(
      usersService.updateProfile('different-user-id', { username: profile.username }),
    ).rejects.toThrow(ConflictException);
  });
});
