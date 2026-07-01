export interface DescriptiveStats {
  readonly count: number;
  readonly mean: number;
  readonly variance: number;
  readonly standardDeviation: number;
}

export function describe(values: readonly number[]): DescriptiveStats {
  const count = values.length;
  if (count === 0) {
    return { count: 0, mean: 0, variance: 0, standardDeviation: 0 };
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / count;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / count;
  return { count, mean, variance, standardDeviation: Math.sqrt(variance) };
}

export type VolatilityClass = 'low' | 'medium' | 'high';

// Heuristic 3-grade bucketing of the standard deviation of per-spin payout multiplier,
// loosely modelled on the volatility-index grading used by reel-scanning tools — not a
// certified industry standard, just a useful signal for comparing games in this repo.
export function classifyVolatility(volatilityIndex: number): VolatilityClass {
  if (volatilityIndex < 3) return 'low';
  if (volatilityIndex < 8) return 'medium';
  return 'high';
}
