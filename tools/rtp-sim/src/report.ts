import type { SimulationResult } from './simulate';

export function toJson(result: SimulationResult): string {
  return JSON.stringify(result, null, 2);
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const SUMMARY_KEYS: ReadonlyArray<keyof SimulationResult> = [
  'gameId',
  'spins',
  'bet',
  'seed',
  'totalWagered',
  'totalPayout',
  'rtp',
  'hitCount',
  'hitFrequency',
  'averagePayoutMultiplier',
  'variance',
  'standardDeviation',
  'volatilityIndex',
  'volatilityClass',
  'scatterTriggerCount',
  'scatterTriggerFrequency',
  'freeSpinsAwardedTotal',
  'averageFreeSpinsPerTrigger',
  'bonusTriggerCount',
  'bonusTriggerFrequency',
  'durationMs',
];

// Flat, section-delimited CSV: summary metrics, then per-payline and per-symbol breakdowns.
export function toCsv(result: SimulationResult): string {
  const lines: string[] = [];

  lines.push('section,key,value');
  for (const key of SUMMARY_KEYS) {
    lines.push(`summary,${key},${csvEscape(String(result[key]))}`);
  }
  if (result.maxWin) {
    lines.push(`summary,maxWinSpinIndex,${result.maxWin.spinIndex}`);
    lines.push(`summary,maxWinPayout,${result.maxWin.payout}`);
    lines.push(`summary,maxWinMultiplier,${result.maxWin.multiplier}`);
  } else {
    lines.push('summary,maxWin,none');
  }

  lines.push('');
  lines.push('paylineIndex,hitCount,totalPayout');
  for (const p of result.paylineStats) {
    lines.push(`${p.paylineIndex},${p.hitCount},${p.totalPayout}`);
  }

  lines.push('');
  lines.push('symbolId,hitCount,totalPayout');
  for (const s of result.symbolStats) {
    lines.push(`${csvEscape(s.symbolId)},${s.hitCount},${s.totalPayout}`);
  }

  return lines.join('\n');
}
