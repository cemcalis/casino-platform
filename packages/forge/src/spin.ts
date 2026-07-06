import type { GameManifest, SpinResult, SpinStep } from './types';
import { countSymbol, sampleGrid, symbolById, type WeightContext } from './grid';
import { evaluateGrid, totalWinOf } from './evaluate';
import { tumbleGrid } from './tumble';
import { pickWeighted, type Rng } from './rng';

export interface SpinOptions {
  isFreeSpin?: boolean;
  anteActive?: boolean;
  /** Force scatter trigger on the first sampled grid (bonus buy). */
  forceTrigger?: boolean;
}

const MAX_TUMBLES = 40;

/**
 * Run one complete spin: sample → evaluate → tumble until dry.
 * All win amounts are × total bet. The UI replays `steps` for presentation.
 */
export function runSpin(manifest: GameManifest, rng: Rng, opts: SpinOptions = {}): SpinResult {
  const ctx: WeightContext = {
    isFreeSpin: opts.isFreeSpin ?? false,
    anteActive: opts.anteActive ?? false,
  };
  const scatterId = manifest.symbols.find((s) => s.kind === 'scatter')?.id;

  let grid = sampleGrid(manifest, rng, ctx);
  if (opts.forceTrigger && scatterId) {
    grid = forceScatters(manifest, grid, scatterId, rng);
  }

  const steps: SpinStep[] = [];
  let totalWin = 0;
  let stepIndex = 0;

  for (;;) {
    const wins = evaluateGrid(manifest, grid);
    const bombs = collectBombs(manifest, grid, rng, ctx);
    const baseWin = totalWinOf(wins);
    const multiplier = stepMultiplier(manifest, ctx, stepIndex, bombs, baseWin);
    const stepWin = round2(baseWin * multiplier);
    steps.push({ grid, wins, stepWin, appliedMultiplier: multiplier, bombs });
    totalWin += stepWin;

    const shouldTumble = manifest.tumble && wins.length > 0 && stepIndex < MAX_TUMBLES;
    if (!shouldTumble) break;
    grid = tumbleGrid(manifest, grid, wins, rng, ctx);
    stepIndex++;
  }

  totalWin = Math.min(round2(totalWin), manifest.maxWinMultiplier);

  const scatterCount = scatterId ? countSymbol(steps[0].grid, scatterId) : 0;
  const freeSpinsAwarded = awardForScatters(manifest, scatterCount, ctx.isFreeSpin);

  return {
    steps,
    totalWin,
    scatterCount,
    freeSpinsAwarded,
    isFreeSpin: ctx.isFreeSpin,
  };
}

function awardForScatters(
  manifest: GameManifest,
  scatterCount: number,
  isFreeSpin: boolean,
): number {
  if (isFreeSpin) {
    // Retrigger: any qualifying scatter count adds fixed spins.
    const minTrigger = Math.min(...Object.keys(manifest.freeSpins.awards).map(Number));
    return scatterCount >= minTrigger ? manifest.freeSpins.retriggerSpins : 0;
  }
  const tiers = Object.keys(manifest.freeSpins.awards)
    .map(Number)
    .sort((a, b) => b - a);
  const tier = tiers.find((t) => scatterCount >= t);
  return tier !== undefined ? manifest.freeSpins.awards[tier] : 0;
}

/**
 * scatterPays free spins: bombs on the grid contribute their summed value as a
 * win multiplier (applied only when the step actually wins).
 * lines mode free spins: the tumble ladder multiplier applies per step.
 */
function stepMultiplier(
  manifest: GameManifest,
  ctx: WeightContext,
  stepIndex: number,
  bombs: { cell: [number, number]; value: number }[],
  baseWin: number,
): number {
  if (baseWin <= 0) return 1;
  if (manifest.payModel === 'scatterPays') {
    if (!ctx.isFreeSpin || bombs.length === 0) return 1;
    let sum = 0;
    for (const b of bombs) sum += b.value;
    return Math.max(sum, 1);
  }
  const ladder = manifest.freeSpins.multiplierLadder;
  if (!ctx.isFreeSpin || !ladder || ladder.length === 0) return 1;
  return ladder[Math.min(stepIndex, ladder.length - 1)];
}

function collectBombs(
  manifest: GameManifest,
  grid: string[][],
  rng: Rng,
  ctx: WeightContext,
): { cell: [number, number]; value: number }[] {
  if (manifest.payModel !== 'scatterPays' || !ctx.isFreeSpin) return [];
  const bombValues = manifest.freeSpins.bombValues ?? [];
  if (bombValues.length === 0) return [];
  const bombs: { cell: [number, number]; value: number }[] = [];
  for (let c = 0; c < grid.length; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      if (symbolById(manifest, grid[c][r]).kind === 'bomb') {
        const idx = pickWeighted(
          rng,
          bombValues.map((b) => b.weight),
        );
        bombs.push({ cell: [c, r], value: bombValues[idx].value });
      }
    }
  }
  return bombs;
}

/** Overwrite random distinct cells so the grid holds the minimum trigger count. */
function forceScatters(
  manifest: GameManifest,
  grid: string[][],
  scatterId: string,
  rng: Rng,
): string[][] {
  const minTrigger = Math.min(...Object.keys(manifest.freeSpins.awards).map(Number));
  const next = grid.map((col) => [...col]);
  let present = countSymbol(next, scatterId);
  let guard = 0;
  while (present < minTrigger && guard++ < 200) {
    const c = Math.floor(rng.next() * manifest.columns);
    const r = Math.floor(rng.next() * manifest.rows);
    if (next[c][r] !== scatterId) {
      next[c][r] = scatterId;
      present++;
    }
  }
  return next;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
