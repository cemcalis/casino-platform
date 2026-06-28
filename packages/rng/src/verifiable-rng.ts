import { createHmac } from 'node:crypto';
import type { VerifiableResult } from './types';

// Provably fair RNG: HMAC-SHA256(serverSeed, clientSeed:nonce)
// Before each round, the server publishes hash(serverSeed).
// After the round, it reveals serverSeed so the player can verify.
export class VerifiableRng {
  constructor(private readonly serverSeed: string) {
    if (!serverSeed) throw new Error('serverSeed must not be empty');
  }

  generate(clientSeed: string, nonce: number): VerifiableResult {
    if (!clientSeed) throw new Error('clientSeed must not be empty');
    if (!Number.isInteger(nonce) || nonce < 0) throw new Error('nonce must be a non-negative integer');

    const message = `${clientSeed}:${nonce}`;
    const hash = createHmac('sha256', this.serverSeed).update(message).digest('hex');

    // Convert first 8 hex chars (4 bytes) to a uniform float in [0, 1)
    const intValue = parseInt(hash.substring(0, 8), 16);
    const value = intValue / 0x100000000;

    return { value, seed: this.serverSeed, nonce, hash };
  }

  // Commit to a serverSeed before revealing it — publish this hash to players before the round
  static commitSeed(serverSeed: string): string {
    return createHmac('sha256', serverSeed).update('seed-commitment').digest('hex');
  }

  // Players call this after the round to verify the outcome was not manipulated
  static verify(serverSeed: string, clientSeed: string, nonce: number, expectedHash: string): boolean {
    const message = `${clientSeed}:${nonce}`;
    const computed = createHmac('sha256', serverSeed).update(message).digest('hex');
    return computed === expectedHash;
  }
}
