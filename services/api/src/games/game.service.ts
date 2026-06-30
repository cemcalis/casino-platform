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

  async spin(userId: string, dto: SpinDto): Promise<SpinResult> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true, version: true },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const balance = wallet.balance;
    if (balance.toNumber() < dto.bet) {
      throw new BadRequestException('Insufficient balance');
    }

    // Compute spin result before the transaction — pure, no DB side effects
    // dto.bet is the player's total bet per spin; engine receives per-payline bet
    const paylineCount = NEON_PALACE_CONFIG.paylines.length;
    const betPerLine = dto.bet / paylineCount;
    const engineSession = createSession(NEON_PALACE_CONFIG, balance.toNumber());
    const { result } = this.gameLoop.spin({ ...engineSession, bet: betPerLine });

    const betDec = new Prisma.Decimal(dto.bet);
    const payoutDec = new Prisma.Decimal(result.totalPayout);
    const balanceAfterBet = balance.sub(betDec);
    const newBalance = balanceAfterBet.add(payoutDec);

    await this.prisma.$transaction(async (tx) => {
      // Optimistic lock — rejects if wallet was updated by a concurrent request
      const { count } = await tx.wallet.updateMany({
        where: { userId, version: wallet.version },
        data: { balance: newBalance, version: { increment: 1 } },
      });
      if (count === 0) {
        throw new ConflictException('Concurrent modification — please retry');
      }

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
          betAmount: betDec,
          winAmount: payoutDec,
          result: result as unknown as Prisma.InputJsonValue,
          serverSeed: result.rngSeed,
          nonce: result.nonce,
        },
      });
    });

    return result;
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
