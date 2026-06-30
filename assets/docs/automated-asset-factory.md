# Automated Asset Factory

## Overview

The asset factory CLI automates the pipeline from **manifest → prompt queue → generated files → wired into game**.

```
pnpm asset:queue   →  reads manifest, writes queue.json with all prompts
pnpm asset:check   →  checks which assets are placed in apps/web/public/
node tools/asset-factory/generate.mjs  →  (stub) future automated API generation
```

---

## Commands

### `pnpm asset:queue`

Reads `assets/<game>/manifest.json`, finds all assets with `status: "placeholder"`, and writes `assets/<game>/queue.json` — a ready-to-use prompt queue.

```bash
# Queue all placeholder assets for neon-palace
pnpm asset:queue

# Queue only symbols
pnpm asset:queue -- --type=symbol

# Queue a different game
pnpm asset:queue -- --game=dragon-palace

# Write queue to a custom path
pnpm asset:queue -- --out=tmp/my-queue.json
```

Output file `assets/neon-palace/queue.json` (gitignored — it's a generated file):
```json
{
  "game": "neon-palace",
  "provider": "gemini",
  "generatedAt": "2026-06-30T12:00:00.000Z",
  "totalCount": 28,
  "items": [
    {
      "id": "WILD",
      "name": "Wild Crown Symbol",
      "type": "symbol",
      "format": "webp",
      "targetSize": "512x512",
      "outputPath": "apps/web/public/assets/neon-palace/symbols/wild.webp",
      "publicPath": "/assets/neon-palace/symbols/wild.webp",
      "generationPrompt": "AAA casino slot symbol, majestic royal crown...",
      "provider": "gemini",
      "status": "queued"
    },
    ...
  ]
}
```

### `pnpm asset:check`

Checks all assets in the manifest against `apps/web/public/` and reports what's placed, missing, or still placeholder.

```bash
# Check all assets
pnpm asset:check

# Check only symbols
pnpm asset:check -- --type=symbol

# JSON output (for CI/scripting)
pnpm asset:check -- --json

# Check a different game
pnpm asset:check -- --game=dragon-palace
```

Exit codes:
- `0` — all non-placeholder assets are placed
- `1` — some expected assets missing

Example output:
```
ℹ Asset check — neon-palace

  ID                     TYPE         STATUS       PLACED
  ─────────────────────── ──────────── ──────────── ──────
✓ spin_button            ui           final        yes
✗ WILD                   symbol       generated    MISSING
    expected at: apps/web/public/assets/neon-palace/symbols/wild.webp
  background              background   placeholder  —
  ...

ℹ Summary: 1 placed  |  1 missing  |  26 placeholder  |  28 total
```

---

## Provider Setup

### Option A — Manual (no API key)

The default. Use prompts from `queue.json` with any image tool.

1. `pnpm asset:queue`
2. Open `assets/neon-palace/queue.json`
3. For each item, copy `generationPrompt` into [Google AI Studio](https://aistudio.google.com/), Midjourney, DALL-E, or any image tool
4. Download → convert → place at `item.outputPath`
5. `pnpm asset:check` to verify
6. Set path in `apps/web/config/neon-palace-assets.ts`

### Option B — Gemini API (automated)

1. Get API key: https://ai.google.dev/gemini-api/keys
2. Copy `tools/asset-factory/.env.example` → `.env` in repo root
3. Fill in `GEMINI_API_KEY=your_key_here` and `ASSET_PROVIDER=gemini`
4. `pnpm asset:queue` to build queue
5. Implement the generation loop in `tools/asset-factory/generate.mjs`
   (see the stub file for integration points and SDK instructions)
6. `pnpm asset:generate` (after wiring generate.mjs)

**Gemini SDK snippet (to wire into generate.mjs):**
```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateImages({
  model: 'imagen-3.0-generate-001',
  prompt: item.generationPrompt,
  config: { numberOfImages: 1, outputMimeType: 'image/png' },
});

const imageData = response.generatedImages[0].image.imageBytes; // base64
const buf = Buffer.from(imageData, 'base64');
writeFileSync(outputPath + '.png', buf);
// Then convert to webp via cwebp or sharp
```

### Option C — Nano Banana

1. Set `NANO_BANANA_API_KEY` and `ASSET_PROVIDER=nano-banana` in `.env`
2. Refer to Nano Banana API docs for the request format
3. Wire into `tools/asset-factory/generate.mjs` at the `NANO_BANANA` integration point

---

## Adding a New Game

The pipeline is game-agnostic. To set it up for a new game:

1. Create `assets/<new-game>/manifest.json` (copy neon-palace manifest, replace all entries)
2. Create `apps/web/config/<new-game>-assets.ts` (copy neon-palace-assets.ts template)
3. Create `apps/web/public/assets/<new-game>/` directory scaffold with `.gitkeep`
4. Run `pnpm asset:queue -- --game=<new-game>` to generate its prompt queue
5. Generate assets, place files, set paths in config

---

## Output directory structure

```
apps/web/public/
  assets/
    neon-palace/
      symbols/          ← symbol PNGs/WebPs go here
      backgrounds/      ← full-page and cabinet backgrounds
      ui/               ← buttons, panels, frames
      effects/          ← overlays, particles
      audio/            ← SFX, music
    shared/
      ui/               ← cross-game UI elements
      particles/        ← sprite sheets
      audio/            ← button clicks, shared SFX
```

Files in this directory are gitignored (binary assets). Only `.gitkeep` is committed to preserve structure.

---

## Security rules

- `GEMINI_API_KEY` and `NANO_BANANA_API_KEY` must only appear in `.env` (gitignored)
- Never log API keys — the factory scripts print only `set` or `not set`
- `queue.json` is gitignored — it may contain full prompts but no secrets
- All source prompts live in `assets/docs/prompt-library.md` (safe to commit)

---

## Gitignore rules

```gitignore
# Generated asset queue (regenerate with pnpm asset:queue)
assets/*/queue.json

# Generated binary assets (place manually or via generate.mjs)
apps/web/public/assets/**/*.png
apps/web/public/assets/**/*.webp
apps/web/public/assets/**/*.jpg
apps/web/public/assets/**/*.mp3
apps/web/public/assets/**/*.ogg
apps/web/public/assets/**/*.wav
!apps/web/public/assets/**/.gitkeep
```
