import type { GameManifest, SimReport } from './types';
import { runSpin } from './spin';
import { playFreeSpinSession } from './freespins';
import { seededRng, type Rng } from './rng';

export interface SimOptions {
  spins: number;
  seed?: number;
  anteActive?: boolean;
}

/**
 * Monte Carlo RTP / volatility simulation. Deterministic under a fixed seed
 * so the CI gate is reproducible.
 */
export function simulate(manifest: GameManifest, opts: SimOptions): SimReport {
  const rng: Rng = seededRng(opts.seed ?? 1337);
  const betCost = 1 + (opts.anteActive ? (manifest.anteBet?.extraCostFraction ?? 0) : 0);

  let totalReturn = 0;
  let baseReturn = 0;
  let fsReturn = 0;
  let hits = 0;
  let triggers = 0;
  let maxWin = 0;
  let sumSq = 0;

  for (let i = 0; i < opts.spins; i++) {
    const result = runSpin(manifest, rng, { anteActive: opts.anteActive });
    let spinTotal = result.totalWin;
    baseReturn += result.totalWin;

    if (result.freeSpinsAwarded > 0) {
      triggers++;
      const session = playFreeSpinSession(manifest, result.freeSpinsAwarded, rng);
      fsReturn += session.accumulatedWin;
      spinTotal += session.accumulatedWin;
    }
    spinTotal = Math.min(spinTotal, manifest.maxWinMultiplier);

    totalReturn += spinTotal;
    if (spinTotal > 0) hits++;
    if (spinTotal > maxWin) maxWin = spinTotal;
    sumSq += spinTotal * spinTotal;
  }

  const spins = opts.spins;
  const mean = totalReturn / spins;
  const variance = Math.max(sumSq / spins - mean * mean, 0);
  const stdDev = Math.sqrt(variance);

  return {
    spins,
    rtp: mean / betCost,
    baseRtp: baseReturn / spins / betCost,
    freeSpinRtp: fsReturn / spins / betCost,
    hitFrequency: hits / spins,
    freeSpinTriggerRate: triggers / spins,
    maxWinObserved: maxWin,
    stdDev,
    volatilityClass: classifyVolatility(stdDev),
  };
}

function classifyVolatility(stdDev: number): SimReport['volatilityClass'] {
  if (stdDev < 3) return 'low';
  if (stdDev < 8) return 'medium';
  if (stdDev < 20) return 'high';
  return 'extreme';
}

/** Human-readable one-page report for the factory pipeline. */
export function formatReport(manifest: GameManifest, report: SimReport): string {
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
  const inBand =
    report.rtp >= manifest.targetRtp.min && report.rtp <= manifest.targetRtp.max
      ? 'PASS'
      : 'FAIL';
  return [
    `Game: ${manifest.gameName} (${manifest.gameId})`,
    `Spins: ${report.spins.toLocaleString()}  Seedless: no`,
    `RTP: ${pct(report.rtp)}  (base ${pct(report.baseRtp)} + free spins ${pct(report.freeSpinRtp)})`,
    `Target band: ${pct(manifest.targetRtp.min)}–${pct(manifest.targetRtp.max)}  → ${inBand}`,
    `Hit frequency: ${pct(report.hitFrequency)}`,
    `Free spin trigger: 1 in ${Math.round(1 / Math.max(report.freeSpinTriggerRate, 1e-9))}`,
    `Max win observed: ${report.maxWinObserved}x (cap ${manifest.maxWinMultiplier}x)`,
    `Std dev: ${report.stdDev.toFixed(2)}  → volatility: ${report.volatilityClass}`,
  ].join('\n');
}
