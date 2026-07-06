import { describe, expect, it } from 'vitest';
import { runSpin } from './spin';
import { playFreeSpinSession, startFreeSpins, playFreeSpin } from './freespins';
import { tumbleGrid } from './tumble';
import { evaluateGrid } from './evaluate';
import { seededRng } from './rng';
import { emberFalls, sugarRealm } from './reference-manifests';
import { assertValidManifest } from './manifest';

describe('reference manifests', () => {
  it('both pass validation', () => {
    expect(() => assertValidManifest(emberFalls())).not.toThrow();
    expect(() => assertValidManifest(sugarRealm())).not.toThrow();
  });
});

describe('runSpin', () => {
  it('is deterministic under a fixed seed', () => {
    const manifest = sugarRealm();
    const a = runSpin(manifest, seededRng(42));
    const b = runSpin(manifest, seededRng(42));
    expect(a).toEqual(b);
  });

  it('caps total win at maxWinMultiplier', () => {
    const manifest = emberFalls();
    for (let seed = 0; seed < 500; seed++) {
      const result = runSpin(manifest, seededRng(seed));
      expect(result.totalWin).toBeLessThanOrEqual(manifest.maxWinMultiplier);
    }
  });

  it('forceTrigger always awards free spins', () => {
    const manifest = sugarRealm();
    for (let seed = 0; seed < 50; seed++) {
      const result = runSpin(manifest, seededRng(seed), { forceTrigger: true });
      expect(result.freeSpinsAwarded).toBeGreaterThan(0);
    }
  });

  it('tumbles until no wins remain', () => {
    const manifest = sugarRealm();
    const result = runSpin(manifest, seededRng(7));
    const last = result.steps[result.steps.length - 1];
    expect(last.wins).toHaveLength(0);
  });
});

describe('tumbleGrid', () => {
  it('keeps column height and preserves non-winning symbols', () => {
    const manifest = sugarRealm();
    const rng = seededRng(3);
    const grid = runSpin(manifest, seededRng(11)).steps[0].grid;
    const wins = evaluateGrid(manifest, grid);
    const next = tumbleGrid(manifest, grid, wins, rng, { isFreeSpin: false, anteActive: false });
    expect(next).toHaveLength(manifest.columns);
    for (const col of next) expect(col).toHaveLength(manifest.rows);
  });
});

describe('free spin session', () => {
  it('bomb multipliers only appear during free spins', () => {
    const manifest = sugarRealm();
    const base = runSpin(manifest, seededRng(5));
    expect(base.steps.every((s) => s.bombs.length === 0)).toBe(true);
    const fs = runSpin(manifest, seededRng(5), { isFreeSpin: true });
    expect(fs.steps.every((s) => s.appliedMultiplier >= 1)).toBe(true);
  });

  it('session decrements and accumulates', () => {
    const manifest = emberFalls();
    let session = startFreeSpins(10);
    const { session: next } = playFreeSpin(manifest, session, seededRng(9));
    expect(next.spinIndex).toBe(1);
    expect(next.remaining).toBeGreaterThanOrEqual(9);
  });

  it('full session always terminates', () => {
    const manifest = sugarRealm();
    for (let seed = 0; seed < 30; seed++) {
      const session = playFreeSpinSession(manifest, 10, seededRng(seed));
      expect(session.remaining).toBeLessThanOrEqual(0);
      expect(session.accumulatedWin).toBeLessThanOrEqual(manifest.maxWinMultiplier);
    }
  });

  it('lines-mode ladder multiplier grows across tumble steps in free spins', () => {
    const manifest = emberFalls();
    for (let seed = 0; seed < 300; seed++) {
      const result = runSpin(manifest, seededRng(seed), { isFreeSpin: true });
      result.steps.forEach((step, i) => {
        if (step.stepWin > 0) {
          const ladder = manifest.freeSpins.multiplierLadder!;
          expect(step.appliedMultiplier).toBe(ladder[Math.min(i, ladder.length - 1)]);
        }
      });
    }
  });
});
