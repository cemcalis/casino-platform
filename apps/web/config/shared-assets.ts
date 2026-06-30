// Shared — asset path configuration
//
// Maps every shared asset ID to its public path (served from apps/web/public/).
//

export const SHARED_ASSET_PATHS = {
  demo_banner_bg: '/assets/shared/ui/demo-banner-bg.svg',
  logo_lockup: '/assets/shared/ui/logo-lockup.svg',
  coin_burst_sheet: '/assets/shared/particles/coin-burst-sheet.svg',
  sparkle_sheet: '/assets/shared/particles/sparkle-sheet.svg',
  button_click_sfx: '/assets/shared/audio/button-click.mp3',
} as const;

export type SharedAssetId = keyof typeof SHARED_ASSET_PATHS;

export function getSharedAsset(assetId: SharedAssetId): string | null {
  const path = SHARED_ASSET_PATHS[assetId];
  return path || null;
}
