# NEON PALACE — AI Creative Department

**Version:** 1.0  
**Sprint:** SPR-013  
**Status:** Active

---

## Purpose

The AI Creative Department coordinates specialist creative agents to produce all visual, audio, and motion assets for the NEON PALACE casino platform. No copyrighted material from commercial games is used or referenced at any stage. All output is original IP.

Claude (CEO / Technical Director) does not generate creative assets. Claude commissions, reviews, and integrates them. The four specialist roles below each own their domain.

---

## Org Chart

```
CEO / Technical Director (Claude)
│
├── Art Director Agent        → image prompt packs → external image AI
├── Audio Director Agent      → sound design packs → external audio AI
├── Animation Director Agent  → motion specs       → Framer Motion / GSAP / CSS
└── Asset Integration Agent   → manifest + folder  → Next.js / packages/ui
```

---

## Creative Principles

| Principle | Detail |
|-----------|--------|
| **Original IP only** | No names, symbols, sounds, or designs from EGT, Pragmatic, Hacksaw, Play'n GO, NetEnt, Big Bass, Gates of Olympus, or any commercial title |
| **NEON PALACE aesthetic** | Dark luxury meets cyberpunk. Deep violet backgrounds, neon gold (#f4c430), cyber teal (#00d4c8), soft glow halos. Think: private members club inside a holographic palace |
| **Premium first** | Every asset should feel AAA mobile casino quality. No placeholder feel |
| **Accessibility** | Contrast ratio ≥ 4.5:1 for all text. Animation respects `prefers-reduced-motion` |
| **Modularity** | Assets are decoupled from game logic — any future game uses the same library |
| **No client-trusted values** | Art/audio/motion never carry gameplay data. They are presentation only |

---

## Workflow

```
1. CEO assigns ticket to a creative agent role
2. Agent produces prompt pack / spec document (this repo, docs/creative/)
3. Human creative lead reviews and approves prompt pack
4. Human runs prompts through chosen external AI tool (Midjourney, Suno, etc.)
5. Human delivers raw outputs to: public/assets/neon-palace/raw/<category>/
6. Asset Integration Agent reviews against manifest and integration plan
7. CEO integrates approved assets into packages/ui and apps/web
8. CI confirms no broken imports, size budgets met
```

No creative asset reaches production without human approval at step 3 and step 6.

---

## Agent Role Definitions

### Art Director Agent
- **Domain:** All visual assets — backgrounds, symbols, icons, UI elements, VFX textures
- **Output:** `docs/creative/ART_PROMPT_PACK_NEON_PALACE.md`
- **Tools used by human:** Midjourney, Stable Diffusion, Adobe Firefly, DALL·E (any)
- **Does not:** write React code, modify packages/ui, add files to Next.js

### Audio Director Agent
- **Domain:** All audio — UI sounds, game sounds, music loops, ambience
- **Output:** `docs/creative/AUDIO_PROMPT_PACK_NEON_PALACE.md`
- **Tools used by human:** Suno, Udio, ElevenLabs Sound Effects, Adobe Podcast (any)
- **Does not:** write audio player code, modify packages/audio

### Animation Director Agent
- **Domain:** Motion design — timing, easing, sequences, animation states
- **Output:** `docs/creative/ANIMATION_SPEC_NEON_PALACE.md`
- **Does not:** implement React components, only specs that engineers implement
- **References:** NEON PALACE motion tokens from `@casino/theme` (`motion.duration.*`, `motion.easing.*`)

### Asset Integration Agent
- **Domain:** Folder structure, manifest schema, metadata, Next.js integration plan
- **Output:** `docs/creative/ASSET_INTEGRATION_PLAN.md`
- **Does not:** design assets, write animation code — purely the delivery/plumbing spec

---

## Quality Gates

| Gate | Owner | Criteria |
|------|-------|----------|
| Prompt pack review | Human creative lead | Prompts are original, style is consistent, no IP violations |
| Raw asset review | Human creative lead | Output matches spec, no watermarks, correct dimensions |
| Technical review | Asset Integration Agent | Format, size, naming convention, manifest compliance |
| Accessibility check | CEO / Frontend Agent | Contrast, animation safe mode, screen reader labels |
| PR merge | CEO | CI green, no console warnings about missing assets |

---

## Naming Convention (Master)

All assets follow:

```
{category}-{variant}-{state}@{scale}.{ext}
```

Examples:
```
symbol-crown-idle@2x.webp
symbol-crown-win@2x.webp
bg-lobby-scroll.webp
icon-sound-on.svg
sfx-win-big.ogg
music-lobby-loop.ogg
vfx-coin-particle.webp
```

Scales: `@1x` (fallback), `@2x` (retina), `@3x` (mobile only where needed).  
Formats: WebP for rasters, SVG for icons, OGG for audio (with MP3 fallback).

---

## Asset Budget Targets

| Category | Max size per asset |
|----------|--------------------|
| Symbol (raster) | 80 KB @2x |
| Background (full bleed) | 300 KB @2x |
| Icon (SVG) | 8 KB |
| VFX texture (spritesheet) | 200 KB |
| SFX (short, <3s) | 150 KB OGG |
| Music loop (30s) | 1.5 MB OGG |
| Lobby ambience loop (60s) | 2 MB OGG |

---

## File Locations

```
docs/creative/
  CREATIVE_DEPARTMENT.md          ← this file
  ART_PROMPT_PACK_NEON_PALACE.md
  AUDIO_PROMPT_PACK_NEON_PALACE.md
  ANIMATION_SPEC_NEON_PALACE.md
  ASSET_INTEGRATION_PLAN.md

public/assets/neon-palace/
  raw/          ← unprocessed AI outputs (gitignored, manual delivery)
  symbols/      ← optimized symbol WebP files
  backgrounds/  ← background WebP files
  icons/        ← SVG icon files
  vfx/          ← VFX texture spritesheets
  audio/sfx/    ← short sound effects (OGG)
  audio/music/  ← music loops (OGG)
  audio/ambient/← ambient tracks (OGG)
```

`public/assets/neon-palace/raw/` is gitignored — raw AI outputs are large and versioned separately.
