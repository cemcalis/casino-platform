import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CryptoRng } from '@casino/rng';
import { GameLoop, createSession, NEON_PALACE_CONFIG, SYM } from '@casino/slot-runtime';
import type { SpinResult } from '@casino/slot-runtime';
import { PrismaService } from '../database';
import type { SpinDto } from './dto/spin.dto';

const GAME_TYPE = 'neon-palace';
const JACKPOT_SEED = 10_000;
const JACKPOT_CONTRIBUTION_RATE = 0.01; // 1% of total bet per spin

export interface SpinApiResult extends SpinResult {
  jackpotWon: boolean;
  jackpotAmount: number | null;
}

// Five WILDs on the middle row (row index 1) trigger the jackpot
function isJackpotTrigger(grid: SpinResult['grid']): boolean {
  return grid.length === 5 && grid.every((col) => col[1] === SYM.WILD);
}

@Injectable()
export class GameService {
  private readonly gameLoop = new GameLoop(new CryptoRng());

  constructor(private readonly prisma: PrismaService) {}

  async spin(userId: string, dto: SpinDto): Promise<SpinApiResult> {
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
    const engineSession = createSession(NEON_PALACE_CONFIG, balance.toNumber());
    const { result } = this.gameLoop.spin({ ...engineSession, bet: dto.bet });

    // Ensure jackpot record exists and get current pool amount
    const jackpotRec = await this.prisma.jackpot.upsert({
      where: { gameType: GAME_TYPE },
      create: {
        gameType: GAME_TYPE,
        amount: new Prisma.Decimal(JACKPOT_SEED),
        seedAmount: new Prisma.Decimal(JACKPOT_SEED),
      },
      update: {},
    });
    const jackpotPoolAmount = jackpotRec.amount.toNumber();
    const jackpotSeedDec = jackpotRec.seedAmount;

    const jackpotTriggered = isJackpotTrigger(result.grid);
    const jackpotAward = jackpotTriggered ? jackpotPoolAmount : 0;
    const contribution = parseFloat((dto.bet * JACKPOT_CONTRIBUTION_RATE).toFixed(2));

    const betDec = new Prisma.Decimal(dto.bet);
    const payoutDec = new Prisma.Decimal(result.totalPayout);
    const jackpotDec = new Prisma.Decimal(jackpotAward);
    const balanceAfterBet = balance.sub(betDec);
    const balanceAfterPayout = balanceAfterBet.add(payoutDec);
    const newBalance = balanceAfterPayout.add(jackpotDec);

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
            balanceAfter: balanceAfterPayout,
            referenceId: result.rngSeed,
          },
        });
      }

      if (jackpotTriggered) {
        await tx.ledgerEntry.create({
          data: {
            userId,
            type: 'CREDIT',
            amount: jackpotDec,
            balanceBefore: balanceAfterPayout,
            balanceAfter: newBalance,
            referenceId: `jackpot:${result.rngSeed}`,
          },
        });
        // Reset jackpot pool to seed amount
        await tx.jackpot.update({
          where: { gameType: GAME_TYPE },
          data: { amount: jackpotSeedDec },
        });
      } else {
        // Grow jackpot pool by 1% of total bet
        await tx.jackpot.update({
          where: { gameType: GAME_TYPE },
          data: { amount: { increment: new Prisma.Decimal(contribution) } },
        });
      }

      await tx.gameSession.create({
        data: {
          userId,
          gameType: GAME_TYPE,
          betAmount: betDec,
          winAmount: newBalance.sub(balanceAfterBet),
          result: result as unknown as Prisma.InputJsonValue,
          serverSeed: result.rngSeed,
          nonce: result.nonce,
        },
      });
    });

    return {
      ...result,
      jackpotWon: jackpotTriggered,
      jackpotAmount: jackpotTriggered ? jackpotPoolAmount : null,
    };
  }

  async getJackpot(): Promise<{ amount: string; gameType: string }> {
    const record = await this.prisma.jackpot.upsert({
      where: { gameType: GAME_TYPE },
      create: {
        gameType: GAME_TYPE,
        amount: new Prisma.Decimal(JACKPOT_SEED),
        seedAmount: new Prisma.Decimal(JACKPOT_SEED),
      },
      update: {},
    });
    return { amount: record.amount.toFixed(2), gameType: record.gameType };
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
