import type { GameManifest } from './types';

/** Classic 10-line set for 5×3 grids, [column, row] coordinates. */
export function standardPaylines10(): [number, number][][] {
  return [
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
    [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],
    [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]],
    [[0, 2], [1, 2], [2, 1], [3, 0], [4, 0]],
    [[0, 1], [1, 0], [2, 1], [3, 2], [4, 1]],
    [[0, 1], [1, 2], [2, 1], [3, 0], [4, 1]],
    [[0, 0], [1, 1], [2, 1], [3, 1], [4, 2]],
  ];
}

export function validateManifest(manifest: GameManifest): string[] {
  const errors: string[] = [];
  const push = (cond: boolean, msg: string) => {
    if (cond) errors.push(msg);
  };

  push(!/^[a-z0-9-]+$/.test(manifest.gameId), 'gameId must be kebab-case');
  push(manifest.columns < 3 || manifest.columns > 8, 'columns must be 3–8');
  push(manifest.rows < 3 || manifest.rows > 6, 'rows must be 3–6');
  push(manifest.symbols.length < 6, 'need at least 6 symbols');
  push(
    manifest.targetRtp.min < 0.85 || manifest.targetRtp.max > 0.99,
    'targetRtp must stay within 85%–99% (social play, still realistic)',
  );
  push(manifest.maxWinMultiplier < 100, 'maxWinMultiplier should be at least 100x');

  const ids = new Set<string>();
  for (const sym of manifest.symbols) {
    push(ids.has(sym.id), `duplicate symbol id: ${sym.id}`);
    ids.add(sym.id);
    push(sym.weight <= 0, `symbol ${sym.id} weight must be positive`);
    const kinds = Object.keys(sym.payouts).map(Number);
    push(
      sym.kind !== 'scatter' && sym.kind !== 'bomb' && kinds.length === 0,
      `symbol ${sym.id} needs payouts`,
    );
  }

  const scatters = manifest.symbols.filter((s) => s.kind === 'scatter');
  push(scatters.length !== 1, 'exactly one scatter symbol is required');
  push(Object.keys(manifest.freeSpins.awards).length === 0, 'freeSpins.awards is empty');

  if (manifest.payModel === 'lines') {
    push(!manifest.paylines || manifest.paylines.length < 5, 'lines mode needs ≥5 paylines');
    for (const line of manifest.paylines ?? []) {
      push(line.length !== manifest.columns, 'each payline must span all columns');
      for (const [c, r] of line) {
        push(c < 0 || c >= manifest.columns || r < 0 || r >= manifest.rows, 'payline out of grid');
      }
    }
    push(
      manifest.symbols.some((s) => s.kind === 'bomb'),
      'bomb symbols belong to scatterPays games',
    );
  } else {
    push(!manifest.tumble, 'scatterPays games must tumble');
    const hasBomb = manifest.symbols.some((s) => s.kind === 'bomb');
    const hasValues = (manifest.freeSpins.bombValues ?? []).length > 0;
    push(hasBomb !== hasValues, 'bomb symbol and freeSpins.bombValues must come together');
  }

  if (manifest.bonusBuy) {
    push(
      manifest.bonusBuy.costMultiplier < 20 || manifest.bonusBuy.costMultiplier > 500,
      'bonusBuy.costMultiplier must be 20–500× bet',
    );
  }
  return errors;
}

export function assertValidManifest(manifest: GameManifest): void {
  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    throw new Error(`Invalid manifest ${manifest.gameId}:\n- ${errors.join('\n- ')}`);
  }
}
