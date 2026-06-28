import { describe, it, expect } from 'vitest';
import { CryptoRng } from './crypto-rng';

describe('CryptoRng', () => {
  const rng = new CryptoRng();

  it('next() returns a float in [0, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt() returns integers within [min, max]', () => {
    for (let i = 0; i < 200; i++) {
      const v = rng.nextInt(1, 6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('nextInt() handles min === max', () => {
    expect(rng.nextInt(5, 5)).toBe(5);
  });

  it('nextInt() throws when min > max', () => {
    expect(() => rng.nextInt(10, 5)).toThrow();
  });

  it('nextInt() throws for non-integer inputs', () => {
    expect(() => rng.nextInt(1.5, 6)).toThrow(TypeError);
  });

  it('nextBytes() returns a Uint8Array of the requested length', () => {
    const bytes = rng.nextBytes(32);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(32);
  });

  it('nextBytes() throws for negative count', () => {
    expect(() => rng.nextBytes(-1)).toThrow();
  });

  it('generateSeed() returns a 64-char hex string', () => {
    const seed = CryptoRng.generateSeed();
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
  });
});
