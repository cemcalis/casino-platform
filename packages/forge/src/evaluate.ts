import type { GameManifest, WinItem } from './types';
import { symbolById } from './grid';

/**
 * Evaluate one grid state. Returns wins in bet-relative multiplier terms:
 * lines mode pays × (bet / paylineCount), scatterPays mode pays × bet.
 * Scatter symbols never pay here — they only trigger free spins.
 */
export function evaluateGrid(manifest: GameManifest, grid: string[][]): WinItem[] {
  return manifest.payModel === 'lines'
    ? evaluateLines(manifest, grid)
    : evaluateScatterPays(manifest, grid);
}

function evaluateLines(manifest: GameManifest, grid: string[][]): WinItem[] {
  const paylines = manifest.paylines ?? [];
  const wins: WinItem[] = [];
  const lineBetFactor = 1 / Math.max(paylines.length, 1);

  paylines.forEach((line, lineIndex) => {
    const first = grid[line[0][0]][line[0][1]];
    const firstSym = symbolById(manifest, first);
    // Resolve target symbol: leading wilds defer to the first non-wild symbol.
    let target = firstSym;
    if (firstSym.kind === 'wild') {
      for (const [c, r] of line) {
        const s = symbolById(manifest, grid[c][r]);
        if (s.kind !== 'wild') {
          target = s;
          break;
        }
      }
    }
    if (target.kind === 'scatter') return;

    let count = 0;
    const cells: [number, number][] = [];
    for (const [c, r] of line) {
      const s = symbolById(manifest, grid[c][r]);
      if (s.id === target.id || s.kind === 'wild') {
        count++;
        cells.push([c, r]);
      } else {
        break;
      }
    }
    const payout = target.payouts[count];
    if (payout) {
      wins.push({
        symbolId: target.id,
        count,
        cells,
        amount: payout * lineBetFactor,
        lineIndex,
      });
    }
  });
  return wins;
}

function evaluateScatterPays(manifest: GameManifest, grid: string[][]): WinItem[] {
  const wins: WinItem[] = [];
  const counts = new Map<string, [number, number][]>();
  for (let c = 0; c < grid.length; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      const id = grid[c][r];
      const list = counts.get(id) ?? [];
      list.push([c, r]);
      counts.set(id, list);
    }
  }
  for (const [id, cells] of counts) {
    const sym = symbolById(manifest, id);
    if (sym.kind === 'scatter' || sym.kind === 'bomb') continue;
    // payouts keys are minimum cluster sizes; pick the highest satisfied tier.
    const tiers = Object.keys(sym.payouts)
      .map(Number)
      .sort((a, b) => b - a);
    const tier = tiers.find((t) => cells.length >= t);
    if (tier !== undefined) {
      wins.push({ symbolId: id, count: cells.length, cells, amount: sym.payouts[tier] });
    }
  }
  return wins;
}

export function totalWinOf(wins: WinItem[]): number {
  let sum = 0;
  for (const w of wins) sum += w.amount;
  return sum;
}
