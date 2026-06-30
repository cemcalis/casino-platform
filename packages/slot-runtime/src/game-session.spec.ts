import { describe, it, expect } from 'vitest';
import { createSession, setBet, applySpinResult, canSpin } from './game-session';
import { NEON_PALACE_CONFIG } from './neon-palace-config';
import { SYM } from './symbols';
import type { SpinResult, SymbolGrid } from './types';

const L1 = SYM.LOW_1;
const EMPTY_GRID: SymbolGrid = [
  [L1, L1, L1], [L1, L1, L1], [L1, L1, L1], [L1, L1, L1], [L1, L1, L1],
] as unknown as SymbolGrid;

function makeResult(overrides: Partial<SpinResult> = {}): SpinResult {
  return {
    grid: EMPTY_GRID,
    bet: 10,
    isFreeSpins: false,
    paylineWins: [],
    scatterWin: null,
    bonusTrigger: null,
    totalPaylinesPayout: 0,
    totalPayout: 0,
    netResult: -10,
    freeSpinsAwarded: 0,
    multiplier: 0,
    payoutVirtualCoins: 0,
    rngSeed: 'test',
    nonce: 1,
    ...overrides,
  };
}

describe('createSession', () => {
  it('creates session with correct initial values', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(s.balance).toBe(1000);
    expect(s.bet).toBe(NEON_PALACE_CONFIG.defaultBet);
    expect(s.spinCount).toBe(0);
    expect(s.freeSpinsRemaining).toBe(0);
    expect(s.totalWon).toBe(0);
    expect(s.totalWagered).toBe(0);
  });

  it('sessionId is unique per call', () => {
    const s1 = createSession(NEON_PALACE_CONFIG, 1000);
    const s2 = createSession(NEON_PALACE_CONFIG, 1000);
    expect(s1.sessionId).not.toBe(s2.sessionId);
  });
});

describe('setBet', () => {
  it('updates bet', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(setBet(s, 50).bet).toBe(50);
  });

  it('throws for bet below minimum', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(() => setBet(s, 0.1)).toThrow(RangeError);
  });

  it('throws for bet above maximum', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(() => setBet(s, 10000)).toThrow(RangeError);
  });
});

describe('applySpinResult', () => {
  it('deducts bet on loss', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    const updated = applySpinResult(s, makeResult({ bet: 10, totalPayout: 0 }));
    expect(updated.balance).toBe(990);
  });

  it('adds payout on win', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    const updated = applySpinResult(s, makeResult({ bet: 10, totalPayout: 500 }));
    expect(updated.balance).toBe(1490);
  });

  it('does not deduct bet on free spin', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    const updated = applySpinResult(s, makeResult({ bet: 10, isFreeSpins: true, totalPayout: 0 }));
    expect(updated.balance).toBe(1000);
  });

  it('increments spinCount', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(applySpinResult(s, makeResult()).spinCount).toBe(1);
  });

  it('accumulates totalWon', () => {
    let s = createSession(NEON_PALACE_CONFIG, 1000);
    s = applySpinResult(s, makeResult({ totalPayout: 200 }));
    s = applySpinResult(s, makeResult({ totalPayout: 100 }));
    expect(s.totalWon).toBe(300);
  });

  it('awards free spins from scatter', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    const updated = applySpinResult(s, makeResult({ freeSpinsAwarded: 8 }));
    expect(updated.freeSpinsRemaining).toBe(8);
  });

  it('decrements freeSpinsRemaining on free spin', () => {
    let s = { ...createSession(NEON_PALACE_CONFIG, 1000), freeSpinsRemaining: 8 };
    s = applySpinResult(s, makeResult({ isFreeSpins: true, freeSpinsAwarded: 0 }));
    expect(s.freeSpinsRemaining).toBe(7);
  });
});

describe('canSpin', () => {
  it('returns true when balance >= bet', () => {
    const s = createSession(NEON_PALACE_CONFIG, 1000);
    expect(canSpin(s)).toBe(true);
  });

  it('returns false when balance < bet', () => {
    const s = { ...createSession(NEON_PALACE_CONFIG, 5), bet: 10 };
    expect(canSpin(s)).toBe(false);
  });

  it('returns true when freeSpinsRemaining > 0 even with no balance', () => {
    const s = { ...createSession(NEON_PALACE_CONFIG, 0), freeSpinsRemaining: 3 };
    expect(canSpin(s)).toBe(true);
  });
});
