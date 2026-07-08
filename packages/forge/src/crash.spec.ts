import { describe, expect, it } from 'vitest';
import { defaultCrashConfig, drawCrashPoint, multiplierAt, simulateCrash, timeToReach } from './crash';
import { seededRng } from './rng';

const ROUNDS = 200_000;

describe('crash math', () => {
  it('never returns below 1.00 or above the cap', () => {
    const rng = seededRng(42);
    for (let i = 0; i < 10_000; i++) {
      const p = drawCrashPoint(defaultCrashConfig, rng);
      expect(p).toBeGreaterThanOrEqual(1);
      expect(p).toBeLessThanOrEqual(defaultCrashConfig.maxMultiplier);
    }
  });

  it('holds RTP = 1 - houseEdge at a 2x cash-out target', () => {
    const report = simulateCrash(defaultCrashConfig, ROUNDS, 2, seededRng(1337));
    expect(report.rtp).toBeGreaterThan(0.945);
    expect(report.rtp).toBeLessThan(0.975);
  });

  it('holds the same RTP at a 10x target (strategy-independent)', () => {
    const report = simulateCrash(defaultCrashConfig, ROUNDS, 10, seededRng(1337));
    expect(report.rtp).toBeGreaterThan(0.93);
    expect(report.rtp).toBeLessThan(0.99);
  });

  it('busts below 1.20x roughly 20% of the time', () => {
    const report = simulateCrash(defaultCrashConfig, ROUNDS, 1.2, seededRng(7));
    expect(report.bustRate).toBeGreaterThan(0.15);
    expect(report.bustRate).toBeLessThan(0.25);
  });

  it('multiplier curve and its inverse agree', () => {
    for (const m of [1.5, 2, 5, 20, 100]) {
      expect(multiplierAt(timeToReach(m))).toBeCloseTo(m, 1);
    }
  });
});
