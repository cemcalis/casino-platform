import type { SymbolGrid, Payline, PayTable, PaylineWin, PaylineCoord, SymbolId } from './types';

function resolveSymbol(sym: SymbolId, wildId: SymbolId | null): SymbolId {
  return sym === wildId ? ('' as SymbolId) : sym;
}

function isWild(sym: SymbolId, wildId: SymbolId | null): boolean {
  return wildId !== null && sym === wildId;
}

function getEntry(payTable: PayTable, symbolId: SymbolId) {
  return payTable.entries.find((e) => e.symbolId === symbolId) ?? null;
}

export function evaluatePayline(
  grid: SymbolGrid,
  payline: Payline,
  paylineIndex: number,
  bet: number,
  payTable: PayTable,
): PaylineWin | null {
  if (payline.length === 0) return null;

  const { wildId, scatterId, minMatchCount } = payTable;

  // Get the symbol at each position along the payline
  const syms = payline.map((coord) => grid[coord.col]?.[coord.row] as SymbolId);

  // Scatters do not contribute to payline wins
  if (syms.some((s) => s === scatterId)) return null;

  // Find the anchor symbol (first non-wild) to determine the winning combination
  let anchorSym: SymbolId | null = null;
  for (const s of syms) {
    if (!isWild(s, wildId)) {
      anchorSym = s;
      break;
    }
  }

  // All wilds — use wild's own pay table entry
  if (anchorSym === null) {
    anchorSym = wildId;
  }
  if (anchorSym === null) return null;

  // Count consecutive matching symbols from left (wild matches anything)
  let matchCount = 0;
  const matchedPositions: PaylineCoord[] = [];

  for (let i = 0; i < syms.length; i++) {
    const s = syms[i]!;
    if (s === anchorSym || isWild(s, wildId)) {
      matchCount++;
      matchedPositions.push(payline[i]!);
    } else {
      break; // chain broken
    }
  }

  if (matchCount < minMatchCount) return null;

  const entry = getEntry(payTable, anchorSym);
  if (!entry) return null;

  const multiplier = entry.multipliers[matchCount] ?? 0;
  if (multiplier === 0) return null;

  return {
    paylineIndex,
    symbolId: anchorSym,
    matchCount,
    multiplier,
    payout: bet * multiplier,
    positions: matchedPositions,
  };
}

export function evaluateAllPaylines(
  grid: SymbolGrid,
  paylines: ReadonlyArray<Payline>,
  bet: number,
  payTable: PayTable,
): ReadonlyArray<PaylineWin> {
  const wins: PaylineWin[] = [];
  for (let i = 0; i < paylines.length; i++) {
    const win = evaluatePayline(grid, paylines[i]!, i, bet, payTable);
    if (win !== null) wins.push(win);
  }
  return wins;
}
