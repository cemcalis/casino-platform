import { describe, it, expect } from 'vitest';
import { SeededRng } from './seeded-rng';

describe('SeededRng', () => {
  it('produces deterministic output for the same seed', () => {
    const a = new SeededRng('test-seed-abc');
    const b = new SeededRng('test-seed-abc');
    const aVals = Array.from({ length: 20 }, () => a.next());
    const bVals = Array.from({ length: 20 }, () => b.next());
    expect(aVals).toEqual(bVals);
  });

  it('produces different output for different seeds', () => {
    const a = new SeededRng('seed-alpha');
    const b = new SeededRng('seed-beta');
    const aVals = Array.from({ length: 10 }, () => a.next());
    const bVals = Array.from({ length: 10 }, () => b.next());
    expect(aVals).not.toEqual(bVals);
  });

  it('next() returns floats in [0, 1)', () => {
    const rng = new SeededRng('test');
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt() returns integers within [min, max]', () => {
    const rng = new SeededRng('dice-test');
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 6000; i++) {
      const v = rng.nextInt(1, 6);
      counts[v - 1]++;
    }
    // Each face should appear roughly 1/6 of the time — verify no face is never hit
    counts.forEach((c) => expect(c).toBeGreaterThan(0));
  });

  it('nextInt() handles min === max', () => {
    const rng = new SeededRng('test');
    expect(rng.nextInt(7, 7)).toBe(7);
  });

  it('nextBytes() returns a Uint8Array with bytes in [0, 255]', () => {
    const rng = new SeededRng('bytes-test');
    const bytes = rng.nextBytes(16);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(16);
    bytes.forEach((b) => {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    });
  });

  it('exposes the seed string', () => {
    const rng = new SeededRng('my-seed');
    expect(rng.seed).toBe('my-seed');
  });
});
