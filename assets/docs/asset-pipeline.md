# Casino Asset Pipeline

## Overview

This document describes the full workflow for generating, placing, and wiring game assets into the Neon Palace slot game (and any future game on this platform).

The pipeline has four stages:

```
1. PLAN    → Read manifest.json to see what's needed
2. GENERATE → Use prompts from prompt-library.md with Gemini / image AI
3. PLACE   → Copy files to apps/web/public/assets/<game>/
4. WIRE    → Set path in apps/web/config/<game>-assets.ts → done
```

---

## Stage 1 — Plan

Read `assets/neon-palace/manifest.json`. Each entry has:

- `status`: `placeholder` | `generated` | `final`
- `generationPrompt`: ready-to-use prompt for image AI
- `targetSize`: export dimensions
- `format`: file format
- `path`: where the file goes in public/

Focus on assets with `status: "placeholder"` — these are missing.

Priority order:
1. Symbols (most visible, in every spin)
2. Cabinet / background
3. UI panels (jackpot, buttons)
4. Overlays (win celebrations)
5. Particles
6. Audio

---

## Stage 2 — Generate

### Image assets (symbols, backgrounds, UI)

Use **Gemini** (via Google AI Studio or Vertex AI) or any capable image generation model.

1. Open `assets/docs/prompt-library.md`
2. Copy the prompt for the asset you want
3. Paste into Gemini image generation
4. Generation settings:
   - **Aspect ratio**: match `targetSize` (e.g., 1:1 for symbols, 16:9 for backgrounds)
   - **Style**: Photorealistic / Cinematic quality
   - **No text** unless the asset explicitly requires it
5. Download the result as PNG
6. Convert to WebP using:
   ```bash
   # Using cwebp (install via brew install webp or apt install webp)
   cwebp -q 90 input.png -o output.webp

   # For transparent symbols (lossless):
   cwebp -lossless input.png -o output.webp

   # Using ffmpeg:
   ffmpeg -i input.png -c:v libwebp -quality 90 output.webp
   ```
7. Verify dimensions match `targetSize`

### Audio assets

Use a sound generation tool (ElevenLabs SFX, Suno, or Freesound for CC0 sources).

1. Read the `generationPrompt` in the manifest for the audio asset
2. Generate or find a CC0-licensed sound matching the description
3. Convert to MP3 192kbps:
   ```bash
   ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k output.mp3
   ```
4. Normalize to -3dBFS:
   ```bash
   ffmpeg -i input.mp3 -filter:a loudnorm -b:a 192k output-normalized.mp3
   ```

---

## Stage 3 — Place

Copy generated files to the correct location inside the web app:

```
apps/web/public/assets/neon-palace/symbols/wild.webp
apps/web/public/assets/neon-palace/symbols/diamond.webp
apps/web/public/assets/neon-palace/symbols/ruby.webp
apps/web/public/assets/neon-palace/symbols/emerald.webp
apps/web/public/assets/neon-palace/symbols/ace.webp
apps/web/public/assets/neon-palace/symbols/king.webp
apps/web/public/assets/neon-palace/symbols/queen.webp
apps/web/public/assets/neon-palace/symbols/jack.webp
apps/web/public/assets/neon-palace/symbols/ten.webp
apps/web/public/assets/neon-palace/symbols/scatter.webp
apps/web/public/assets/neon-palace/backgrounds/background.webp
apps/web/public/assets/neon-palace/backgrounds/cabinet.webp
apps/web/public/assets/neon-palace/ui/reel-frame.png
apps/web/public/assets/neon-palace/ui/jackpot-panel.png
apps/web/public/assets/neon-palace/ui/spin-button.png
apps/web/public/assets/neon-palace/effects/big-win-overlay.webp
apps/web/public/assets/neon-palace/effects/mega-win-overlay.webp
apps/web/public/assets/neon-palace/effects/epic-win-overlay.webp
apps/web/public/assets/neon-palace/effects/jackpot-overlay.webp
apps/web/public/assets/neon-palace/effects/coin-particle.webp
apps/web/public/assets/neon-palace/audio/spin-start.mp3
apps/web/public/assets/neon-palace/audio/reel-stop-0.mp3
...
```

These paths match exactly what's in `manifest.json → path` field.

The `.gitignore` excludes binary assets from git. To share generated assets with teammates, use cloud storage (S3, Google Drive) or a separate assets repo.

---

## Stage 4 — Wire

Open `apps/web/config/neon-palace-assets.ts` and set the path:

```typescript
// Before (placeholder):
WILD: '',

// After (generated asset placed):
WILD: '/assets/neon-palace/symbols/wild.webp',
```

That's it. The `SymbolArt` component checks `getSymbolImage(id)` — if it returns a path, it renders `<img>`. If it returns `null`, it renders the SVG fallback. No other code changes needed.

Then run:
```bash
pnpm --filter @casino/web build
```

Verify the game still works and symbols show the new images.

Update the asset's `status` in `manifest.json` from `"placeholder"` to `"generated"` or `"final"`.

---

## Adding a New Game

1. Create `assets/<new-game>/manifest.json` (copy neon-palace manifest, replace all entries)
2. Create `apps/web/config/<new-game>-assets.ts` (copy neon-palace-assets.ts template)
3. Create `apps/web/public/assets/<new-game>/` directory structure (copy the neon-palace structure)
4. In your game page, import from the config:
   ```typescript
   import { getSymbolImage } from '../../../config/<new-game>-assets';
   ```
5. Pass `imageSrc={getSymbolImage(symId)}` to your SymbolArt/equivalent component
6. Add a fallback rendering path when `imageSrc` is null

The pipeline is the same — only the manifest and config differ per game.

---

## Checklist: Adding one symbol image

```
[ ] Generated image is 512×512
[ ] Transparent background (PNG alpha preserved through WebP conversion)
[ ] No watermarks, no copyright marks, no existing IP references
[ ] File placed at apps/web/public/assets/neon-palace/symbols/<name>.webp
[ ] Path set in apps/web/config/neon-palace-assets.ts
[ ] pnpm --filter @casino/web build passes
[ ] Game tested: symbol renders correctly in reels and paytable
[ ] manifest.json status updated to "generated" or "final"
```
