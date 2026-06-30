// Neon Palace — asset path configuration
//
// Maps every asset ID to its public path (served from apps/web/public/).
// Empty string = placeholder → the game uses its SVG/CSS fallback automatically.
//
// HOW TO ADD A GENERATED ASSET:
//   1. Place the file in apps/web/public/assets/neon-palace/<type>/<file>
//   2. Set the corresponding path below to '/assets/neon-palace/<type>/<file>'
//   3. The component will pick up the image on next build — no other code changes needed.
//
// See assets/docs/asset-pipeline.md for the full generation workflow.

export const NEON_PALACE_ASSET_PATHS = {
  // ── Symbols (512×512 webp) ─────────────────────────────────────────────────
  WILD:     '/assets/neon-palace/symbols/wild.png',   // /assets/neon-palace/symbols/wild.webp
  SCATTER:  '/assets/neon-palace/symbols/scatter.png',   // /assets/neon-palace/symbols/scatter.webp
  ZEUS:     '/assets/neon-palace/symbols/diamond.svg',   // /assets/neon-palace/symbols/diamond.webp   (server: high_1)
  ATHENA:   '/assets/neon-palace/symbols/ruby.svg',      // /assets/neon-palace/symbols/ruby.webp      (server: high_3)
  POSEIDON: '/assets/neon-palace/symbols/emerald.svg',   // /assets/neon-palace/symbols/emerald.webp   (server: high_2)
  SAPPHIRE: '/assets/neon-palace/symbols/sapphire.svg',  // /assets/neon-palace/symbols/sapphire.webp  (future: high_4)
  ACE:      '/assets/neon-palace/symbols/ace.svg',       // /assets/neon-palace/symbols/ace.webp       (server: med_1)
  KING:     '/assets/neon-palace/symbols/king.svg',      // /assets/neon-palace/symbols/king.webp      (server: med_2)
  QUEEN:    '/assets/neon-palace/symbols/queen.svg',     // /assets/neon-palace/symbols/queen.webp     (server: low_1)
  JACK:     '/assets/neon-palace/symbols/jack.svg',      // /assets/neon-palace/symbols/jack.webp      (server: low_2)
  TEN:      '/assets/neon-palace/symbols/ten.svg',       // /assets/neon-palace/symbols/ten.webp       (server: low_3)

  // ── Backgrounds ───────────────────────────────────────────────────────────
  background: '/assets/neon-palace/backgrounds/background.png',  // /assets/neon-palace/backgrounds/background.webp
  cabinet:    '/assets/neon-palace/backgrounds/cabinet.png',  // /assets/neon-palace/backgrounds/cabinet.webp
  reel_frame: '/assets/neon-palace/ui/reel-frame.png',  // /assets/neon-palace/ui/reel-frame.png

  // ── UI panels ─────────────────────────────────────────────────────────────
  jackpot_panel: '/assets/neon-palace/ui/jackpot-panel.svg',  // /assets/neon-palace/ui/jackpot-panel.png
  spin_button:   '/assets/neon-palace/ui/spin-button.png',  // /assets/neon-palace/ui/spin-button.png
  bet_button:    '/assets/neon-palace/ui/bet-button.svg',   // /assets/neon-palace/ui/bet-button.png
  auto_button:   '/assets/neon-palace/ui/auto-button.svg',  // /assets/neon-palace/ui/auto-button.png
  turbo_button:  '/assets/neon-palace/ui/turbo-button.svg', // /assets/neon-palace/ui/turbo-button.png

  // ── Win overlays ──────────────────────────────────────────────────────────
  big_win_overlay:     '/assets/neon-palace/effects/big-win-overlay.svg',  // /assets/neon-palace/effects/big-win-overlay.webp
  mega_win_overlay:    '/assets/neon-palace/effects/mega-win-overlay.svg', // /assets/neon-palace/effects/mega-win-overlay.webp
  epic_win_overlay:    '/assets/neon-palace/effects/epic-win-overlay.svg', // /assets/neon-palace/effects/epic-win-overlay.webp
  jackpot_overlay:     '/assets/neon-palace/effects/jackpot-overlay.svg',  // /assets/neon-palace/effects/jackpot-overlay.webp

  // ── Particles ─────────────────────────────────────────────────────────────
  coin_particle: '/assets/neon-palace/effects/coin-particle.svg',  // /assets/neon-palace/effects/coin-particle.webp
  glow_particle: '/assets/neon-palace/effects/glow-particle.svg',  // /assets/neon-palace/effects/glow-particle.webp

  // ── Audio ─────────────────────────────────────────────────────────────────
  spin_start_sfx:   '/assets/neon-palace/audio/spin-start.mp3',  // /assets/neon-palace/audio/spin-start.mp3
  reel_stop_sfx:    '/assets/neon-palace/audio/reel-stop.mp3',   // /assets/neon-palace/audio/reel-stop-{0-4}.mp3
  win_sfx:          '/assets/neon-palace/audio/win-small.mp3',   // /assets/neon-palace/audio/win-{small,medium,big}.mp3
  jackpot_sfx:      '/assets/neon-palace/audio/jackpot.mp3',     // /assets/neon-palace/audio/jackpot.mp3
  background_music: '/assets/neon-palace/audio/bgm.mp3',         // /assets/neon-palace/audio/bgm.mp3
} as const;

export type NeonPalaceAssetId = keyof typeof NEON_PALACE_ASSET_PATHS;

/** Returns the public image path for a symbol, or null to use SVG fallback. */
export function getSymbolImage(symbolId: string): string | null {
  const path = NEON_PALACE_ASSET_PATHS[symbolId as NeonPalaceAssetId];
  return path || null;
}

/** Returns the public path for any Neon Palace asset, or null if still a placeholder. */
export function getNeonPalaceAsset(assetId: NeonPalaceAssetId): string | null {
  const path = NEON_PALACE_ASSET_PATHS[assetId];
  return path || null;
}
