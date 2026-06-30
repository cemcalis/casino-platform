#!/usr/bin/env node
/**
 * asset:queue — Read manifest(s), collect placeholder assets, write a prompt queue.
 *
 * Usage:
 *   node tools/asset-factory/queue.mjs [--game=neon-palace] [--type=symbol|background|ui|effect|audio] [--out=<path>]
 *
 * Output:
 *   assets/<game>/queue.json  — list of placeholder assets with their generation prompts
 *
 * Next step after running this:
 *   Review queue.json, then pass prompts to Gemini / Nano Banana via generate.mjs
 *   (once API keys are configured in .env).
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { findRepoRoot, readManifest, ok, info, dim, c } from './utils.mjs';

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);

const game   = args.game   ?? 'neon-palace';
const filter = args.type   ?? null;   // null = all types
const outArg = args.out    ?? null;

// ── Read manifest ─────────────────────────────────────────────────────────────
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

// ── Filter placeholders ───────────────────────────────────────────────────────
const provider = process.env.ASSET_PROVIDER ?? 'gemini';

const queued = manifest.assets
  .filter(a => a.status === 'placeholder')
  .filter(a => !filter || a.type === filter)
  .map(a => ({
    id:              a.id,
    name:            a.name,
    type:            a.type,
    format:          a.format,
    targetSize:      a.targetSize,
    outputPath:      join('apps/web/public', a.path),
    publicPath:      a.path,
    fallback:        a.fallback,
    generationPrompt: a.generationPrompt,
    notes:           a.notes ?? null,
    provider,
    status:          'queued',
  }));

if (queued.length === 0) {
  ok(`No placeholder assets found for game="${game}"${filter ? ` type="${filter}"` : ''}.`);
  info('All assets may already be generated. Run pnpm asset:check to verify.');
  process.exit(0);
}

// ── Write queue file ──────────────────────────────────────────────────────────
const outPath = outArg
  ? join(root, outArg)
  : join(root, 'assets', game, 'queue.json');

const queuePayload = {
  $schema:   './queue.schema.json',
  game,
  provider,
  generatedAt: new Date().toISOString(),
  totalCount:  queued.length,
  filter:      filter ?? 'all',
  items:       queued,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(queuePayload, null, 2), 'utf8');

// ── Report ────────────────────────────────────────────────────────────────────
process.stdout.write('\n');
info(`Game:     ${c.bold}${game}${c.reset}`);
info(`Provider: ${c.bold}${provider}${c.reset}  (set ASSET_PROVIDER to change)`);
info(`Filter:   ${filter ?? 'all types'}`);
process.stdout.write('\n');

const byType = {};
for (const item of queued) {
  byType[item.type] = (byType[item.type] ?? 0) + 1;
}
for (const [type, count] of Object.entries(byType)) {
  dim(`  [${type.padEnd(10)}] ${count} asset${count !== 1 ? 's' : ''}`);
}

process.stdout.write('\n');
ok(`Queue written: ${queued.length} asset${queued.length !== 1 ? 's' : ''} → ${outPath.replace(root + '\\', '').replace(root + '/', '')}`);
process.stdout.write('\n');
info('Next steps:');
dim('  1. Set GEMINI_API_KEY in your .env  (see tools/asset-factory/.env.example)');
dim('  2. Review assets/<game>/queue.json');
dim('  3. Run: node tools/asset-factory/generate.mjs  (when API integration is ready)');
dim('  4. Place generated files → apps/web/public/assets/<game>/<type>/');
dim('  5. Update apps/web/config/neon-palace-assets.ts with file paths');
dim('  6. Run: pnpm asset:check  to verify placement');
process.stdout.write('\n');
