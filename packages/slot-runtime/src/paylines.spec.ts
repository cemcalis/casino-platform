import { describe, it, expect } from 'vitest';
import { PAYLINES_20, PAYLINES_40, PAYLINES_50, PAYLINES_100 } from './paylines';
import type { Payline } from './types';

const REELS = 5;
const ROWS = 3;

function assertPaylineSetValid(paylines: ReadonlyArray<Payline>, expectedCount: number): void {
  expect(paylines).toHaveLength(expectedCount);

  const keys = new Set<string>();
  for (const payline of paylines) {
    expect(payline).toHaveLength(REELS);

    for (const coord of payline) {
      expect(coord.col).toBeGreaterThanOrEqual(0);
      expect(coord.col).toBeLessThan(REELS);
      expect(coord.row).toBeGreaterThanOrEqual(0);
      expect(coord.row).toBeLessThan(ROWS);
    }

    const key = payline.map((c) => `${c.col},${c.row}`).join('|');
    keys.add(key);
  }

  // All paylines must be unique
  expect(keys.size).toBe(expectedCount);
}

describe('PAYLINES_20', () => {
  it('has exactly 20 paylines, all valid and unique', () => {
    assertPaylineSetValid(PAYLINES_20, 20);
  });

  it('line 1 is the straight middle row', () => {
    const p = PAYLINES_20[0]!;
    expect(p.every((c) => c.row === 1)).toBe(true);
  });

  it('line 2 is the straight top row', () => {
    const p = PAYLINES_20[1]!;
    expect(p.every((c) => c.row === 0)).toBe(true);
  });

  it('line 3 is the straight bottom row', () => {
    const p = PAYLINES_20[2]!;
    expect(p.every((c) => c.row === 2)).toBe(true);
  });
});

describe('PAYLINES_40', () => {
  it('has exactly 40 paylines, all valid and unique', () => {
    assertPaylineSetValid(PAYLINES_40, 40);
  });

  it('contains all 20 from PAYLINES_20', () => {
    const p20Keys = new Set(PAYLINES_20.map((p) => p.map((c) => `${c.col},${c.row}`).join('|')));
    for (const key of p20Keys) {
      expect(p20Keys.has(key)).toBe(true);
    }
  });
});

describe('PAYLINES_50', () => {
  it('has exactly 50 paylines, all valid and unique', () => {
    assertPaylineSetValid(PAYLINES_50, 50);
  });
});

describe('PAYLINES_100', () => {
  it('has exactly 100 paylines, all valid and unique', () => {
    assertPaylineSetValid(PAYLINES_100, 100);
  });
});
