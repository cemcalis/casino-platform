import type { RngProvider } from './types';

// Fisher-Yates shuffle — produces a uniformly random permutation
export function shuffle<T>(arr: ReadonlyArray<T>, rng: RngProvider): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

// Weighted random selection — selects one item proportional to its weight
export function pickWeighted<T>(
  items: ReadonlyArray<{ item: T; weight: number }>,
  rng: RngProvider,
): T {
  if (items.length === 0) throw new RangeError('items must not be empty');
  const total = items.reduce((sum, { weight }) => sum + weight, 0);
  if (total <= 0) throw new RangeError('total weight must be positive');

  let r = rng.next() * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r < 0) return item;
  }
  // Guard against floating-point edge case: r is extremely close to 0
  return items[items.length - 1]!.item;
}

// Reservoir sampling without replacement
export function sampleWithoutReplacement<T>(
  population: ReadonlyArray<T>,
  count: number,
  rng: RngProvider,
): T[] {
  if (count < 0) throw new RangeError('count must be non-negative');
  if (count > population.length) {
    throw new RangeError(`count (${count}) exceeds population size (${population.length})`);
  }
  return shuffle(population, rng).slice(0, count);
}

// Generate a random integer in [min, max] inclusive
export function clampedInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
