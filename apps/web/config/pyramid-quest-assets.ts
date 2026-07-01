// Pyramid Quest — asset path configuration
//
// Maps every asset ID to its public path (served from apps/web/public/).
// Sliced from assets/ChatGPT Image 1 Tem 2026 14_57_41.png (Pyramid Quest UI/theme kit).
// Audio reuses the Neon Palace sample set (no theme-specific audio was supplied).

export const PYRAMID_QUEST_ASSET_PATHS = {
  // ── Symbols (sliced PNG) ────────────────────────────────────────────────────
  WILD:     '/assets/pyramid-quest/symbols/ankh-blue.png',
  SCATTER:  '/assets/pyramid-quest/symbols/scarab.png',
  ANUBIS:   '/assets/pyramid-quest/symbols/anubis.png',
  HORUS:    '/assets/pyramid-quest/symbols/horus-falcon.png',
  BASTET:   '/assets/pyramid-quest/symbols/bastet-cat.png',
  THOTH:    '/assets/pyramid-quest/symbols/thoth-ibis.png',
  PHARAOH:  '/assets/pyramid-quest/symbols/pharaoh-mask-blue.png',
  SPHINX:   '/assets/pyramid-quest/symbols/sphinx-bust.png',
  CARTOUCHE:'/assets/pyramid-quest/symbols/cartouche.png',
  CROOK:    '/assets/pyramid-quest/symbols/crook-and-flail.png',

  // ── Backgrounds ───────────────────────────────────────────────────────────
  background: '/assets/pyramid-quest/backgrounds/background.png',
  cabinet:    '/assets/pyramid-quest/backgrounds/background.png',
  logo:       '/assets/pyramid-quest/ui/logo-lockup.png',

  // ── UI panels (shared Master UI kit) ─────────────────────────────────────
  spin_button:   '/assets/master-ui/buttons/spin-button.png',
  gamble_button: '/assets/master-ui/buttons/gamble-button-inactive.png',
  info_button:   '/assets/master-ui/buttons/info-button.png',
  settings_icon: '/assets/master-ui/icons/settings-icon.png',
  exit_icon:     '/assets/master-ui/icons/exit-icon.png',
  major_symbol_frame: '/assets/master-ui/ui/major-symbol-frame.png',

  // ── Win overlays / banners (FX pack) ─────────────────────────────────────
  win_banner:        '/assets/fx/win-banners/win.png',
  big_win_banner:     '/assets/fx/win-banners/big-win.png',
  epic_win_banner:    '/assets/fx/win-banners/epic-win.png',
  mega_win_banner:    '/assets/fx/win-banners/super-win.png',
  jackpot_banner:     '/assets/fx/win-banners/jackpot.png',
  grand_jackpot_banner: '/assets/fx/win-banners/grand-jackpot-banner.png',

  // ── Particles / coins (FX pack) ──────────────────────────────────────────
  coin_pile_1:    '/assets/fx/coins/coin-pile-1.png',
  coin_pile_2:    '/assets/fx/coins/coin-pile-2.png',
  coin_cluster:   '/assets/fx/coins/coin-cluster.png',
  glow_particle:  '/assets/pyramid-quest/effects/glow-particle.png',
  light_burst:    '/assets/fx/particles/light-burst-trio.png',
  star_cluster:   '/assets/fx/particles/star-cluster.png',
  ambient_strip_1:'/assets/fx/particles/ambient-strip-1.png',
  ambient_strip_2:'/assets/fx/particles/ambient-strip-2.png',

  // ── Audio (reused from Neon Palace sample set) ───────────────────────────
  spin_start_sfx:   '/assets/neon-palace/audio/spin-start.mp3',
  reel_stop_sfx:    '/assets/neon-palace/audio/reel-stop.mp3',
  win_sfx:          '/assets/neon-palace/audio/win-small.mp3',
  jackpot_sfx:      '/assets/neon-palace/audio/jackpot.mp3',
  background_music: '/assets/neon-palace/audio/bgm.mp3',
} as const;

export type PyramidQuestAssetId = keyof typeof PYRAMID_QUEST_ASSET_PATHS;

/** Returns the public image path for a symbol, or null to use SVG fallback. */
export function getPQSymbolImage(symbolId: string): string | null {
  const path = PYRAMID_QUEST_ASSET_PATHS[symbolId as PyramidQuestAssetId];
  return path || null;
}

/** Returns the public path for any Pyramid Quest asset. */
export function getPQAsset(assetId: PyramidQuestAssetId): string | null {
  const path = PYRAMID_QUEST_ASSET_PATHS[assetId];
  return path || null;
}
