import { describe, it, expect } from 'vitest';
import { VerifiableRng } from './verifiable-rng';

describe('VerifiableRng', () => {
  const serverSeed = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  const clientSeed = 'player-client-seed-xyz';

  it('generates a result with value in [0, 1)', () => {
    const vrng = new VerifiableRng(serverSeed);
    const result = vrng.generate(clientSeed, 1);
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeLessThan(1);
  });

  it('generates a 64-char hex hash', () => {
    const vrng = new VerifiableRng(serverSeed);
    const result = vrng.generate(clientSeed, 1);
    expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic: same inputs produce same output', () => {
    const a = new VerifiableRng(serverSeed);
    const b = new VerifiableRng(serverSeed);
    expect(a.generate(clientSeed, 42).hash).toBe(b.generate(clientSeed, 42).hash);
  });

  it('different nonces produce different results', () => {
    const vrng = new VerifiableRng(serverSeed);
    const r1 = vrng.generate(clientSeed, 1);
    const r2 = vrng.generate(clientSeed, 2);
    expect(r1.hash).not.toBe(r2.hash);
  });

  it('verify() returns true for correct inputs', () => {
    const vrng = new VerifiableRng(serverSeed);
    const result = vrng.generate(clientSeed, 5);
    expect(VerifiableRng.verify(serverSeed, clientSeed, 5, result.hash)).toBe(true);
  });

  it('verify() returns false for tampered hash', () => {
    expect(VerifiableRng.verify(serverSeed, clientSeed, 5, 'deadbeef')).toBe(false);
  });

  it('verify() returns false for wrong serverSeed', () => {
    const vrng = new VerifiableRng(serverSeed);
    const result = vrng.generate(clientSeed, 5);
    expect(VerifiableRng.verify('wrong-seed', clientSeed, 5, result.hash)).toBe(false);
  });

  it('commitSeed() produces a consistent commitment hash', () => {
    const h1 = VerifiableRng.commitSeed(serverSeed);
    const h2 = VerifiableRng.commitSeed(serverSeed);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('throws when constructed with empty serverSeed', () => {
    expect(() => new VerifiableRng('')).toThrow();
  });

  it('throws for negative nonce', () => {
    const vrng = new VerifiableRng(serverSeed);
    expect(() => vrng.generate(clientSeed, -1)).toThrow();
  });
});
