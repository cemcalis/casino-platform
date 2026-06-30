#!/usr/bin/env node
/**
 * asset:check — Check which assets from the manifest have been placed in public/.
 *
 * Usage:
 *   node tools/asset-factory/check.mjs [--game=neon-palace] [--type=symbol] [--json]
 *
 * Exit codes:
 *   0 — all non-placeholder assets are placed
 *   1 — some expected assets are missing from public/
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { findRepoRoot, readManifest, warn, info, dim, c } from './utils.mjs';

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);

const game       = args.game ?? 'neon-palace';
const typeFilter = args.type ?? null;
const jsonOutput = '--json' in args;

// ── Setup ─────────────────────────────────────────────────────────────────────
let root;
try {
  root = findRepoRoot(import.meta.url);
} catch (err) {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
}

let manifest;
try {
  manifest = readManifest(root, game);
} catch (err) {
  process.stderr.write(`\n${err.message}\n\n`);
  process.exit(1);
}

// ── Check each asset ──────────────────────────────────────────────────────────
const results = manifest.assets
  .filter(a => !typeFilter || a.type === typeFilter)
  .map(a => {
    const publicFile = join(root, 'apps', 'web', 'public', a.path);
    const placed     = existsSync(publicFile);
    return {
      id:          a.id,
      name:        a.name,
      type:        a.type,
      status:      a.status,
      path:        a.path,
      placed,
      publicFile,
      fallback:    a.fallback,
    };
  });

// ── JSON output mode ──────────────────────────────────────────────────────────
if (jsonOutput) {
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  process.exit(results.some(r => r.status !== 'placeholder' && !r.placed) ? 1 : 0);
}

// ── Human output ─────────────────────────────────────────────────────────────
process.stdout.write('\n');
info(`${c.bold}Asset check — ${game}${c.reset}${typeFilter ? ` [type: ${typeFilter}]` : ''}\n`);

const COL_ID   = 22;
const COL_TYPE = 12;
const COL_ST   = 12;

dim(`  ${'ID'.padEnd(COL_ID)} ${'TYPE'.padEnd(COL_TYPE)} ${'STATUS'.padEnd(COL_ST)} PLACED`);
dim(`  ${'─'.repeat(COL_ID)} ${'─'.repeat(COL_TYPE)} ${'─'.repeat(COL_ST)} ──────`);

let placed = 0, missing = 0, placeholder = 0;

for (const r of results) {
  if (r.status === 'placeholder') {
    placeholder++;
    const line = `  ${r.id.padEnd(COL_ID)} ${r.type.padEnd(COL_TYPE)} ${r.status.padEnd(COL_ST)} —`;
    dim(line);
    continue;
  }
  if (r.placed) {
    placed++;
    process.stdout.write(`${c.green}✓${c.reset} ${r.id.padEnd(COL_ID)} ${r.type.padEnd(COL_TYPE)} ${r.status.padEnd(COL_ST)} ${c.green}yes${c.reset}\n`);
  } else {
    missing++;
    process.stderr.write(`${c.red}✗${c.reset} ${r.id.padEnd(COL_ID)} ${r.type.padEnd(COL_TYPE)} ${r.status.padEnd(COL_ST)} ${c.red}MISSING${c.reset}\n`);
    dim(`    expected at: apps/web/public${r.path}`);
  }
}

process.stdout.write('\n');
info(`Summary: ${c.green}${placed} placed${c.reset}  |  ${c.red}${missing} missing${c.reset}  |  ${c.dim}${placeholder} placeholder${c.reset}  |  ${results.length} total`);
process.stdout.write('\n');

if (missing > 0) {
  warn(`${missing} asset${missing !== 1 ? 's' : ''} expected but not placed.`);
  info('Run  pnpm asset:queue  to generate prompts, then place files at the paths above.');
  process.stdout.write('\n');
  process.exit(1);
} else if (placeholder > 0) {
  info(`${placeholder} assets still in placeholder status — SVG/CSS fallbacks are active.`);
  info('Run  pnpm asset:queue  to export their prompts for generation.');
  process.stdout.write('\n');
}
