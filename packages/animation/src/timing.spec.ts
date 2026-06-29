import { describe, it, expect } from 'vitest';
import { makeTransitionSpec, scaleDuration, toReducedMotionSpec, toCssTransition, DURATION, EASING } from './timing';

describe('makeTransitionSpec', () => {
  it('creates spec with given values', () => {
    const s = makeTransitionSpec(300, 'ease-out', 50);
    expect(s.durationMs).toBe(300);
    expect(s.easing).toBe('ease-out');
    expect(s.delayMs).toBe(50);
  });

  it('defaults delay to 0', () => {
    expect(makeTransitionSpec(200, 'linear').delayMs).toBe(0);
  });
});

describe('scaleDuration', () => {
  it('scales both duration and delay', () => {
    const s = makeTransitionSpec(400, 'ease-in', 100);
    const scaled = scaleDuration(s, 0.5);
    expect(scaled.durationMs).toBe(200);
    expect(scaled.delayMs).toBe(50);
    expect(scaled.easing).toBe('ease-in');
  });
});

describe('toReducedMotionSpec', () => {
  it('collapses to 1ms linear no delay', () => {
    const s = toReducedMotionSpec(makeTransitionSpec(1000, 'ease-out-bounce', 200));
    expect(s.durationMs).toBe(1);
    expect(s.easing).toBe('linear');
    expect(s.delayMs).toBe(0);
  });
});

describe('toCssTransition', () => {
  it('formats a css transition string', () => {
    const s = makeTransitionSpec(300, 'ease-out', 0);
    const css = toCssTransition(s, 'opacity');
    expect(css).toContain('opacity');
    expect(css).toContain('300ms');
  });

  it('defaults property to all', () => {
    const s = makeTransitionSpec(150, 'linear', 0);
    expect(toCssTransition(s)).toContain('all');
  });
});

describe('DURATION constants', () => {
  it('instant is 0', () => {
    expect(DURATION.instant).toBe(0);
  });

  it('celebration is the longest', () => {
    const values = Object.values(DURATION);
    expect(DURATION.celebration).toBe(Math.max(...values));
  });
});

describe('EASING map', () => {
  it('all values are strings', () => {
    for (const v of Object.values(EASING)) {
      expect(typeof v).toBe('string');
    }
  });
});
