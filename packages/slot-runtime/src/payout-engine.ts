import type { PaylineWin, ScatterWin, SpinResult, SymbolGrid, SlotConfig } from './types';
import type { BonusTrigger } from './types';

export function computeSpinResult(
  grid: SymbolGrid,
  bet: number,
  isFreeSpın: boolean,
  paylineWins: ReadonlyArray<PaylineWin>,
  scatterWin: ScatterWin | null,
  bonusTrigger: BonusTrigger | null,
  rngSeed: string,
  nonce: number,
): SpinResult {
  const totalPaylinesPayout = paylineWins.reduce((sum, w) => sum + w.payout, 0);
  const scatterPayout = scatterWin?.payout ?? 0;
  const totalPayout = totalPaylinesPayout + scatterPayout;
  const betDeducted = isFreeSpın ? 0 : bet;
  const netResult = totalPayout - betDeducted;
  const freeSpinsAwarded = scatterWin?.freeSpinsAwarded ?? 0;
  const multiplier = bet > 0 ? totalPayout / bet : 0;

  return {
    grid,
    bet,
    isFreeSpın,
    paylineWins,
    scatterWin,
    bonusTrigger,
    totalPaylinesPayout,
    totalPayout,
    netResult,
    freeSpinsAwarded,
    multiplier,
    payoutVirtualCoins: totalPayout,
    rngSeed,
    nonce,
  };
}

export function validateBet(bet: number, config: SlotConfig): string | null {
  if (!Number.isFinite(bet) || bet <= 0) return 'Bet must be a positive number';
  if (bet < config.minBet) return `Bet below minimum (${config.minBet})`;
  if (bet > config.maxBet) return `Bet exceeds maximum (${config.maxBet})`;
  return null;
}
