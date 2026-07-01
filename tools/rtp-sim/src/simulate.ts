import { SeededRng } from '@casino/rng';
import {
  createGameLoop,
  createSession,
  canSpin,
  setBet,
  type SlotConfig,
} from '@casino/slot-runtime';
import { classifyVolatility, describe, type VolatilityClass } from './stats';

export interface SimulationOptions {
  readonly config: SlotConfig;
  readonly gameId: string;
  readonly spins: number;
  readonly bet?: number;
  readonly seed?: string;
}

export interface PaylineStat {
  readonly paylineIndex: number;
  readonly hitCount: number;
  readonly totalPayout: number;
}

export interface SymbolStat {
  readonly symbolId: string;
  readonly hitCount: number;
  readonly totalPayout: number;
}

export interface MaxWinSample {
  readonly spinIndex: number;
  readonly payout: number;
  readonly multiplier: number;
}

export interface SimulationResult {
  readonly gameId: string;
  readonly spins: number;
  readonly bet: number;
  readonly seed: string;
  readonly totalWagered: number;
  readonly totalPayout: number;
  readonly rtp: number;
  readonly hitCount: number;
  readonly hitFrequency: number;
  readonly averagePayoutMultiplier: number;
  readonly variance: number;
  readonly standardDeviation: number;
  readonly volatilityIndex: number;
  readonly volatilityClass: VolatilityClass;
  readonly maxWin: MaxWinSample | null;
  readonly scatterTriggerCount: number;
  readonly scatterTriggerFrequency: number;
  readonly freeSpinsAwardedTotal: number;
  readonly averageFreeSpinsPerTrigger: number;
  readonly bonusTriggerCount: number;
  readonly bonusTriggerFrequency: number;
  readonly paylineStats: readonly PaylineStat[];
  readonly symbolStats: readonly SymbolStat[];
  readonly durationMs: number;
}

// Large synthetic bankroll so canSpin() never blocks the run — this tool measures
// long-run math (RTP/volatility/hit-frequency), not bankroll survival.
const SIMULATION_BANKROLL = 1e15;

export function runMonteCarloSimulation(options: SimulationOptions): SimulationResult {
  const { config, gameId, spins } = options;
  if (!Number.isInteger(spins) || spins <= 0) {
    throw new RangeError('spins must be a positive integer');
  }

  const bet = options.bet ?? config.defaultBet;
  const seed = options.seed ?? `rtp-sim:${gameId}:${Date.now()}`;

  let session = setBet(createSession(config, SIMULATION_BANKROLL), bet);
  const rng = new SeededRng(seed);
  const loop = createGameLoop(rng, seed);

  const multipliers: number[] = [];
  const paylineStatsMap = new Map<number, { hitCount: number; totalPayout: number }>();
  const symbolStatsMap = new Map<string, { hitCount: number; totalPayout: number }>();

  let totalWagered = 0;
  let totalPayout = 0;
  let hitCount = 0;
  let scatterTriggerCount = 0;
  let freeSpinsAwardedTotal = 0;
  let bonusTriggerCount = 0;
  let maxWin: MaxWinSample | null = null;

  const start = Date.now();

  for (let i = 0; i < spins; i++) {
    if (!canSpin(session)) break;

    const { result, updatedSession } = loop.spin(session);
    session = updatedSession;

    // Cost of a spin is the bet staked across every active payline (matching how the
    // engine itself prices scatter wins via `bet * paylines.length` in GameLoop), not
    // just the per-line bet — the session's own wallet debit undercounts this, which is
    // a wallet/session concern out of scope for this math-only simulator to fix.
    const stakePerSpin = result.bet * config.paylines.length;
    const staked = result.isFreeSpins ? 0 : stakePerSpin;
    totalWagered += staked;
    totalPayout += result.totalPayout;
    multipliers.push(stakePerSpin > 0 ? result.totalPayout / stakePerSpin : 0);

    if (result.totalPayout > 0) hitCount++;

    for (const win of result.paylineWins) {
      const p = paylineStatsMap.get(win.paylineIndex) ?? { hitCount: 0, totalPayout: 0 };
      p.hitCount++;
      p.totalPayout += win.payout;
      paylineStatsMap.set(win.paylineIndex, p);

      const s = symbolStatsMap.get(win.symbolId as string) ?? { hitCount: 0, totalPayout: 0 };
      s.hitCount++;
      s.totalPayout += win.payout;
      symbolStatsMap.set(win.symbolId as string, s);
    }

    if (result.scatterWin) {
      scatterTriggerCount++;
      freeSpinsAwardedTotal += result.scatterWin.freeSpinsAwarded;
    }
    if (result.bonusTrigger) bonusTriggerCount++;

    if (maxWin === null || result.totalPayout > maxWin.payout) {
      maxWin = {
        spinIndex: i,
        payout: result.totalPayout,
        multiplier: stakePerSpin > 0 ? result.totalPayout / stakePerSpin : 0,
      };
    }
  }

  const executedSpins = multipliers.length;
  const stats = describe(multipliers);

  const paylineStats: PaylineStat[] = [...paylineStatsMap.entries()]
    .map(([paylineIndex, v]) => ({ paylineIndex, ...v }))
    .sort((a, b) => a.paylineIndex - b.paylineIndex);

  const symbolStats: SymbolStat[] = [...symbolStatsMap.entries()]
    .map(([symbolId, v]) => ({ symbolId, ...v }))
    .sort((a, b) => b.totalPayout - a.totalPayout);

  return {
    gameId,
    spins: executedSpins,
    bet,
    seed,
    totalWagered,
    totalPayout,
    rtp: totalWagered > 0 ? totalPayout / totalWagered : 0,
    hitCount,
    hitFrequency: executedSpins > 0 ? hitCount / executedSpins : 0,
    averagePayoutMultiplier: stats.mean,
    variance: stats.variance,
    standardDeviation: stats.standardDeviation,
    volatilityIndex: stats.standardDeviation,
    volatilityClass: classifyVolatility(stats.standardDeviation),
    maxWin,
    scatterTriggerCount,
    scatterTriggerFrequency: executedSpins > 0 ? scatterTriggerCount / executedSpins : 0,
    freeSpinsAwardedTotal,
    averageFreeSpinsPerTrigger:
      scatterTriggerCount > 0 ? freeSpinsAwardedTotal / scatterTriggerCount : 0,
    bonusTriggerCount,
    bonusTriggerFrequency: executedSpins > 0 ? bonusTriggerCount / executedSpins : 0,
    paylineStats,
    symbolStats,
    durationMs: Date.now() - start,
  };
}
