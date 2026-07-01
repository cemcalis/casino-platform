import { describe as suite, it, expect } from 'vitest';
import { describe, classifyVolatility } from './stats';

suite('describe', () => {
  it('returns zeros for an empty input', () => {
    expect(describe([])).toEqual({ count: 0, mean: 0, variance: 0, standardDeviation: 0 });
  });

  it('computes mean, variance and standard deviation', () => {
    const stats = describe([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.count).toBe(8);
    expect(stats.mean).toBe(5);
    expect(stats.variance).toBe(4);
    expect(stats.standardDeviation).toBe(2);
  });
});

suite('classifyVolatility', () => {
  it('classifies below 3 as low', () => {
    expect(classifyVolatility(0)).toBe('low');
    expect(classifyVolatility(2.9)).toBe('low');
  });

  it('classifies 3 to below 8 as medium', () => {
    expect(classifyVolatility(3)).toBe('medium');
    expect(classifyVolatility(7.9)).toBe('medium');
  });

  it('classifies 8 and above as high', () => {
    expect(classifyVolatility(8)).toBe('high');
    expect(classifyVolatility(50)).toBe('high');
  });
});
