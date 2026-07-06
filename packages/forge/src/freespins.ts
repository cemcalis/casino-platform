import type { FreeSpinSession, GameManifest, SpinResult } from './types';
import { runSpin } from './spin';
import type { Rng } from './rng';

export function startFreeSpins(spinsAwarded: number): FreeSpinSession {
  return { remaining: spinsAwarded, totalAwarded: spinsAwarded, accumulatedWin: 0, spinIndex: 0 };
}

/**
 * Play one free spin and fold the result into the session.
 * Retriggers extend `remaining` and `totalAwarded`.
 */
export function playFreeSpin(
  manifest: GameManifest,
  session: FreeSpinSession,
  rng: Rng,
): { session: FreeSpinSession; result: SpinResult } {
  if (session.remaining <= 0) {
    throw new Error('Free spin session is exhausted');
  }
  const result = runSpin(manifest, rng, { isFreeSpin: true });
  const next: FreeSpinSession = {
    remaining: session.remaining - 1 + result.freeSpinsAwarded,
    totalAwarded: session.totalAwarded + result.freeSpinsAwarded,
    accumulatedWin: Math.min(
      Math.round((session.accumulatedWin + result.totalWin) * 100) / 100,
      manifest.maxWinMultiplier,
    ),
    spinIndex: session.spinIndex + 1,
  };
  return { session: next, result };
}

/** Play an entire free spin session to completion (used by the simulator). */
export function playFreeSpinSession(
  manifest: GameManifest,
  spinsAwarded: number,
  rng: Rng,
): FreeSpinSession {
  let session = startFreeSpins(spinsAwarded);
  // Safety valve: retriggers cannot extend a session indefinitely.
  const maxSpins = spinsAwarded + 50 * manifest.freeSpins.retriggerSpins + 100;
  let played = 0;
  while (session.remaining > 0 && played < maxSpins) {
    session = playFreeSpin(manifest, session, rng).session;
    played++;
  }
  return session;
}
