import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CryptoRng } from '@casino/rng';
import { GameLoop, createSession, NEON_PALACE_CONFIG } from '@casino/slot-runtime';
import type { SpinResult } from '@casino/slot-runtime';
import { PrismaService } from '../database';
import type { SpinDto } from './dto/spin.dto';

const GAME_TYPE = 'neon-palace';

@Injectable()
export class GameService {
  private readonly gameLoop = new GameLoop(new CryptoRng());

  constructor(private readonly prisma: PrismaService) {}

  async spin(userId: string, dto: SpinDto): Promise<SpinResult & { freeSpinsRemaining: number }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const balance = wallet.balance;
    const currentFreeSpins = wallet.freeSpinsRemaining;
    const isFreeSpinRound = currentFreeSpins > 0;

    if (!isFreeSpinRound && balance.toNumber() < dto.bet) {
      throw new BadRequestException('Insufficient balance');
    }

    // Build engine session with current free spin state so GameLoop sets isFreeSpins correctly
    const engineSession = createSession(NEON_PALACE_CONFIG, balance.toNumber());
    const sessionWithFreeSpins = { ...engineSession, bet: dto.bet, freeSpinsRemaining: currentFreeSpins };
    const { result } = this.gameLoop.spin(sessionWithFreeSpins);

    const betDec = new Prisma.Decimal(dto.bet);
    const payoutDec = new Prisma.Decimal(result.totalPayout);

    // Free spin round: no bet deduction
    const balanceAfterBet = isFreeSpinRound ? balance : balance.sub(betDec);
    const newBalance = balanceAfterBet.add(payoutDec);

    // Free spins counter: decrement for this spin, then add any newly awarded spins
    const newFreeSpins = Math.max(0, currentFreeSpins - (isFreeSpinRound ? 1 : 0)) + result.freeSpinsAwarded;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.wallet.updateMany({
        where: { userId, version: wallet.version },
        data: {
          balance: newBalance,
          freeSpinsRemaining: newFreeSpins,
          version: { increment: 1 },
        },
      });
      if (count === 0) {
        throw new ConflictException('Concurrent modification — please retry');
      }

      if (!isFreeSpinRound) {
        await tx.ledgerEntry.create({
          data: {
            userId,
            type: 'DEBIT',
            amount: betDec,
            balanceBefore: balance,
            balanceAfter: balanceAfterBet,
            referenceId: result.rngSeed,
          },
        });
      }

      if (result.totalPayout > 0) {
        await tx.ledgerEntry.create({
          data: {
            userId,
            type: 'CREDIT',
            amount: payoutDec,
            balanceBefore: balanceAfterBet,
            balanceAfter: newBalance,
            referenceId: result.rngSeed,
          },
        });
      }

      await tx.gameSession.create({
        data: {
          userId,
          gameType: GAME_TYPE,
          betAmount: isFreeSpinRound ? new Prisma.Decimal(0) : betDec,
          winAmount: payoutDec,
          result: result as unknown as Prisma.InputJsonValue,
          serverSeed: result.rngSeed,
          nonce: result.nonce,
        },
      });
    });

    return { ...result, freeSpinsRemaining: newFreeSpins };
  }

  async getHistory(userId: string, page: number, pageSize: number) {
    const [sessions, total] = await this.prisma.$transaction([
      this.prisma.gameSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          gameType: true,
          betAmount: true,
          winAmount: true,
          serverSeed: true,
          nonce: true,
          createdAt: true,
        },
      }),
      this.prisma.gameSession.count({ where: { userId } }),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        gameType: s.gameType,
        betAmount: s.betAmount.toFixed(2),
        winAmount: s.winAmount.toFixed(2),
        serverSeed: s.serverSeed,
        nonce: s.nonce,
        createdAt: s.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
