import type { ForgeSymbol, GameManifest } from './types';
import { pickWeighted, type Rng } from './rng';

export interface WeightContext {
  isFreeSpin: boolean;
  anteActive: boolean;
}

export function symbolWeight(
  manifest: GameManifest,
  sym: ForgeSymbol,
  ctx: WeightContext,
): number {
  let w = ctx.isFreeSpin && sym.freeSpinWeight !== undefined ? sym.freeSpinWeight : sym.weight;
  if (ctx.anteActive && sym.kind === 'scatter' && manifest.anteBet) {
    w *= manifest.anteBet.scatterWeightFactor;
  }
  return w;
}

/** Sample one symbol id from the weighted set. */
export function sampleSymbol(manifest: GameManifest, rng: Rng, ctx: WeightContext): string {
  const weights = manifest.symbols.map((s) => symbolWeight(manifest, s, ctx));
  return manifest.symbols[pickWeighted(rng, weights)].id;
}

/**
 * Sample a full grid column-major. Each cell is drawn independently from the
 * weighted symbol distribution — equivalent to very long virtual reel strips.
 */
export function sampleGrid(manifest: GameManifest, rng: Rng, ctx: WeightContext): string[][] {
  const grid: string[][] = [];
  for (let c = 0; c < manifest.columns; c++) {
    const col: string[] = [];
    for (let r = 0; r < manifest.rows; r++) {
      col.push(sampleSymbol(manifest, rng, ctx));
    }
    grid.push(col);
  }
  return grid;
}

export function symbolById(manifest: GameManifest, id: string): ForgeSymbol {
  const sym = manifest.symbols.find((s) => s.id === id);
  if (!sym) throw new Error(`Unknown symbol id: ${id}`);
  return sym;
}

export function countSymbol(grid: string[][], id: string): number {
  let n = 0;
  for (const col of grid) for (const cell of col) if (cell === id) n++;
  return n;
}
