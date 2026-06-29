import type { RngProvider } from '@casino/rng';
import type { GameSession, SlotConfig, SpinResult } from './types';
import { spinReels } from './reel';
import { evaluateAllPaylines } from './win-evaluator';
import { evaluateScatter, evaluateBonus } from './scatter-handler';
import { computeSpinResult, validateBet } from './payout-engine';
import { applySpinResult, canSpin } from './game-session';

export interface SpinOutcome {
  readonly result: SpinResult;
  readonly updatedSession: GameSession;
}

export class GameLoop {
  private nonce = 0;

  constructor(
    private readonly rng: RngProvider,
    private readonly serverSeed: string = 'neon-palace-v1',
  ) {}

  spin(session: GameSession): SpinOutcome {
    if (!canSpin(session)) {
      throw new Error('Insufficient balance to spin');
    }

    const isFreeSpın = session.freeSpinsRemaining > 0;
    const bet = session.bet;

    if (!isFreeSpın) {
      const error = validateBet(bet, session.config);
      if (error) throw new RangeError(error);
    }

    const nonce = ++this.nonce;
    const rngSeed = `${this.serverSeed}:${nonce}`;

    const grid = spinReels(session.config.reels, this.rng);

    const totalBet = bet * session.config.paylines.length;
    const paylineWins = evaluateAllPaylines(grid, session.config.paylines, bet, session.config.payTable);
    const scatterWin = evaluateScatter(grid, totalBet, session.config.payTable);
    const bonusTrigger = evaluateBonus(grid, session.config.payTable);

    const result = computeSpinResult(
      grid,
      bet,
      isFreeSpın,
      paylineWins,
      scatterWin,
      bonusTrigger,
      rngSeed,
      nonce,
    );

    const updatedSession = applySpinResult(session, result);

    return { result, updatedSession };
  }

  resetNonce(): void {
    this.nonce = 0;
  }
}

export function createGameLoop(rng: RngProvider, serverSeed?: string): GameLoop {
  return new GameLoop(rng, serverSeed);
}

export function createDefaultConfig(config: SlotConfig): SlotConfig {
  return config;
}
