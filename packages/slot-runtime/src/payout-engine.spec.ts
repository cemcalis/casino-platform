import { describe, it, expect } from 'vitest';
import { computeSpinResult, validateBet } from './payout-engine';
import { NEON_PALACE_CONFIG } from './neon-palace-config';
import { SYM } from './symbols';
import type { PaylineWin, ScatterWin, SymbolGrid } from './types';

const H1 = SYM.HIGH_1;
const L1 = SYM.LOW_1;
const S  = SYM.SCATTER;

const EMPTY_GRID: SymbolGrid = [
  [L1, L1, L1], [L1, L1, L1], [L1, L1, L1], [L1, L1, L1], [L1, L1, L1],
] as unknown as SymbolGrid;

const WIN_1: PaylineWin = {
  paylineIndex: 0,
  symbolId: H1,
  matchCount: 5,
  multiplier: 50,
  payout: 500,
  positions: [{ col: 0, row: 1 }],
};

const WIN_2: PaylineWin = {
  paylineIndex: 1,
  symbolId: H1,
  matchCount: 3,
  multiplier: 5,
  payout: 50,
  positions: [{ col: 0, row: 1 }],
};

const SCATTER_WIN: ScatterWin = {
  symbolId: S,
  count: 3,
  multiplier: 2,
  payout: 400,
  freeSpinsAwarded: 8,
  positions: [],
};

describe('computeSpinResult', () => {
  it('sums payline payouts correctly', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [WIN_1, WIN_2], null, null, 'seed', 1);
    expect(result.totalPaylinesPayout).toBe(550);
  });

  it('adds scatter payout to total', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [WIN_1], SCATTER_WIN, null, 'seed', 1);
    expect(result.totalPayout).toBe(500 + 400);
  });

  it('netResult is totalPayout - bet for normal spin', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [WIN_1], null, null, 'seed', 1);
    expect(result.netResult).toBe(500 - 10);
  });

  it('netResult is totalPayout (no bet deducted) for free spin', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, true, [WIN_1], null, null, 'seed', 1);
    expect(result.netResult).toBe(500);
  });

  it('freeSpinsAwarded comes from scatterWin', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [], SCATTER_WIN, null, 'seed', 1);
    expect(result.freeSpinsAwarded).toBe(8);
  });

  it('rngSeed and nonce are preserved', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [], null, null, 'my-seed', 42);
    expect(result.rngSeed).toBe('my-seed');
    expect(result.nonce).toBe(42);
  });

  it('zero payout gives multiplier 0', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [], null, null, 'seed', 1);
    expect(result.multiplier).toBe(0);
  });

  it('multiplier = totalPayout / bet', () => {
    const result = computeSpinResult(EMPTY_GRID, 10, false, [WIN_1], null, null, 'seed', 1);
    expect(result.multiplier).toBe(50);
  });
});

describe('validateBet', () => {
  it('accepts valid bet', () => {
    expect(validateBet(10, NEON_PALACE_CONFIG)).toBeNull();
  });

  it('rejects bet below minimum', () => {
    expect(validateBet(0.5, NEON_PALACE_CONFIG)).not.toBeNull();
  });

  it('rejects bet above maximum', () => {
    expect(validateBet(1000, NEON_PALACE_CONFIG)).not.toBeNull();
  });

  it('rejects zero bet', () => {
    expect(validateBet(0, NEON_PALACE_CONFIG)).not.toBeNull();
  });

  it('rejects negative bet', () => {
    expect(validateBet(-5, NEON_PALACE_CONFIG)).not.toBeNull();
  });

  it('rejects NaN', () => {
    expect(validateBet(NaN, NEON_PALACE_CONFIG)).not.toBeNull();
  });

  it('accepts minBet exactly', () => {
    expect(validateBet(NEON_PALACE_CONFIG.minBet, NEON_PALACE_CONFIG)).toBeNull();
  });

  it('accepts maxBet exactly', () => {
    expect(validateBet(NEON_PALACE_CONFIG.maxBet, NEON_PALACE_CONFIG)).toBeNull();
  });
});
