import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from '@casino/auth';
import { PrismaService } from '../database';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email: dto.email, username: dto.username, passwordHash },
      });
      await tx.wallet.create({ data: { userId: u.id } });
      return u;
    });

    return this.signTokensAndStore(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signTokensAndStore(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto) {
    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(dto.refreshToken, 'refresh');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Session expired');

    const valid = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token reuse detected');

    return this.signTokensAndStore(user.id, user.email, user.role);
  }

  async logout(dto: RefreshDto) {
    let payload: ReturnType<typeof verifyToken>;
    try {
      payload = verifyToken(dto.refreshToken, 'refresh');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.user.updateMany({
      where: { id: payload.sub },
      data: { refreshTokenHash: null },
    });

    return { success: true };
  }

  private async signTokensAndStore(userId: string, email: string, role: string) {
    const base = { sub: userId, email, role };
    const accessToken = signAccessToken(base);
    const refreshToken = signRefreshToken(base);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }
}
