import { describe, it, expect } from 'vitest';
import { createNeonPalaceConfig } from '@casino/slot-runtime';
import { runMonteCarloSimulation } from './simulate';

describe('runMonteCarloSimulation', () => {
  it('is deterministic for a given seed', () => {
    const config = createNeonPalaceConfig(20);
    const a = runMonteCarloSimulation({ config, gameId: 'neon-palace', spins: 500, seed: 'fixed-seed' });
    const b = runMonteCarloSimulation({ config, gameId: 'neon-palace', spins: 500, seed: 'fixed-seed' });

    expect(a.rtp).toBe(b.rtp);
    expect(a.hitCount).toBe(b.hitCount);
    expect(a.maxWin).toEqual(b.maxWin);
    expect(a.paylineStats).toEqual(b.paylineStats);
  });

  it('produces different outcomes for different seeds', () => {
    const config = createNeonPalaceConfig(20);
    const a = runMonteCarloSimulation({ config, gameId: 'neon-palace', spins: 500, seed: 'seed-a' });
    const b = runMonteCarloSimulation({ config, gameId: 'neon-palace', spins: 500, seed: 'seed-b' });

    expect(a.hitCount).not.toBe(b.hitCount);
  });

  it('runs the requested number of spins and reports core metrics in range', () => {
    const config = createNeonPalaceConfig(20);
    const result = runMonteCarloSimulation({
      config,
      gameId: 'neon-palace',
      spins: 20_000,
      seed: 'metrics-check',
    });

    const stakePerSpin = config.defaultBet * config.paylines.length;
    expect(result.spins).toBe(20_000);
    // Free spins don't stake anything, so wagered total is <= spins * (bet * paylines).
    expect(result.totalWagered).toBeLessThanOrEqual(20_000 * stakePerSpin);
    expect(result.totalWagered).toBeGreaterThan(0);
    // Reel strips are tuned for ~96% RTP; allow wide tolerance for sampling noise.
    expect(result.rtp).toBeGreaterThan(0.5);
    expect(result.rtp).toBeLessThan(1.5);
    expect(result.hitFrequency).toBeGreaterThan(0);
    expect(result.hitFrequency).toBeLessThanOrEqual(1);
    expect(result.scatterTriggerFrequency).toBeGreaterThanOrEqual(0);
    expect(result.bonusTriggerCount).toBe(0); // neon-palace has no bonus symbol configured
    expect(['low', 'medium', 'high']).toContain(result.volatilityClass);
    expect(result.maxWin).not.toBeNull();
    expect(result.paylineStats.length).toBeGreaterThan(0);
    expect(result.symbolStats.length).toBeGreaterThan(0);
  });

  it('rejects a non-positive spin count', () => {
    const config = createNeonPalaceConfig(20);
    expect(() =>
      runMonteCarloSimulation({ config, gameId: 'neon-palace', spins: 0 }),
    ).toThrow(RangeError);
  });

  it('awards free spins consistent with scatter triggers', () => {
    const config = createNeonPalaceConfig(20);
    const result = runMonteCarloSimulation({
      config,
      gameId: 'neon-palace',
      spins: 20_000,
      seed: 'free-spins-check',
    });

    if (result.scatterTriggerCount > 0) {
      expect(result.averageFreeSpinsPerTrigger).toBeGreaterThan(0);
    } else {
      expect(result.averageFreeSpinsPerTrigger).toBe(0);
    }
  });
});
