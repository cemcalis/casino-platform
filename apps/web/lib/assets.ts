// Casino Asset Pipeline — runtime types and resolver
// The generation-time manifest lives in /assets/<game>/manifest.json
// This module provides the runtime interface for the Next.js app.

export type AssetStatus = 'placeholder' | 'generated' | 'final';
export type AssetType = 'symbol' | 'background' | 'ui' | 'effect' | 'audio';
export type AssetFormat = 'png' | 'webp' | 'svg' | 'mp3' | 'ogg' | 'wav';

export interface AssetEntry {
  id: string;
  name: string;
  type: AssetType;
  path: string;
  fallback: string;
  usage: string;
  generationPrompt: string;
  status: AssetStatus;
  targetSize: string;
  format: AssetFormat;
  notes?: string;
}

/**
 * Resolves an asset public path for use in <img src> or CSS url().
 * Returns null when the asset is still in placeholder status — the caller
 * should render its SVG/CSS fallback instead.
 */
export function resolveAssetPath(publicPath: string | undefined | null): string | null {
  if (!publicPath) return null;
  return publicPath;
}

/**
 * Returns true if an asset path points to a real file (non-empty string).
 * Use this to gate between <img> rendering and SVG/CSS fallback rendering.
 */
export function hasAsset(publicPath: string | undefined | null): publicPath is string {
  return typeof publicPath === 'string' && publicPath.length > 0;
}
