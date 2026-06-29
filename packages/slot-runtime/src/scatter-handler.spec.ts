import { describe, it, expect } from 'vitest';
import { evaluateScatter, evaluateBonus } from './scatter-handler';
import { SYM, NEON_PALACE_PAY_TABLE } from './symbols';
import type { SymbolGrid } from './types';

function makeGrid(colRows: string[][]): SymbolGrid {
  return colRows.map((col) => col.map((s) => s as ReturnType<typeof import('./types').symbolId>));
}

const S  = SYM.SCATTER;
const L1 = SYM.LOW_1;

function gridWithScatters(count: number): SymbolGrid {
  // Place scatters on first `count` reels, middle row
  return makeGrid(
    Array.from({ length: 5 }, (_, i) => [L1, i < count ? S : L1, L1]),
  );
}

const TOTAL_BET = 200; // 10 * 20 paylines

describe('evaluateScatter', () => {
  it('returns null for 0 scatters', () => {
    const grid = gridWithScatters(0);
    expect(evaluateScatter(grid, TOTAL_BET, NEON_PALACE_PAY_TABLE)).toBeNull();
  });

  it('returns null for 1 scatter', () => {
    expect(evaluateScatter(gridWithScatters(1), TOTAL_BET, NEON_PALACE_PAY_TABLE)).toBeNull();
  });

  it('returns null for 2 scatters', () => {
    expect(evaluateScatter(gridWithScatters(2), TOTAL_BET, NEON_PALACE_PAY_TABLE)).toBeNull();
  });

  it('3 scatters → 2x total bet payout + 8 free spins', () => {
    const result = evaluateScatter(gridWithScatters(3), TOTAL_BET, NEON_PALACE_PAY_TABLE);
    expect(result).not.toBeNull();
    expect(result!.count).toBe(3);
    expect(result!.multiplier).toBe(2);
    expect(result!.payout).toBe(TOTAL_BET * 2);
    expect(result!.freeSpinsAwarded).toBe(8);
  });

  it('4 scatters → 10x total bet payout + 12 free spins', () => {
    const result = evaluateScatter(gridWithScatters(4), TOTAL_BET, NEON_PALACE_PAY_TABLE);
    expect(result!.count).toBe(4);
    expect(result!.multiplier).toBe(10);
    expect(result!.payout).toBe(TOTAL_BET * 10);
    expect(result!.freeSpinsAwarded).toBe(12);
  });

  it('5 scatters → 50x total bet payout + 20 free spins', () => {
    const result = evaluateScatter(gridWithScatters(5), TOTAL_BET, NEON_PALACE_PAY_TABLE);
    expect(result!.count).toBe(5);
    expect(result!.multiplier).toBe(50);
    expect(result!.payout).toBe(TOTAL_BET * 50);
    expect(result!.freeSpinsAwarded).toBe(20);
  });

  it('positions array matches scatter count', () => {
    const result = evaluateScatter(gridWithScatters(3), TOTAL_BET, NEON_PALACE_PAY_TABLE);
    expect(result!.positions).toHaveLength(3);
  });

  it('works with scatters in non-contiguous positions', () => {
    // Scatters on reels 0, 2, 4
    const grid: SymbolGrid = makeGrid([
      [L1, S, L1], [L1, L1, L1], [L1, S, L1], [L1, L1, L1], [L1, S, L1],
    ]);
    const result = evaluateScatter(grid, TOTAL_BET, NEON_PALACE_PAY_TABLE);
    expect(result!.count).toBe(3);
  });
});

describe('evaluateBonus', () => {
  it('returns null when no bonus symbol defined', () => {
    // NEON_PALACE_PAY_TABLE has bonusId: null
    const grid = gridWithScatters(3);
    expect(evaluateBonus(grid, NEON_PALACE_PAY_TABLE)).toBeNull();
  });
});
