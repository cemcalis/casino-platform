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
