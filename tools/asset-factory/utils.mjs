// Shared utilities for the asset factory CLI tools

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

/** Walk up from __dirname until the casino-platform package.json is found. */
export function findRepoRoot(startUrl) {
  let dir = fileURLToPath(new URL('.', startUrl));
  for (let i = 0; i < 10; i++) {
    const pkg = join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        const parsed = JSON.parse(readFileSync(pkg, 'utf8'));
        if (parsed.name === 'casino-platform') return dir;
      } catch { /* continue */ }
    }
    dir = join(dir, '..');
  }
  throw new Error('Could not find repo root (looked for package.json with name "casino-platform")');
}

/** Read and parse a game asset manifest. Gives a clear error if not found yet. */
export function readManifest(root, game = 'neon-palace') {
  const path = join(root, 'assets', game, 'manifest.json');
  if (!existsSync(path)) {
    throw new Error(
      `Manifest not found: ${path}\n` +
      `  ➜  Merge PR #65 (feature/SPR-037-asset-factory) first, or checkout that branch.\n` +
      `     The manifest defines all assets and their generation prompts.`
    );
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** ANSI color helpers — degrade gracefully if terminal doesn't support. */
export const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
};

export function ok(msg)   { process.stdout.write(`${c.green}✓${c.reset} ${msg}\n`); }
export function fail(msg) { process.stderr.write(`${c.red}✗${c.reset} ${msg}\n`); }
export function info(msg) { process.stdout.write(`${c.cyan}ℹ${c.reset} ${msg}\n`); }
export function warn(msg) { process.stdout.write(`${c.yellow}⚠${c.reset} ${msg}\n`); }
export function dim(msg)  { process.stdout.write(`${c.dim}${msg}${c.reset}\n`); }
