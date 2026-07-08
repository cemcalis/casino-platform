import type { Rng } from './rng';

/**
 * Crash-game math. The crash point is drawn so that for ANY fixed cash-out
 * target m, the expected return is exactly (1 - houseEdge):
 *
 *   P(crash >= m) = (1 - houseEdge) / m   →   EV = m · P = 1 - houseEdge
 *
 * Sampled via inverse transform on U ~ uniform(0,1):
 *   crash = (1 - houseEdge) / (1 - U), floored to 1.00 and capped.
 */

export interface CrashConfig {
  /** House edge as a fraction, e.g. 0.04 → 96% RTP for every strategy. */
  houseEdge: number;
  /** Hard cap so the multiplier display can't run away. */
  maxMultiplier: number;
}

export const defaultCrashConfig: CrashConfig = {
  houseEdge: 0.04,
  maxMultiplier: 5000,
};

/** Draw one crash point (multiplier at which the round busts). */
export function drawCrashPoint(config: CrashConfig, rng: Rng): number {
  const u = rng.next();
  const raw = (1 - config.houseEdge) / (1 - u);
  const point = Math.min(config.maxMultiplier, Math.max(1, raw));
  return Math.floor(point * 100) / 100;
}

/** Multiplier displayed at t milliseconds into the round (exponential ramp). */
export function multiplierAt(elapsedMs: number): number {
  return Math.floor(Math.exp(elapsedMs / 1000 * 0.12) * 100) / 100;
}

/** Inverse of multiplierAt — when a given multiplier is reached, in ms. */
export function timeToReach(multiplier: number): number {
  return (Math.log(multiplier) / 0.12) * 1000;
}

export interface CrashSimReport {
  rounds: number;
  rtp: number;
  medianCrash: number;
  bustRate: number;
}

/**
 * Monte Carlo check: player always cashes out at `target`.
 * RTP must equal (1 - houseEdge) regardless of target.
 */
export function simulateCrash(
  config: CrashConfig,
  rounds: number,
  target: number,
  rng: Rng,
): CrashSimReport {
  let paid = 0;
  let busts = 0;
  const points: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const crash = drawCrashPoint(config, rng);
    points.push(crash);
    if (crash >= target) paid += target;
    else busts++;
  }
  points.sort((a, b) => a - b);
  return {
    rounds,
    rtp: paid / rounds,
    medianCrash: points[Math.floor(rounds / 2)],
    bustRate: busts / rounds,
  };
}
