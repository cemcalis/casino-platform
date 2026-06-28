import type { RngProvider } from './types';

// Mulberry32 — fast, statistically sound 32-bit PRNG suitable for deterministic replays
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

// FNV-1a 32-bit hash — converts an arbitrary string seed to a uint32
function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class SeededRng implements RngProvider {
  private readonly advance: () => number;
  private readonly seedValue: string;

  constructor(seed: string) {
    this.seedValue = seed;
    this.advance = mulberry32(fnv1a32(seed));
  }

  get seed(): string {
    return this.seedValue;
  }

  next(): number {
    return this.advance();
  }

  nextInt(min: number, max: number): number {
    if (min > max) throw new RangeError('min must be <= max');
    if (min === max) return min;
    return min + Math.floor(this.next() * (max - min + 1));
  }

  nextBytes(count: number): Uint8Array {
    const bytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      bytes[i] = Math.floor(this.next() * 256);
    }
    return bytes;
  }
}
