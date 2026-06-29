import { describe, it, expect } from 'vitest';
import { getWinTierAnimation, WIN_TIER_ANIMATIONS, totalAnimationDurationMs } from './win-tier-config';

describe('getWinTierAnimation', () => {
  it('returns NONE config with no particles or shake', () => {
    const a = getWinTierAnimation('NONE');
    expect(a.particles).toHaveLength(0);
    expect(a.screenShake).toBe(false);
    expect(a.glowIntensity).toBe(0);
    expect(a.labelScale).toBe(1.0);
  });

  it('SMALL has no screen shake', () => {
    expect(getWinTierAnimation('SMALL').screenShake).toBe(false);
  });

  it('BIG has screen shake', () => {
    expect(getWinTierAnimation('BIG').screenShake).toBe(true);
  });

  it('JACKPOT has maximum glow and scale', () => {
    const a = getWinTierAnimation('JACKPOT');
    expect(a.glowIntensity).toBe(1.0);
    expect(a.labelScale).toBe(2.0);
  });

  it('JACKPOT has more particles than BIG', () => {
    const jackpotCount = getWinTierAnimation('JACKPOT').particles.reduce((s, p) => s + p.count, 0);
    const bigCount = getWinTierAnimation('BIG').particles.reduce((s, p) => s + p.count, 0);
    expect(jackpotCount).toBeGreaterThan(bigCount);
  });

  it('escalating glow across tiers', () => {
    const tiers = ['NONE', 'SMALL', 'MEDIUM', 'BIG', 'JACKPOT'] as const;
    for (let i = 1; i < tiers.length; i++) {
      expect(getWinTierAnimation(tiers[i]).glowIntensity).toBeGreaterThan(
        getWinTierAnimation(tiers[i - 1]).glowIntensity,
      );
    }
  });
});

describe('WIN_TIER_ANIMATIONS', () => {
  it('covers all 5 tiers', () => {
    expect(Object.keys(WIN_TIER_ANIMATIONS)).toHaveLength(5);
  });
});

describe('totalAnimationDurationMs', () => {
  it('sums enter + hold + exit', () => {
    const a = getWinTierAnimation('SMALL');
    const expected = a.enter.durationMs + a.hold.durationMs + a.exit.durationMs;
    expect(totalAnimationDurationMs(a)).toBe(expected);
  });

  it('NONE has zero total duration', () => {
    expect(totalAnimationDurationMs(getWinTierAnimation('NONE'))).toBe(0);
  });
});
