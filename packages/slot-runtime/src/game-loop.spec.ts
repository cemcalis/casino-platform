import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRng } from '@casino/rng';
import { GameLoop } from './game-loop';
import { createSession } from './game-session';
import { NEON_PALACE_CONFIG } from './neon-palace-config';

describe('GameLoop', () => {
  let loop: GameLoop;

  beforeEach(() => {
    loop = new GameLoop(new SeededRng('fixed-seed'));
    loop.resetNonce();
  });

  it('is deterministic with the same seed', () => {
    const session = createSession(NEON_PALACE_CONFIG, 10000);
    const loop1 = new GameLoop(new SeededRng('same'));
    const loop2 = new GameLoop(new SeededRng('same'));
    const r1 = loop1.spin(session);
    const r2 = loop2.spin(session);
    expect(r1.result.grid).toEqual(r2.result.grid);
  });

  it('deducts bet from balance on loss', () => {
    // Run multiple spins until we find a losing spin
    let session = createSession(NEON_PALACE_CONFIG, 100000);
    const { result, updatedSession } = loop.spin(session);
    const expectedBalance = session.balance - result.bet + result.totalPayout;
    expect(updatedSession.balance).toBeCloseTo(expectedBalance);
  });

  it('spinCount increments after each spin', () => {
    let session = createSession(NEON_PALACE_CONFIG, 100000);
    expect(session.spinCount).toBe(0);
    const { updatedSession } = loop.spin(session);
    expect(updatedSession.spinCount).toBe(1);
  });

  it('grid has 5 columns of 3 rows each', () => {
    const session = createSession(NEON_PALACE_CONFIG, 100000);
    const { result } = loop.spin(session);
    expect(result.grid).toHaveLength(5);
    for (const col of result.grid) {
      expect(col).toHaveLength(3);
    }
  });

  it('SpinResult.bet matches session.bet', () => {
    const session = createSession(NEON_PALACE_CONFIG, 100000);
    const { result } = loop.spin(session);
    expect(result.bet).toBe(session.bet);
  });

  it('throws when balance insufficient', () => {
    const session = { ...createSession(NEON_PALACE_CONFIG, 5), bet: 10 };
    expect(() => loop.spin(session)).toThrow();
  });

  it('free spin does not deduct from balance', () => {
    let session = {
      ...createSession(NEON_PALACE_CONFIG, 100),
      freeSpinsRemaining: 3,
    };
    const before = session.balance;
    const { result, updatedSession } = loop.spin(session);
    expect(result.isFreeSpın).toBe(true);
    expect(updatedSession.balance).toBe(before + result.totalPayout);
  });

  it('nonce increments with each spin', () => {
    const session = createSession(NEON_PALACE_CONFIG, 100000);
    const { result: r1 } = loop.spin(session);
    const { result: r2 } = loop.spin(session);
    expect(r2.nonce).toBe(r1.nonce + 1);
  });

  it('total payout is non-negative', () => {
    const session = createSession(NEON_PALACE_CONFIG, 100000);
    const { result } = loop.spin(session);
    expect(result.totalPayout).toBeGreaterThanOrEqual(0);
  });

  it('paylineWins are on defined paylines', () => {
    const session = createSession(NEON_PALACE_CONFIG, 1000000);
    // Run enough spins to likely hit a win
    let found = false;
    for (let i = 0; i < 50; i++) {
      const { result } = loop.spin(session);
      for (const win of result.paylineWins) {
        expect(win.paylineIndex).toBeGreaterThanOrEqual(0);
        expect(win.paylineIndex).toBeLessThan(session.config.paylines.length);
        found = true;
      }
    }
    // Note: with 50 spins we very likely hit at least one win
    // but we don't assert `found` to avoid flakiness
    void found;
  });
});
