import { describe, expect, it } from 'vitest';
import { emberFalls, sugarRealm } from '../reference-manifests';
import { validateManifest } from '../manifest';
import { CATALOG } from './catalog';

/**
 * Variants inherit calibrated RTP by construction: weights and payout
 * tables must match their base profile position-for-position. This test
 * enforces that invariant so the 200k-spin gate on the two references
 * covers the whole catalog.
 */

const mathFingerprint = (m: ReturnType<typeof emberFalls>) =>
  m.symbols.map((s) => ({
    weight: s.weight,
    freeSpinWeight: s.freeSpinWeight,
    kind: s.kind,
    payouts: s.payouts,
  }));

describe('catalog variants', () => {
  const ember = mathFingerprint(emberFalls());
  const sugar = mathFingerprint(sugarRealm());

  for (const make of CATALOG) {
    const m = make();
    it(`${m.gameId} is structurally valid`, () => {
      expect(() => validateManifest(m)).not.toThrow();
    });

    it(`${m.gameId} inherits a gated math profile exactly`, () => {
      const fp = mathFingerprint(m);
      const base = m.payModel === 'lines' ? ember : sugar;
      expect(fp).toEqual(base);
    });

    it(`${m.gameId} has unique symbol ids with matching asset paths`, () => {
      const ids = m.symbols.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(m.theme.assets?.symbols?.[id]).toBe(
          `/assets/${m.gameId}/symbols/${id}.png`,
        );
      }
    });
  }
});
