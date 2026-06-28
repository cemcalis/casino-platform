export interface RngProvider {
  next(): number;
  nextInt(min: number, max: number): number;
  nextBytes(count: number): Uint8Array;
}

export interface VerifiableResult {
  readonly value: number;
  readonly seed: string;
  readonly nonce: number;
  readonly hash: string;
}
