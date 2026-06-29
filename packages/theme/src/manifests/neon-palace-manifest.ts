import { assetId } from '@casino/types';
import type { ThemeAssetManifest, VisualAsset, AudioAsset, AnimationAsset } from '@casino/types';

const BASE_PATH = '/assets/neon-palace';
const LICENSE = { type: 'placeholder' as const };

function symbol(name: string, state: 'idle' | 'win', alt: string): VisualAsset {
  return {
    id: assetId(`symbol-${name}-${state}`),
    kind: 'symbol',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/symbols/symbol-${name}-${state}@2x.webp`,
    width: 512,
    height: 512,
    format: 'webp',
    altText: alt,
  };
}

function bg(name: string, w: number, h: number, alt: string): VisualAsset {
  return {
    id: assetId(`bg-${name}`),
    kind: 'background',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/backgrounds/bg-${name}@2x.webp`,
    width: w,
    height: h,
    format: 'webp',
    altText: alt,
  };
}

function icon(name: string, alt: string): VisualAsset {
  return {
    id: assetId(`icon-${name}`),
    kind: 'icon',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/icons/icon-${name}.svg`,
    width: 64,
    height: 64,
    format: 'svg',
    altText: alt,
  };
}

function vfx(name: string, w: number, h: number, alt: string, frames?: VisualAsset['spriteFrames']): VisualAsset {
  return {
    id: assetId(`vfx-${name}`),
    kind: 'vfx',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/vfx/vfx-${name}@2x.webp`,
    width: w,
    height: h,
    format: 'webp',
    altText: alt,
    ...(frames ? { spriteFrames: frames } : {}),
  };
}

function sfx(name: string, durationMs: number): AudioAsset {
  return {
    id: assetId(`sfx-${name}`),
    kind: 'sfx',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/audio/sfx/sfx-${name}.ogg`,
    format: 'ogg',
    durationMs,
    loop: false,
  };
}

function music(name: string, durationMs: number): AudioAsset {
  return {
    id: assetId(`music-${name}`),
    kind: 'music',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/audio/music/music-${name}.ogg`,
    format: 'ogg',
    durationMs,
    loop: true,
    lufs: -14,
  };
}

function ambient(name: string, durationMs: number): AudioAsset {
  return {
    id: assetId(`ambient-${name}`),
    kind: 'ambient',
    source: 'placeholder',
    license: LICENSE,
    approved: false,
    path: `${BASE_PATH}/audio/ambient/ambient-${name}.ogg`,
    format: 'ogg',
    durationMs,
    loop: true,
    lufs: -20,
  };
}

const visual: ReadonlyArray<VisualAsset> = [
  // Symbols (idle + win for each)
  symbol('crown', 'idle', 'Ornate glowing crown — highest-value Wild symbol'),
  symbol('crown', 'win', 'Ornate glowing crown — win state with intense gold bloom'),
  symbol('seal', 'idle', 'NEON PALACE heraldic seal — Scatter symbol'),
  symbol('seal', 'win', 'NEON PALACE heraldic seal — win state with teal and gold explosion'),
  symbol('diamond', 'idle', 'Geometric faceted diamond — Tier A symbol'),
  symbol('diamond', 'win', 'Geometric faceted diamond — win state'),
  symbol('chalice', 'idle', 'Neon gold chalice — Tier B symbol'),
  symbol('chalice', 'win', 'Neon gold chalice — win state'),
  symbol('horseshoe', 'idle', 'Ornamental golden horseshoe — Tier B symbol'),
  symbol('horseshoe', 'win', 'Ornamental golden horseshoe — win state'),
  symbol('seven', 'idle', 'Neon tube numeral 7 — Tier B symbol'),
  symbol('seven', 'win', 'Neon tube numeral 7 — win state'),
  symbol('star', 'idle', 'Faceted crystal star — Tier C symbol'),
  symbol('star', 'win', 'Faceted crystal star — win state'),
  symbol('bar', 'idle', 'Platinum bar with neon stripe — Tier C symbol'),
  symbol('bar', 'win', 'Platinum bar with neon stripe — win state'),
  symbol('gem-violet', 'idle', 'Amethyst oval gemstone — lowest Tier C symbol'),
  symbol('gem-violet', 'win', 'Amethyst oval gemstone — win state'),
  symbol('gem-cyan', 'idle', 'Cyan topaz oval gemstone — lowest Tier C symbol'),
  symbol('gem-cyan', 'win', 'Cyan topaz oval gemstone — win state'),
  // Backgrounds
  bg('lobby-hero', 2560, 1440, 'NEON PALACE grand casino interior for lobby hero section'),
  bg('lobby-cards', 1920, 600, 'Dark purple velvet texture for game card grid section'),
  bg('game-canvas', 1920, 1080, 'Ornate casino backdrop for game canvas'),
  bg('loading', 1920, 1080, 'Minimal dark luxury loading screen with crown'),
  // Icons
  icon('sound-on', 'Sound on'),
  icon('sound-off', 'Sound off'),
  icon('sound-low', 'Sound low'),
  icon('settings', 'Settings'),
  icon('info', 'Information'),
  icon('close', 'Close'),
  icon('fullscreen', 'Enter fullscreen'),
  icon('exit-fullscreen', 'Exit fullscreen'),
  icon('help', 'Help'),
  icon('home', 'Home'),
  icon('wallet', 'Wallet'),
  // VFX
  vfx('coin-sheet', 512, 512, 'Gold coin rotation spritesheet for win celebrations', {
    columns: 8, rows: 8, frameWidth: 64, frameHeight: 64, totalFrames: 64, fps: 30,
  }),
  vfx('spark-star', 128, 128, 'Four-pointed neon gold spark'),
  vfx('glow-ring-teal', 256, 256, 'Teal neon glow ring for win frame'),
  vfx('ray-burst-gold', 512, 512, 'Gold light ray burst for big win / jackpot'),
  vfx('confetti-sheet', 256, 256, 'Multi-color confetti particle spritesheet', {
    columns: 4, rows: 4, frameWidth: 64, frameHeight: 64, totalFrames: 16, fps: 24,
  }),
];

const audio: ReadonlyArray<AudioAsset> = [
  // UI SFX
  sfx('click-primary', 70),
  sfx('click-secondary', 70),
  sfx('hover', 50),
  sfx('toggle-on', 150),
  sfx('toggle-off', 150),
  sfx('menu-open', 250),
  sfx('menu-close', 250),
  sfx('error', 300),
  sfx('notify', 350),
  // Game SFX
  sfx('spin-start', 400),
  { ...sfx('reel-spinning', 1000), loop: true },
  sfx('reel-stop-1', 200),
  sfx('reel-stop-2', 200),
  sfx('reel-stop-3', 200),
  sfx('reel-stop-4', 200),
  sfx('reel-stop-5', 200),
  sfx('anticipation', 2000),
  sfx('result-neutral', 500),
  // Win SFX
  sfx('win-small', 1000),
  sfx('win-medium', 2000),
  sfx('win-big', 4000),
  sfx('win-jackpot', 7000),
  sfx('win-tick', 65),
  sfx('coins-scatter', 1500),
  sfx('scatter-land', 650),
  sfx('feature-trigger', 3000),
  // Music
  music('lobby-loop', 90000),
  music('game-calm', 60000),
  music('game-win', 30000),
  // Ambient
  ambient('lobby', 120000),
  ambient('game', 90000),
];

const animations: ReadonlyArray<AnimationAsset> = [];

export const neonPalaceManifest: ThemeAssetManifest = {
  theme: 'neon-palace',
  version: '0.1.0',
  generatedAt: '2026-06-29T00:00:00Z',
  visual,
  audio,
  animations,
};
