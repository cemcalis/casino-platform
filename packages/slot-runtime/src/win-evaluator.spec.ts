import { describe, it, expect } from 'vitest';
import { evaluatePayline, evaluateAllPaylines } from './win-evaluator';
import { SYM, NEON_PALACE_PAY_TABLE } from './symbols';
import type { SymbolGrid, Payline, PaylineCoord } from './types';

// 5×3 grid helper: grid[col][row]
function makeGrid(cols: string[][]): SymbolGrid {
  return cols.map((col) => col.map((s) => s as ReturnType<typeof import('./types').symbolId>));
}

// Simple left-to-right payline on middle row
const MIDDLE_LINE: Payline = [
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
  { col: 3, row: 1 }, { col: 4, row: 1 },
];

const H1 = SYM.HIGH_1;
const H2 = SYM.HIGH_2;
const W  = SYM.WILD;
const S  = SYM.SCATTER;
const L1 = SYM.LOW_1;

// grid where middle row is [H1, H1, H1, H1, H1]
const FIVE_H1: SymbolGrid = makeGrid([
  [L1, H1, L1], [L1, H1, L1], [L1, H1, L1], [L1, H1, L1], [L1, H1, L1],
]);

// grid where middle row is [H1, H1, H1, H2, H2]
const THREE_H1: SymbolGrid = makeGrid([
  [L1, H1, L1], [L1, H1, L1], [L1, H1, L1], [L1, H2, L1], [L1, H2, L1],
]);

// grid with 5 wilds on middle row
const FIVE_WILDS: SymbolGrid = makeGrid([
  [L1, W, L1], [L1, W, L1], [L1, W, L1], [L1, W, L1], [L1, W, L1],
]);

// grid [H1, W, H1, H1, H1] on middle — wild in position 2
const FOUR_H1_WITH_WILD: SymbolGrid = makeGrid([
  [L1, H1, L1], [L1, W,  L1], [L1, H1, L1], [L1, H1, L1], [L1, H1, L1],
]);

// grid [W, W, H1, H1, H1]
const TWO_WILDS_PLUS_H1: SymbolGrid = makeGrid([
  [L1, W,  L1], [L1, W,  L1], [L1, H1, L1], [L1, H1, L1], [L1, H1, L1],
]);

// grid [H1, H2, H1, H1, H1] — chain breaks at pos 1
const CHAIN_BREAK: SymbolGrid = makeGrid([
  [L1, H1, L1], [L1, H2, L1], [L1, H1, L1], [L1, H1, L1], [L1, H1, L1],
]);

// grid [S, S, S, S, S] on middle — scatter payline (should not win on payline)
const FIVE_SCATTER: SymbolGrid = makeGrid([
  [L1, S, L1], [L1, S, L1], [L1, S, L1], [L1, S, L1], [L1, S, L1],
]);

describe('evaluatePayline', () => {
  it('returns null when below minMatchCount', () => {
    const grid: SymbolGrid = makeGrid([
      [L1, H1, L1], [L1, H1, L1], [L1, H2, L1], [L1, H2, L1], [L1, H2, L1],
    ]);
    expect(evaluatePayline(grid, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE)).toBeNull();
  });

  it('detects a 5-of-a-kind win', () => {
    const win = evaluatePayline(FIVE_H1, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win).not.toBeNull();
    expect(win!.matchCount).toBe(5);
    expect(win!.symbolId).toBe(H1);
    expect(win!.multiplier).toBe(50);
    expect(win!.payout).toBe(500);
  });

  it('detects a 3-of-a-kind win', () => {
    const win = evaluatePayline(THREE_H1, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win).not.toBeNull();
    expect(win!.matchCount).toBe(3);
    expect(win!.payout).toBe(50);
  });

  it('detects 5 wilds as wild self-win', () => {
    const win = evaluatePayline(FIVE_WILDS, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win).not.toBeNull();
    expect(win!.symbolId).toBe(W);
    expect(win!.matchCount).toBe(5);
    expect(win!.payout).toBe(1000);
  });

  it('wild substitutes: H1 + wild + H1 + H1 + H1 = 5 H1 win', () => {
    const win = evaluatePayline(FOUR_H1_WITH_WILD, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win!.matchCount).toBe(5);
    expect(win!.symbolId).toBe(H1);
  });

  it('leading wilds anchor to first non-wild', () => {
    const win = evaluatePayline(TWO_WILDS_PLUS_H1, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win!.symbolId).toBe(H1);
    expect(win!.matchCount).toBe(5);
  });

  it('chain breaks at position 1 — only 1 match, no win', () => {
    const win = evaluatePayline(CHAIN_BREAK, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win).toBeNull();
  });

  it('scatter on payline returns null', () => {
    expect(evaluatePayline(FIVE_SCATTER, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE)).toBeNull();
  });

  it('paylineIndex is preserved in win', () => {
    const win = evaluatePayline(FIVE_H1, MIDDLE_LINE, 7, 10, NEON_PALACE_PAY_TABLE);
    expect(win!.paylineIndex).toBe(7);
  });

  it('positions array has matchCount entries', () => {
    const win = evaluatePayline(THREE_H1, MIDDLE_LINE, 0, 10, NEON_PALACE_PAY_TABLE);
    expect(win!.positions).toHaveLength(3);
  });
});

describe('evaluateAllPaylines', () => {
  it('returns empty array when no wins', () => {
    const noWin: SymbolGrid = makeGrid([
      [L1, H1, L1], [L1, H2, L1], [L1, H1, L1], [L1, H2, L1], [L1, H1, L1],
    ]);
    const paylines: Payline[] = [MIDDLE_LINE];
    expect(evaluateAllPaylines(noWin, paylines, 10, NEON_PALACE_PAY_TABLE)).toHaveLength(0);
  });

  it('accumulates wins from multiple paylines', () => {
    const topLine: Payline = [
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
      { col: 3, row: 0 }, { col: 4, row: 0 },
    ];
    // Both top and middle rows have H1
    const grid: SymbolGrid = makeGrid([
      [H1, H1, L1], [H1, H1, L1], [H1, H1, L1], [H1, H1, L1], [H1, H1, L1],
    ]);
    const wins = evaluateAllPaylines(grid, [MIDDLE_LINE, topLine], 10, NEON_PALACE_PAY_TABLE);
    expect(wins).toHaveLength(2);
  });
});
