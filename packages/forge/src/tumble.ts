import type { GameManifest, WinItem } from './types';
import { sampleSymbol, type WeightContext } from './grid';
import type { Rng } from './rng';

/**
 * Remove winning cells, let survivors fall down, refill from the top.
 * Returns a new grid; the input grid is not mutated.
 */
export function tumbleGrid(
  manifest: GameManifest,
  grid: string[][],
  wins: WinItem[],
  rng: Rng,
  ctx: WeightContext,
): string[][] {
  const burst = new Set<string>();
  for (const win of wins) {
    for (const [c, r] of win.cells) burst.add(`${c}:${r}`);
  }
  const next: string[][] = [];
  for (let c = 0; c < manifest.columns; c++) {
    const survivors: string[] = [];
    for (let r = 0; r < manifest.rows; r++) {
      if (!burst.has(`${c}:${r}`)) survivors.push(grid[c][r]);
    }
    const refill: string[] = [];
    while (refill.length + survivors.length < manifest.rows) {
      refill.push(sampleSymbol(manifest, rng, ctx));
    }
    // New symbols land on top (row 0 side), survivors settle to the bottom.
    next.push([...refill, ...survivors]);
  }
  return next;
}
