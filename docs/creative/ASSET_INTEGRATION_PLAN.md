# Asset Integration Plan — NEON PALACE

**Agent:** Asset Integration Agent  
**Version:** 1.0  
**Sprint:** SPR-013  
**Applies to:** All creative assets produced via ART, AUDIO, ANIMATION prompt packs

---

## Overview

This document specifies how approved creative assets flow from raw AI output into the running Next.js application. No asset reaches production without passing the quality gate in `CREATIVE_DEPARTMENT.md`.

The integration plan has four concerns:
1. **Folder structure** — where files live
2. **Asset manifest** — a machine-readable registry of every asset
3. **Metadata schema** — what we know about each asset
4. **Integration patterns** — how code references assets

---

## 1. Folder Structure

```
casino-platform/
└── public/
    └── assets/
        └── neon-palace/
            │
            ├── symbols/              ← game symbols
            │   ├── symbol-crown-idle@2x.webp
            │   ├── symbol-crown-win@2x.webp
            │   ├── symbol-seal-idle@2x.webp
            │   ├── symbol-seal-win@2x.webp
            │   ├── symbol-diamond-idle@2x.webp
            │   ├── symbol-diamond-win@2x.webp
            │   ├── symbol-chalice-idle@2x.webp
            │   ├── symbol-chalice-win@2x.webp
            │   ├── symbol-horseshoe-idle@2x.webp
            │   ├── symbol-horseshoe-win@2x.webp
            │   ├── symbol-seven-idle@2x.webp
            │   ├── symbol-seven-win@2x.webp
            │   ├── symbol-star-idle@2x.webp
            │   ├── symbol-star-win@2x.webp
            │   ├── symbol-bar-idle@2x.webp
            │   ├── symbol-bar-win@2x.webp
            │   ├── symbol-gem-violet-idle@2x.webp
            │   ├── symbol-gem-violet-win@2x.webp
            │   ├── symbol-gem-cyan-idle@2x.webp
            │   └── symbol-gem-cyan-win@2x.webp
            │
            ├── backgrounds/          ← scene backgrounds
            │   ├── bg-lobby-hero@2x.webp
            │   ├── bg-lobby-cards@2x.webp
            │   ├── bg-game-canvas@2x.webp
            │   └── bg-loading@2x.webp
            │
            ├── icons/                ← UI SVG icons
            │   ├── icon-sound-on.svg
            │   ├── icon-sound-off.svg
            │   ├── icon-sound-low.svg
            │   ├── icon-settings.svg
            │   ├── icon-info.svg
            │   ├── icon-close.svg
            │   ├── icon-fullscreen.svg
            │   ├── icon-exit-fullscreen.svg
            │   ├── icon-help.svg
            │   ├── icon-home.svg
            │   └── icon-wallet.svg
            │
            ├── vfx/                  ← particle textures / spritesheets
            │   ├── vfx-coin-sheet@2x.webp
            │   ├── vfx-spark-star@2x.webp
            │   ├── vfx-glow-ring-teal@2x.webp
            │   ├── vfx-ray-burst-gold@2x.webp
            │   └── vfx-confetti-sheet@2x.webp
            │
            ├── thumbs/               ← game card thumbnails
            │   ├── thumb-slots-001@2x.webp
            │   └── thumb-table-001@2x.webp
            │
            └── audio/
                ├── sfx/              ← short sound effects
                │   ├── sfx-click-primary.ogg
                │   ├── sfx-click-secondary.ogg
                │   ├── sfx-hover.ogg
                │   ├── sfx-toggle-on.ogg
                │   ├── sfx-toggle-off.ogg
                │   ├── sfx-menu-open.ogg
                │   ├── sfx-menu-close.ogg
                │   ├── sfx-error.ogg
                │   ├── sfx-notify.ogg
                │   ├── sfx-spin-start.ogg
                │   ├── sfx-reel-spinning.ogg
                │   ├── sfx-reel-stop-1.ogg
                │   ├── sfx-reel-stop-2.ogg
                │   ├── sfx-reel-stop-3.ogg
                │   ├── sfx-reel-stop-4.ogg
                │   ├── sfx-reel-stop-5.ogg
                │   ├── sfx-anticipation.ogg
                │   ├── sfx-result-neutral.ogg
                │   ├── sfx-win-small.ogg
                │   ├── sfx-win-medium.ogg
                │   ├── sfx-win-big.ogg
                │   ├── sfx-win-jackpot.ogg
                │   ├── sfx-win-tick.ogg
                │   ├── sfx-coins-scatter.ogg
                │   ├── sfx-scatter-land.ogg
                │   └── sfx-feature-trigger.ogg
                │
                ├── music/
                │   ├── music-lobby-loop.ogg
                │   ├── music-game-calm.ogg
                │   └── music-game-win.ogg
                │
                └── ambient/
                    ├── ambient-lobby.ogg
                    └── ambient-game.ogg
```

### Gitignore Rule

Raw (unoptimized) AI outputs are NOT committed. Add to `.gitignore`:
```
public/assets/neon-palace/raw/
```

Only optimized, approved, correctly-named assets are committed.

---

## 2. Asset Manifest

A single JSON file acts as the authoritative registry of every asset:

**Location:** `public/assets/neon-palace/manifest.json`

### Schema

```typescript
interface AssetManifest {
  version: string;         // Semver of the manifest
  generatedAt: string;     // ISO 8601 timestamp
  theme: 'neon-palace';
  assets: AssetEntry[];
}

interface AssetEntry {
  id: string;              // Unique identifier (matches filename without scale/ext)
  category: AssetCategory;
  filename: string;        // Full filename as stored in /public
  path: string;            // Relative to /public: "/assets/neon-palace/..."
  type: AssetType;
  width?: number;          // Pixels (raster only)
  height?: number;
  duration?: number;       // Milliseconds (audio only)
  loop?: boolean;          // Audio: is this a loop file?
  spriteFrames?: SpriteFrames; // For spritesheet VFX
  approved: boolean;       // Must be true before referencing in production code
  approvedBy?: string;     // Human reviewer initials/name
  sizeBytes: number;       // Actual file size after optimization
  altText: string;         // Accessibility description (images only)
}

type AssetCategory = 'symbol' | 'background' | 'icon' | 'vfx' | 'thumb' | 'sfx' | 'music' | 'ambient';
type AssetType = 'webp' | 'svg' | 'ogg' | 'mp3';

interface SpriteFrames {
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  fps: number;
}
```

### Example Entry

```json
{
  "id": "symbol-crown-idle",
  "category": "symbol",
  "filename": "symbol-crown-idle@2x.webp",
  "path": "/assets/neon-palace/symbols/symbol-crown-idle@2x.webp",
  "type": "webp",
  "width": 512,
  "height": 512,
  "approved": true,
  "approvedBy": "CK",
  "sizeBytes": 62400,
  "altText": "Ornate glowing crown, the highest-value symbol"
}
```

---

## 3. TypeScript Asset Registry (packages/ui)

The manifest is not consumed at runtime for performance. Instead, a generated TypeScript file provides type-safe asset references:

**Location:** `packages/ui/src/assets/neon-palace-assets.ts`

This file is **generated** from `manifest.json` by a build script — never hand-edited.

```typescript
// AUTO-GENERATED — do not edit manually
// Run: pnpm --filter @casino/ui generate:assets

export const NeonPalaceAssets = {
  symbols: {
    crown: {
      idle: '/assets/neon-palace/symbols/symbol-crown-idle@2x.webp',
      win:  '/assets/neon-palace/symbols/symbol-crown-win@2x.webp',
      alt:  'Ornate glowing crown, highest-value symbol',
    },
    seal: {
      idle: '/assets/neon-palace/symbols/symbol-seal-idle@2x.webp',
      win:  '/assets/neon-palace/symbols/symbol-seal-win@2x.webp',
      alt:  'NEON PALACE scatter seal',
    },
    diamond: { ... },
    chalice: { ... },
    horseshoe: { ... },
    seven: { ... },
    star: { ... },
    bar: { ... },
    gemViolet: { ... },
    gemCyan: { ... },
  },
  backgrounds: {
    lobbyHero:   '/assets/neon-palace/backgrounds/bg-lobby-hero@2x.webp',
    lobbyCards:  '/assets/neon-palace/backgrounds/bg-lobby-cards@2x.webp',
    gameCanvas:  '/assets/neon-palace/backgrounds/bg-game-canvas@2x.webp',
    loading:     '/assets/neon-palace/backgrounds/bg-loading@2x.webp',
  },
  icons: {
    soundOn:         '/assets/neon-palace/icons/icon-sound-on.svg',
    soundOff:        '/assets/neon-palace/icons/icon-sound-off.svg',
    soundLow:        '/assets/neon-palace/icons/icon-sound-low.svg',
    settings:        '/assets/neon-palace/icons/icon-settings.svg',
    info:            '/assets/neon-palace/icons/icon-info.svg',
    close:           '/assets/neon-palace/icons/icon-close.svg',
    fullscreen:      '/assets/neon-palace/icons/icon-fullscreen.svg',
    exitFullscreen:  '/assets/neon-palace/icons/icon-exit-fullscreen.svg',
    help:            '/assets/neon-palace/icons/icon-help.svg',
    home:            '/assets/neon-palace/icons/icon-home.svg',
    wallet:          '/assets/neon-palace/icons/icon-wallet.svg',
  },
  vfx: {
    coinSheet:       '/assets/neon-palace/vfx/vfx-coin-sheet@2x.webp',
    sparkStar:       '/assets/neon-palace/vfx/vfx-spark-star@2x.webp',
    glowRingTeal:    '/assets/neon-palace/vfx/vfx-glow-ring-teal@2x.webp',
    rayBurstGold:    '/assets/neon-palace/vfx/vfx-ray-burst-gold@2x.webp',
    confettiSheet:   '/assets/neon-palace/vfx/vfx-confetti-sheet@2x.webp',
  },
  audio: {
    sfx: {
      clickPrimary:   '/assets/neon-palace/audio/sfx/sfx-click-primary.ogg',
      clickSecondary: '/assets/neon-palace/audio/sfx/sfx-click-secondary.ogg',
      hover:          '/assets/neon-palace/audio/sfx/sfx-hover.ogg',
      // ... (all SFX entries)
    },
    music: {
      lobbyLoop:   '/assets/neon-palace/audio/music/music-lobby-loop.ogg',
      gameCalm:    '/assets/neon-palace/audio/music/music-game-calm.ogg',
      gameWin:     '/assets/neon-palace/audio/music/music-game-win.ogg',
    },
    ambient: {
      lobby:  '/assets/neon-palace/audio/ambient/ambient-lobby.ogg',
      game:   '/assets/neon-palace/audio/ambient/ambient-game.ogg',
    },
  },
} as const;

export type NeonPalaceAssets = typeof NeonPalaceAssets;
```

---

## 4. Next.js Integration Patterns

### 4.1 Image Assets — Next.js `<Image />`

```tsx
import Image from 'next/image';
import { NeonPalaceAssets } from '@casino/ui/assets/neon-palace-assets';

// Symbol rendering
<Image
  src={NeonPalaceAssets.symbols.crown.idle}
  alt={NeonPalaceAssets.symbols.crown.alt}
  width={256}
  height={256}
  priority={false}
/>
```

**Configuration in `apps/web/next.config.ts`:**
```typescript
const nextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};
```

### 4.2 SVG Icons — Inline React Component

SVG icons are imported as React components for color control via CSS `currentColor`:

```tsx
import { ReactComponent as SoundOnIcon } from '@casino/ui/icons/icon-sound-on.svg';
// OR (Next.js with @svgr/webpack):
import SoundOnIcon from '/assets/neon-palace/icons/icon-sound-on.svg';
```

All SVGs must use `fill="currentColor"` or `stroke="currentColor"` so they inherit text color from the parent — enabling easy theming.

### 4.3 Audio — Web Audio API Wrapper (packages/audio)

Audio is never referenced via `<audio>` tags. The `@casino/audio` package (Wave 3) will provide an `AudioEngine` that:
- Preloads all SFX on game load
- Uses `AudioContext` + `AudioBufferSourceNode` for zero-latency playback
- Manages three independent `GainNode` chains (music / ambient / sfx)

```typescript
import { useAudioEngine } from '@casino/audio';

const audio = useAudioEngine();
audio.sfx.play('clickPrimary');     // instant, no loading stall
audio.music.crossfadeTo('gameCalm', 1000); // 1s crossfade
```

### 4.4 VFX Spritesheets — Canvas Renderer

Spritesheet animation uses a `<canvas>` element managed by a hook:

```typescript
import { useSpriteAnimation } from '@casino/ui';

// Drives coin spritesheet at 60fps
const { canvasRef } = useSpriteAnimation({
  src: NeonPalaceAssets.vfx.coinSheet,
  columns: 8,
  rows: 8,
  totalFrames: 64,
  fps: 30,
  playing: isWinning,
});

return <canvas ref={canvasRef} width={64} height={64} />;
```

### 4.5 Background Images — CSS Custom Property

Lobby backgrounds use CSS for performance (avoids Next.js image optimization on full-bleed decorative images):

```tsx
// In a Server Component — no JS needed
<section
  style={{
    backgroundImage: `url(${NeonPalaceAssets.backgrounds.lobbyHero})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
/>
```

---

## 5. Asset Loading Strategy

| Category | Strategy | Why |
|----------|----------|-----|
| Lobby background | Eager (`priority`) | First paint — visible immediately |
| Game canvas background | Eager (`priority`) | First paint on game page |
| Symbols (all) | Preload on game load | Required before first spin |
| VFX textures | Preload on game load | Required for win celebrations |
| SFX (all) | Preload on game load | Zero-latency requirement |
| Music tracks | Lazy (stream on demand) | Large files, not needed at t=0 |
| Ambient tracks | Lazy (stream on demand) | Large files, start after load |
| Icons | Inline SVG | No network request |
| Thumbnails | Lazy (viewport intersection) | Below fold in lobby |

---

## 6. Optimization Requirements

All assets must pass these checks before being committed:

### Images
```bash
# WebP quality: target 80-85
cwebp -q 85 input.png -o output@2x.webp

# Verify size budget
ls -lh public/assets/neon-palace/symbols/    # each file < 80KB
ls -lh public/assets/neon-palace/backgrounds/ # each file < 300KB
```

### Audio
```bash
# OGG encoding (quality 6 ≈ 160kbps VBR)
ffmpeg -i input.wav -c:a libvorbis -q:a 6 output.ogg

# Loudness check (-14 LUFS target)
ffmpeg -i output.ogg -af loudnorm=I=-14:TP=-1:LRA=11 -f null -
```

### SVG
```bash
# Optimize with svgo
svgo --input icon-sound-on.svg --output icon-sound-on.svg
```

---

## 7. Placeholder Asset Convention

Until real assets arrive, UI components use placeholder patterns — never broken images:

```typescript
// In packages/ui — placeholder fallback
export const PLACEHOLDER_SYMBOL = 'data:image/svg+xml,...'; // 1x1 violet square
export const PLACEHOLDER_AUDIO = null; // AudioEngine handles null gracefully

// Components guard against missing assets:
const src = NeonPalaceAssets.symbols.crown?.idle ?? PLACEHOLDER_SYMBOL;
```

This ensures the game renders correctly in development even before assets are produced.

---

## 8. Manifest Update Process

When a new asset is approved and optimized:

1. Copy file to the correct `public/assets/neon-palace/<category>/` subfolder
2. Run `pnpm --filter @casino/ui generate:assets` (future script — reads manifest.json and regenerates `neon-palace-assets.ts`)
3. Update `manifest.json` with the new entry (set `approved: true`, fill `sizeBytes`)
4. Commit both the asset file and the updated `manifest.json` + regenerated `neon-palace-assets.ts`
5. Open PR — CI verifies: no broken image references, all manifest entries have files, size budgets pass

---

## 9. What NOT to Include

| Item | Reason |
|------|--------|
| Raw AI outputs | Too large, not optimized, may contain artifacts |
| MP3 files | OGG is preferred; MP3 only as fallback if required |
| PNG source files | Optimize to WebP before committing |
| Animated GIF | Never — use spritesheet or CSS animation instead |
| Video files | Never — use canvas/CSS animation |
| Assets without manifest entry | Asset integration agent must register all files |
| Assets with `approved: false` | Must not be referenced in production code |
