export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
}

/** Deterministic mulberry32 — used by the simulator and unit tests. */
export function seededRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Crypto-backed RNG for live play in the browser or on the server. */
export function cryptoRng(): Rng {
  const cryptoObj: Crypto | undefined =
    typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (!cryptoObj) return seededRng(Date.now() & 0xffffffff);
  const buf = new Uint32Array(64);
  let idx = buf.length;
  return {
    next() {
      if (idx >= buf.length) {
        cryptoObj.getRandomValues(buf);
        idx = 0;
      }
      return buf[idx++] / 4294967296;
    },
  };
}

/** Pick an index from a weight table; weights must be positive. */
export function pickWeighted(rng: Rng, weights: number[]): number {
  let total = 0;
  for (const w of weights) total += w;
  let roll = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return weights.length - 1;
}
