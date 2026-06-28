import { describe, it, expect } from 'vitest';
import { shuffle, pickWeighted, sampleWithoutReplacement } from './utils';
import { SeededRng } from './seeded-rng';

describe('shuffle', () => {
  it('returns an array of the same length with same elements', () => {
    const rng = new SeededRng('shuffle-test');
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original, rng);
    expect(result).toHaveLength(5);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const rng = new SeededRng('test');
    const original = [1, 2, 3];
    shuffle(original, rng);
    expect(original).toEqual([1, 2, 3]);
  });

  it('produces different orderings for different seeds', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], new SeededRng('seed-a'));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], new SeededRng('seed-b'));
    expect(a).not.toEqual(b);
  });
});

describe('pickWeighted', () => {
  it('throws on empty array', () => {
    const rng = new SeededRng('test');
    expect(() => pickWeighted([], rng)).toThrow(RangeError);
  });

  it('throws when total weight is zero', () => {
    const rng = new SeededRng('test');
    expect(() => pickWeighted([{ item: 'a', weight: 0 }], rng)).toThrow(RangeError);
  });

  it('always returns the only item when weight is positive', () => {
    const rng = new SeededRng('test');
    for (let i = 0; i < 20; i++) {
      expect(pickWeighted([{ item: 'only', weight: 1 }], rng)).toBe('only');
    }
  });

  it('selects items proportional to their weight', () => {
    const rng = new SeededRng('distribution-test');
    const counts: Record<string, number> = { common: 0, rare: 0 };
    const items = [
      { item: 'common', weight: 9 },
      { item: 'rare', weight: 1 },
    ];
    for (let i = 0; i < 1000; i++) {
      counts[pickWeighted(items, rng)]!++;
    }
    // common should be ~90% of results, rare ~10%
    expect(counts['common']!).toBeGreaterThan(800);
    expect(counts['rare']!).toBeGreaterThan(50);
  });
});

describe('sampleWithoutReplacement', () => {
  it('returns the requested count of items', () => {
    const rng = new SeededRng('test');
    const result = sampleWithoutReplacement([1, 2, 3, 4, 5], 3, rng);
    expect(result).toHaveLength(3);
  });

  it('throws when count exceeds population', () => {
    const rng = new SeededRng('test');
    expect(() => sampleWithoutReplacement([1, 2], 5, rng)).toThrow(RangeError);
  });

  it('returns all elements when count equals population size', () => {
    const rng = new SeededRng('test');
    const result = sampleWithoutReplacement([1, 2, 3], 3, rng);
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it('has no duplicate elements in the sample', () => {
    const rng = new SeededRng('test');
    const result = sampleWithoutReplacement([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 6, rng);
    expect(new Set(result).size).toBe(6);
  });
});
