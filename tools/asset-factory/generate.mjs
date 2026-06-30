#!/usr/bin/env node
/**
 * asset:generate — Stub for automated image generation via AI providers.
 *
 * Current status: NOT YET IMPLEMENTED — exits with instructions.
 *
 * When implemented, this script will:
 *   1. Read assets/<game>/queue.json  (created by pnpm asset:queue)
 *   2. For each item, call the configured provider API
 *   3. Save the resulting image to apps/web/public/assets/<game>/<type>/<file>
 *   4. Update manifest status from "placeholder" → "generated"
 *   5. Print a summary of what was generated and what failed
 *
 * PROVIDER INTEGRATION POINTS:
 *
 *   Gemini (Google AI Studio / Vertex AI):
 *     - Set GEMINI_API_KEY in .env
 *     - Set ASSET_PROVIDER=gemini
 *     - API endpoint: https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
 *     - SDK: @google/genai (npm install @google/genai)
 *     - Prompt field: item.generationPrompt
 *     - Save as PNG → convert to WebP using sharp or cwebp
 *
 *   Nano Banana (when available):
 *     - Set NANO_BANANA_API_KEY in .env
 *     - Set ASSET_PROVIDER=nano-banana
 *     - Refer to Nano Banana API docs for endpoint and request format
 *     - Prompt field: item.generationPrompt
 *
 *   Manual workflow (default):
 *     - ASSET_PROVIDER=manual → run pnpm asset:queue, copy prompts from queue.json
 *       into your image tool, save files to the outputPath listed in queue.json
 *
 * USAGE (when implemented):
 *   node tools/asset-factory/generate.mjs [--game=neon-palace] [--type=symbol] [--dry-run]
 *
 * RATE LIMITING:
 *   Image generation APIs typically have rate limits (e.g., 10 req/min for Gemini free tier).
 *   Add a delay between requests. The implementation should use exponential backoff on 429s.
 *
 * SECURITY:
 *   - API keys MUST be loaded from environment variables — never hardcoded.
 *   - .env is gitignored. Copy tools/asset-factory/.env.example → .env and fill in.
 *   - Keys must not appear in logs, queue.json, or committed files.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { findRepoRoot, warn, info, dim, c } from './utils.mjs';

const provider = process.env.ASSET_PROVIDER ?? 'manual';
const apiKey   = process.env.GEMINI_API_KEY ?? process.env.NANO_BANANA_API_KEY ?? null;

let root;
try {
  root = findRepoRoot(import.meta.url);
} catch (err) {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
}

// ── Check for queue file ──────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);
const game  = args.game ?? 'neon-palace';
const qPath = join(root, 'assets', game, 'queue.json');

process.stdout.write('\n');
warn(`${c.bold}generate.mjs — API integration not yet implemented.${c.reset}`);
process.stdout.write('\n');

info(`Provider:   ${provider}  (ASSET_PROVIDER env var)`);
info(`API key:    ${apiKey ? `${c.green}set${c.reset}` : `${c.red}not set${c.reset}  ← required for automated generation`}`);
info(`Queue file: ${existsSync(qPath) ? `${c.green}exists${c.reset} (${JSON.parse(readFileSync(qPath,'utf8')).totalCount} items)` : `${c.red}not found${c.reset} — run: pnpm asset:queue`}`);
process.stdout.write('\n');

info('To implement automated generation, wire in one of these providers:');
dim('');
dim('  Gemini (Google):');
dim('    npm install @google/genai');
dim('    Docs: https://ai.google.dev/gemini-api/docs/image-generation');
dim('    Model: imagen-3.0-generate-001');
dim('    Key env var: GEMINI_API_KEY');
dim('');
dim('  Nano Banana:');
dim('    Key env var: NANO_BANANA_API_KEY');
dim('    Refer to Nano Banana API documentation');
dim('');
dim('  Manual workflow (no API key needed):');
dim('    1. pnpm asset:queue  → read queue.json');
dim('    2. Copy each item.generationPrompt into your image tool');
dim('    3. Save output to item.outputPath');
dim('    4. pnpm asset:check  → verify placement');
dim('');

info('See assets/docs/automated-asset-factory.md for the full integration guide.');
process.stdout.write('\n');
