#!/usr/bin/env node
/**
 * asset:generate — Automated game-art generation via the Gemini image API.
 *
 * Reads assets/<game>/queue.json (see queue.mjs, or hand-authored for Forge
 * games), calls the configured provider for every queued item, and saves the
 * returned PNG to the item's outputPath.
 *
 * Providers:
 *   gemini (default) — model gemini-2.5-flash-image via generativelanguage API.
 *     Requires GEMINI_API_KEY in .env (repo root, gitignored). NOTE: Google
 *     serves image models only to billing-enabled keys; a free-tier key gets
 *     HTTP 429 with "limit: 0" — enable billing in AI Studio to unlock.
 *   manual — prints the prompts for copy-paste into any image tool.
 *
 * Usage:
 *   node tools/asset-factory/generate.mjs --game=atlas-reef [--only=<id>] [--dry-run]
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { findRepoRoot, warn, info, dim, ok, c } from './utils.mjs';

const root = findRepoRoot(import.meta.url);

// ── .env loader (no dependency; keys must never be committed) ────────────────
function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
loadEnv();

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')),
);
const game = args.game ?? 'neon-palace';
const only = args.only ?? null;
const dryRun = 'dry-run' in args;
const provider = process.env.ASSET_PROVIDER ?? 'gemini';

const qPath = join(root, 'assets', game, 'queue.json');
if (!existsSync(qPath)) {
  warn(`Queue file not found: ${qPath}`);
  dim('  ➜  run: pnpm asset:queue  (or hand-author one for Forge games)');
  process.exit(1);
}
const queue = JSON.parse(readFileSync(qPath, 'utf8'));
let items = queue.items ?? queue;
if (only) items = items.filter((i) => i.id === only);

if (provider === 'manual' || dryRun) {
  info(`${items.length} item(s) queued for ${game} (${dryRun ? 'dry run' : 'manual mode'}):`);
  for (const item of items) {
    process.stdout.write(`\n${c.bold}${item.id}${c.reset} → ${item.outputPath}\n`);
    dim(`  ${item.generationPrompt}`);
  }
  process.exit(0);
}

const API_KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter(Boolean);
if (API_KEYS.length === 0) {
  warn('GEMINI_API_KEY not set in .env — aborting. (Manual mode: --dry-run to print prompts.)');
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOne(item, keyIndex = 0, attempt = 0) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'x-goog-api-key': API_KEYS[keyIndex], 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: item.generationPrompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  if (res.status === 429) {
    const body = await res.text();
    if (body.includes('limit: 0')) {
      if (keyIndex + 1 < API_KEYS.length) return generateOne(item, keyIndex + 1, 0);
      throw new Error(
        'quota=0: this key has no image-model quota. Enable billing on the Google ' +
          'account (AI Studio -> Settings -> Billing), then rerun.',
      );
    }
    if (attempt >= 4) throw new Error('rate limited after 5 attempts');
    const wait = 2000 * 2 ** attempt;
    dim(`    429 — backing off ${wait / 1000}s`);
    await sleep(wait);
    return generateOne(item, keyIndex, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('no image in response: ' + JSON.stringify(data).slice(0, 200));
  return Buffer.from(img.inlineData.data, 'base64');
}

let done = 0;
let failed = 0;
for (const item of items) {
  const outAbs = join(root, item.outputPath);
  process.stdout.write(`${c.bold}${item.id}${c.reset} → ${item.outputPath}\n`);
  try {
    const png = await generateOne(item);
    mkdirSync(dirname(outAbs), { recursive: true });
    writeFileSync(outAbs, png);
    ok(`  saved (${(png.length / 1024).toFixed(0)} KB)`);
    done++;
    await sleep(1500); // stay under per-minute limits
  } catch (err) {
    warn(`  FAILED: ${err.message}`);
    failed++;
    if (String(err.message).startsWith('quota=0')) break;
  }
}

process.stdout.write(`\n${done} generated, ${failed} failed, ${items.length - done - failed} skipped.\n`);
process.exit(failed > 0 && done === 0 ? 1 : 0);
