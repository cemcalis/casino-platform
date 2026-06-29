// Branded string type — prevents raw strings being used where AssetIds are expected
export type AssetId = string & { readonly __brand: 'AssetId' };

export function assetId(raw: string): AssetId {
  return raw as AssetId;
}

export type AssetKind =
  | 'symbol'
  | 'background'
  | 'icon'
  | 'vfx'
  | 'thumb'
  | 'sfx'
  | 'music'
  | 'ambient'
  | 'animation';

export type AssetSource = 'ai-generated' | 'hand-crafted' | 'licensed' | 'placeholder';

export interface AssetLicense {
  readonly type: 'proprietary' | 'cc0' | 'mit' | 'placeholder';
  readonly owner?: string;
  readonly notes?: string;
}

interface BaseAsset {
  readonly id: AssetId;
  readonly kind: AssetKind;
  readonly source: AssetSource;
  readonly license: AssetLicense;
  readonly approved: boolean;
  readonly approvedBy?: string;
  readonly path: string;
  readonly sizeBytes?: number;
}

export interface SpriteFrames {
  readonly columns: number;
  readonly rows: number;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly totalFrames: number;
  readonly fps: number;
}

export interface VisualAsset extends BaseAsset {
  readonly kind: 'symbol' | 'background' | 'icon' | 'vfx' | 'thumb';
  readonly width: number;
  readonly height: number;
  readonly format: 'webp' | 'svg' | 'png';
  readonly altText: string;
  readonly spriteFrames?: SpriteFrames;
}

export interface AudioAsset extends BaseAsset {
  readonly kind: 'sfx' | 'music' | 'ambient';
  readonly format: 'ogg' | 'mp3';
  readonly durationMs: number;
  readonly loop: boolean;
  readonly lufs?: number;
}

export interface AnimationAsset extends BaseAsset {
  readonly kind: 'animation';
  readonly implementation: 'css' | 'framer-motion' | 'gsap' | 'canvas';
  readonly durationMs: number;
  readonly reducedMotionFallback: 'instant' | 'fade' | 'none';
}

export type AnyAsset = VisualAsset | AudioAsset | AnimationAsset;

export interface GameAssetManifest {
  readonly gameId: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly visual: ReadonlyArray<VisualAsset>;
  readonly audio: ReadonlyArray<AudioAsset>;
  readonly animations: ReadonlyArray<AnimationAsset>;
}

export interface ThemeAssetManifest {
  readonly theme: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly visual: ReadonlyArray<VisualAsset>;
  readonly audio: ReadonlyArray<AudioAsset>;
  readonly animations: ReadonlyArray<AnimationAsset>;
}
