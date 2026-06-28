import { randomBytes, randomInt } from 'node:crypto';
import type { RngProvider } from './types';

export class CryptoRng implements RngProvider {
  next(): number {
    const buf = randomBytes(8);
    const view = new DataView(buf.buffer);
    // 53 mantissa bits: combine two 32-bit values with bit shifts
    const hi = view.getUint32(0, false) >>> 5;
    const lo = view.getUint32(4, false) >>> 6;
    return (hi * 0x4000000 + lo) / 0x20000000000000;
  }

  nextInt(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new TypeError('min and max must be integers');
    }
    if (min > max) throw new RangeError('min must be <= max');
    if (min === max) return min;
    return randomInt(min, max + 1);
  }

  nextBytes(count: number): Uint8Array {
    if (count < 0) throw new RangeError('count must be non-negative');
    return new Uint8Array(randomBytes(count));
  }

  static generateSeed(): string {
    return randomBytes(32).toString('hex');
  }
}
