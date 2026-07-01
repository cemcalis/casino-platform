import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveGame, type PaylineCount } from './games';
import { runMonteCarloSimulation } from './simulate';
import { toCsv, toJson } from './report';

interface CliArgs {
  readonly game: string;
  readonly spins: number;
  readonly bet?: number;
  readonly paylines?: PaylineCount;
  readonly seed?: string;
  readonly format: 'json' | 'csv' | 'both';
  readonly outDir: string;
}

function parseArgs(argv: readonly string[]): CliArgs {
  const opts = new Map<string, string>();
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) opts.set(match[1]!, match[2]!);
  }

  const format = opts.get('format') ?? 'both';
  if (format !== 'json' && format !== 'csv' && format !== 'both') {
    throw new Error(`--format must be json|csv|both, got "${format}"`);
  }

  return {
    game: opts.get('game') ?? 'neon-palace',
    spins: Number(opts.get('spins') ?? '100000'),
    bet: opts.has('bet') ? Number(opts.get('bet')) : undefined,
    paylines: opts.has('paylines') ? (Number(opts.get('paylines')) as PaylineCount) : undefined,
    seed: opts.get('seed'),
    format,
    outDir: opts.get('out') ?? join(__dirname, '..', 'reports'),
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const config = resolveGame(args.game, args.paylines);

  const result = runMonteCarloSimulation({
    config,
    gameId: args.game,
    spins: args.spins,
    bet: args.bet,
    seed: args.seed,
  });

  console.log(`RTP simulation — ${result.gameId}`);
  console.log(`  spins:                  ${result.spins}`);
  console.log(`  bet:                    ${result.bet}`);
  console.log(`  RTP:                    ${(result.rtp * 100).toFixed(2)}%`);
  console.log(`  hit frequency:          ${(result.hitFrequency * 100).toFixed(2)}%`);
  console.log(`  volatility:             ${result.volatilityClass} (index ${result.volatilityIndex.toFixed(3)})`);
  console.log(`  scatter trigger freq:   ${(result.scatterTriggerFrequency * 100).toFixed(3)}%`);
  console.log(`  avg free spins/trigger: ${result.averageFreeSpinsPerTrigger.toFixed(2)}`);
  console.log(`  bonus trigger freq:     ${(result.bonusTriggerFrequency * 100).toFixed(3)}%`);
  if (result.maxWin) {
    console.log(
      `  max win:                ${result.maxWin.payout} (${result.maxWin.multiplier.toFixed(2)}x) at spin #${result.maxWin.spinIndex}`,
    );
  }
  console.log(`  duration:               ${result.durationMs}ms`);

  mkdirSync(args.outDir, { recursive: true });
  const stamp = `${result.gameId}-${Date.now()}`;

  if (args.format === 'json' || args.format === 'both') {
    const path = join(args.outDir, `${stamp}.json`);
    writeFileSync(path, toJson(result), 'utf8');
    console.log(`  json report:            ${path}`);
  }
  if (args.format === 'csv' || args.format === 'both') {
    const path = join(args.outDir, `${stamp}.csv`);
    writeFileSync(path, toCsv(result), 'utf8');
    console.log(`  csv report:             ${path}`);
  }
}

main();
