import { describe, it, expect } from 'vitest';
import { extractWindow, spinReels, getSymbolAt } from './reel';
import { SeededRng } from '@casino/rng';
import { symbolId } from './types';
import type { ReelStrip } from './types';

const strip: ReelStrip = [
  symbolId('a'), symbolId('b'), symbolId('c'),
  symbolId('d'), symbolId('e'), symbolId('f'),
];

describe('extractWindow', () => {
  it('extracts the correct number of symbols', () => {
    expect(extractWindow(strip, 0, 3)).toHaveLength(3);
  });

  it('extracts from the correct position', () => {
    const win = extractWindow(strip, 1, 3);
    expect(win[0]).toBe(symbolId('b'));
    expect(win[1]).toBe(symbolId('c'));
    expect(win[2]).toBe(symbolId('d'));
  });

  it('wraps around at the end of the strip', () => {
    const win = extractWindow(strip, 5, 3);
    expect(win[0]).toBe(symbolId('f'));
    expect(win[1]).toBe(symbolId('a'));
    expect(win[2]).toBe(symbolId('b'));
  });

  it('wraps with startIndex = strip.length - 1', () => {
    const win = extractWindow(strip, strip.length - 1, 2);
    expect(win[0]).toBe(symbolId('f'));
    expect(win[1]).toBe(symbolId('a'));
  });

  it('returns single symbol window', () => {
    expect(extractWindow(strip, 2, 1)).toEqual([symbolId('c')]);
  });

  it('returns full strip when visibleRows = strip.length', () => {
    const win = extractWindow(strip, 0, strip.length);
    expect(win).toEqual([...strip]);
  });
});

describe('spinReels', () => {
  it('returns one column per reel', () => {
    const rng = new SeededRng('test-seed');
    const reels = [
      { strip, visibleRows: 3 },
      { strip, visibleRows: 3 },
      { strip, visibleRows: 3 },
    ];
    const grid = spinReels(reels, rng);
    expect(grid).toHaveLength(3);
  });

  it('each column has the correct number of rows', () => {
    const rng = new SeededRng('test-seed');
    const reels = [
      { strip, visibleRows: 3 },
      { strip, visibleRows: 2 },
      { strip, visibleRows: 4 },
    ];
    const grid = spinReels(reels, rng);
    expect(grid[0]).toHaveLength(3);
    expect(grid[1]).toHaveLength(2);
    expect(grid[2]).toHaveLength(4);
  });

  it('is deterministic with the same seed', () => {
    const rng1 = new SeededRng('same-seed');
    const rng2 = new SeededRng('same-seed');
    const reels = [{ strip, visibleRows: 3 }, { strip, visibleRows: 3 }];
    expect(spinReels(reels, rng1)).toEqual(spinReels(reels, rng2));
  });

  it('all returned symbols exist in the strip', () => {
    const rng = new SeededRng('any-seed');
    const reels = [{ strip, visibleRows: 3 }];
    const grid = spinReels(reels, rng);
    const validSymbols = new Set(strip as unknown as string[]);
    for (const sym of grid[0]!) {
      expect(validSymbols.has(sym)).toBe(true);
    }
  });
});

describe('getSymbolAt', () => {
  it('returns correct symbol', () => {
    const rng = new SeededRng('s');
    const grid = spinReels([{ strip, visibleRows: 3 }], rng);
    expect(getSymbolAt(grid, 0, 0)).toBe(grid[0]![0]);
  });

  it('returns undefined for out-of-bounds col', () => {
    const rng = new SeededRng('s');
    const grid = spinReels([{ strip, visibleRows: 3 }], rng);
    expect(getSymbolAt(grid, 99, 0)).toBeUndefined();
  });

  it('returns undefined for out-of-bounds row', () => {
    const rng = new SeededRng('s');
    const grid = spinReels([{ strip, visibleRows: 3 }], rng);
    expect(getSymbolAt(grid, 0, 99)).toBeUndefined();
  });
});
