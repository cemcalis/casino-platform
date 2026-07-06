import { describe, expect, it } from 'vitest';
import { evaluateGrid, totalWinOf } from './evaluate';
import { emberFalls, sugarRealm } from './reference-manifests';

describe('evaluateGrid — lines mode', () => {
  const manifest = emberFalls();

  const flatGrid = (id: string) =>
    Array.from({ length: manifest.columns }, () => Array.from({ length: manifest.rows }, () => id));

  it('pays a full line of a single symbol on every payline', () => {
    const wins = evaluateGrid(manifest, flatGrid('ember'));
    expect(wins).toHaveLength(manifest.paylines!.length);
    const emberPay5 = manifest.symbols.find((s) => s.id === 'ember')!.payouts[5];
    const perLine = emberPay5 / manifest.paylines!.length;
    expect(wins[0].amount).toBeCloseTo(perLine);
  });

  it('substitutes wilds into the target symbol run', () => {
    const grid = flatGrid('fern');
    grid[1][1] = 'wild'; // middle row line 0 passes through [1,1]
    const wins = evaluateGrid(manifest, grid);
    const midLine = wins.find((w) => w.lineIndex === 0);
    expect(midLine).toBeDefined();
    expect(midLine!.count).toBe(5);
  });

  it('does not pay scatter as a line symbol', () => {
    const wins = evaluateGrid(manifest, flatGrid('scatter'));
    expect(wins).toHaveLength(0);
  });

  it('stops a run at the first non-matching symbol', () => {
    const grid = flatGrid('ash');
    grid[2][1] = 'ember'; // breaks middle line after 2 symbols → below 3-kind
    const midLine = evaluateGrid(manifest, grid).find((w) => w.lineIndex === 0);
    expect(midLine).toBeUndefined();
  });
});

describe('evaluateGrid — scatterPays mode', () => {
  const manifest = sugarRealm();

  it('pays symbol clusters of 8+ anywhere', () => {
    const grid = Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => 'mint'));
    // 30 mints → highest tier (12+): pays 2× bet.
    const wins = evaluateGrid(manifest, grid);
    expect(wins).toHaveLength(1);
    expect(wins[0].amount).toBe(2);
    expect(wins[0].count).toBe(30);
  });

  it('ignores clusters below the minimum tier', () => {
    const grid = Array.from({ length: 6 }, (_, c) =>
      Array.from({ length: 5 }, (_, r) => (c === 0 && r < 5 ? 'crown' : `f${c}-${r}`)),
    );
    // 5 crowns only — grid is padded with unique junk ids that would throw if
    // evaluated, so stub them as distinct regular symbols via the mint fallback.
    const safe = grid.map((col) => col.map((id) => (id.startsWith('f') ? 'berry' : id)));
    // 25 berries pay, 5 crowns do not.
    const wins = evaluateGrid(manifest, safe);
    expect(wins.map((w) => w.symbolId)).toEqual(['berry']);
  });

  it('never pays bombs or scatters as clusters', () => {
    const grid = Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => 'bomb'));
    expect(totalWinOf(evaluateGrid(manifest, grid))).toBe(0);
  });
});
