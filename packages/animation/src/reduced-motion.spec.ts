import { describe, it, expect } from 'vitest';
import { applyReducedMotionPolicy, policyFromPreference, scaleParticlesToPolicy } from './reduced-motion';
import { makeTransitionSpec } from './timing';

const fullSpec = makeTransitionSpec(500, 'ease-out-bounce', 100);

describe('applyReducedMotionPolicy', () => {
  it('FULL policy returns spec unchanged', () => {
    const result = applyReducedMotionPolicy(fullSpec, 'FULL');
    expect(result).toEqual(fullSpec);
  });

  it('REDUCED policy collapses to 1ms linear', () => {
    const result = applyReducedMotionPolicy(fullSpec, 'REDUCED');
    expect(result.durationMs).toBe(1);
    expect(result.easing).toBe('linear');
    expect(result.delayMs).toBe(0);
  });

  it('NONE policy collapses to 0ms', () => {
    const result = applyReducedMotionPolicy(fullSpec, 'NONE');
    expect(result.durationMs).toBe(0);
    expect(result.delayMs).toBe(0);
  });
});

describe('policyFromPreference', () => {
  it('returns REDUCED when preference is true', () => {
    expect(policyFromPreference(true)).toBe('REDUCED');
  });

  it('returns FULL when preference is false', () => {
    expect(policyFromPreference(false)).toBe('FULL');
  });
});

describe('scaleParticlesToPolicy', () => {
  it('FULL policy returns full count', () => {
    expect(scaleParticlesToPolicy(100, 'FULL')).toBe(100);
  });

  it('REDUCED policy returns ~25%', () => {
    expect(scaleParticlesToPolicy(100, 'REDUCED')).toBe(25);
  });

  it('NONE policy returns 0', () => {
    expect(scaleParticlesToPolicy(100, 'NONE')).toBe(0);
  });

  it('REDUCED minimum is 1', () => {
    expect(scaleParticlesToPolicy(1, 'REDUCED')).toBe(1);
  });
});
