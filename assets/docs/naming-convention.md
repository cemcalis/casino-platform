# Asset Naming Convention

## File names

All asset files use **kebab-case** with no spaces.

```
<game-id>/<type>/<asset-id>.<ext>
```

Examples:
```
neon-palace/symbols/wild.webp
neon-palace/symbols/diamond.webp
neon-palace/ui/spin-button.png
neon-palace/effects/big-win-overlay.webp
neon-palace/audio/spin-start.mp3
shared/particles/coin-burst-sheet.png
shared/audio/button-click.mp3
```

## Asset IDs (in manifests and code config)

- **Symbols** — SCREAMING_SNAKE_CASE matching `SYMBOLS[].id` in the game page:
  `WILD`, `SCATTER`, `ZEUS`, `ATHENA`, `POSEIDON`, `ACE`, `KING`, `QUEEN`, `JACK`, `TEN`
- **UI / background / effect assets** — snake_case:
  `spin_button`, `reel_frame`, `jackpot_panel`, `big_win_overlay`
- **Audio** — snake_case with `_sfx` or `_music` suffix:
  `spin_start_sfx`, `reel_stop_sfx`, `win_sfx`, `jackpot_sfx`, `background_music`

## Formats

| Asset type | Format | Why |
|------------|--------|-----|
| Symbols (transparent) | PNG → convert to WebP | Lossless alpha channel |
| Backgrounds (no alpha) | JPEG → convert to WebP | Smaller file size |
| UI with alpha | PNG → convert to WebP | Lossless alpha |
| Overlays | WebP | Good alpha + compression |
| Particles | PNG (sprite sheet) | CSS animation steps() |
| Audio | WAV master → MP3 192kbps | Broad browser support |

## Sizes

| Asset | Size | Notes |
|-------|------|-------|
| Symbol | 512×512 | Displayed at 88–100px, but 512 allows retina + zoom |
| Cabinet BG | 900×1200 | Scaled via CSS background-size |
| Page BG | 1920×1080 | Full bleed, CSS cover |
| Reel frame | 560×340 | Exact reel grid dimensions + border |
| UI buttons | 2× pixel size | e.g., 200×80 for 100×40 display |
| Overlays | 1080×1080 | Square, centered via CSS |
| Coin particle | 64×64 | Small burst element |
| Sparkle sheet | 192×32 (6 × 32px frames) | CSS steps(6) |
| Coin sheet | 512×64 (8 × 64px frames) | CSS steps(8) |

## Retina / HiDPI

Export all UI assets at **2× the CSS display size**. The loader specifies `width` and `height` at the CSS display size. The browser receives a 2× image and renders it crisp on HiDPI screens.

For symbol sprites, 512×512 is always sufficient since the game downscales to 88px.

## Variants (audio)

When multiple variants exist, suffix with a number or descriptor:
```
reel-stop-0.mp3
reel-stop-1.mp3
...
reel-stop-4.mp3

win-small.mp3
win-medium.mp3
win-big.mp3
```

## Directory placement

Generated assets for the **web app** go in:
```
apps/web/public/assets/<game-id>/<type>/<filename>
```

Source files / Photoshop / Blender files go in:
```
assets/<game-id>/<type>/<filename>
```

The `assets/` source folder is committed to the repo (manifests, prompts, source files).
The `apps/web/public/assets/` folder is gitignored for binary files — only `.gitkeep` is committed.
