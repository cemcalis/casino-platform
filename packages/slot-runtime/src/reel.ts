import type { RngProvider } from '@casino/rng';
import type { ReelStrip, SymbolId, SymbolGrid, ReelConfig } from './types';

export function extractWindow(strip: ReelStrip, startIndex: number, visibleRows: number): ReadonlyArray<SymbolId> {
  const len = strip.length;
  const window: SymbolId[] = [];
  for (let i = 0; i < visibleRows; i++) {
    window.push(strip[(startIndex + i) % len]!);
  }
  return window;
}

export function spinReels(reels: ReadonlyArray<ReelConfig>, rng: RngProvider): SymbolGrid {
  return reels.map((reel) => {
    const start = rng.nextInt(0, reel.strip.length - 1);
    return extractWindow(reel.strip, start, reel.visibleRows);
  });
}

export function getSymbolAt(grid: SymbolGrid, col: number, row: number): SymbolId | undefined {
  return grid[col]?.[row];
}
