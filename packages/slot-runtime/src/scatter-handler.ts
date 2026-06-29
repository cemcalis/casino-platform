import type { SymbolGrid, PayTable, ScatterWin, BonusTrigger, PaylineCoord } from './types';

function findSymbolPositions(grid: SymbolGrid, targetId: string): PaylineCoord[] {
  const positions: PaylineCoord[] = [];
  for (let col = 0; col < grid.length; col++) {
    const column = grid[col]!;
    for (let row = 0; row < column.length; row++) {
      if (column[row] === targetId) {
        positions.push({ col, row });
      }
    }
  }
  return positions;
}

export function evaluateScatter(
  grid: SymbolGrid,
  totalBet: number,
  payTable: PayTable,
): ScatterWin | null {
  const { scatterId, scatterMultipliers, scatterFreeSpins } = payTable;
  if (!scatterId) return null;

  const positions = findSymbolPositions(grid, scatterId);
  const count = positions.length;

  const multiplier = scatterMultipliers[count] ?? 0;
  const freeSpinsAwarded = scatterFreeSpins[count] ?? 0;

  if (multiplier === 0 && freeSpinsAwarded === 0) return null;

  return {
    symbolId: scatterId,
    count,
    multiplier,
    payout: totalBet * multiplier,
    freeSpinsAwarded,
    positions,
  };
}

export function evaluateBonus(
  grid: SymbolGrid,
  payTable: PayTable,
): BonusTrigger | null {
  const { bonusId, bonusTriggerCount } = payTable;
  if (!bonusId) return null;

  const positions = findSymbolPositions(grid, bonusId);
  const count = positions.length;

  if (count < bonusTriggerCount) return null;

  return {
    symbolId: bonusId,
    count,
    positions,
  };
}
