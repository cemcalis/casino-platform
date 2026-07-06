/**
 * Slot Forge — theme-driven slot game math engine.
 * A GameManifest fully describes a game: grid, symbols, weights, features.
 * The engine is pure TypeScript so it can run in the browser today and be
 * moved server-side without changes (see CLAUDE.md: server-authoritative goal).
 */

export type PayModel = 'lines' | 'scatterPays';

export interface ForgeSymbol {
  id: string;
  /** Short label rendered on the reel tile (emoji or 1–6 chars). */
  label: string;
  color: string;
  /** Payout multipliers (× line bet for lines, × total bet for scatterPays). */
  payouts: Record<number, number>;
  /** Relative reel weight in the base game. Higher = more frequent. */
  weight: number;
  /** Weight during free spins; defaults to `weight`. */
  freeSpinWeight?: number;
  kind?: 'regular' | 'wild' | 'scatter' | 'bomb';
}

export interface FreeSpinConfig {
  /** Scatter count → spins awarded, e.g. { 3: 10, 4: 12, 5: 15 }. */
  awards: Record<number, number>;
  retriggerSpins: number;
  /**
   * lines mode: win multiplier per consecutive tumble step (Gonzo-style ladder).
   * Index 0 applies to the first evaluation. Last value repeats.
   */
  multiplierLadder?: number[];
  /** scatterPays mode: bomb multiplier values with weights. */
  bombValues?: { value: number; weight: number }[];
}

export interface BonusBuyConfig {
  /** Price as a multiple of total bet. */
  costMultiplier: number;
}

export interface AnteBetConfig {
  /** Extra bet fraction, e.g. 0.25 = +25% bet. */
  extraCostFraction: number;
  /** Scatter weight multiplier while ante is active. */
  scatterWeightFactor: number;
}

export interface GameManifest {
  gameId: string;
  gameName: string;
  provider: string;
  tagline: string;
  columns: number;
  rows: number;
  payModel: PayModel;
  /** Only for payModel 'lines'. Coordinates are [column, row]. */
  paylines?: [number, number][][];
  symbols: ForgeSymbol[];
  /** Tumbling (cascading) reels: winning symbols burst and new ones drop in. */
  tumble: boolean;
  freeSpins: FreeSpinConfig;
  bonusBuy?: BonusBuyConfig;
  anteBet?: AnteBetConfig;
  /** Advertised max win, used as a hard cap (× total bet). */
  maxWinMultiplier: number;
  /** Target RTP band the sim gate enforces. */
  targetRtp: { min: number; max: number };
  volatility: 1 | 2 | 3 | 4 | 5;
  theme: ThemeSpec;
}

export interface ThemeSpec {
  bgGradient: string;
  reelBg: string;
  accentColor: string;
  accentColor2: string;
  frameColor: string;
  /** Ambient music synth profile for the layered audio engine. */
  music: 'mystic' | 'festive' | 'epic' | 'serene' | 'arcade';
  storageKey: string;
}

/** One payline or scatter-group win found during an evaluation pass. */
export interface WinItem {
  symbolId: string;
  count: number;
  /** Cells that participate, as [column, row]. */
  cells: [number, number][];
  /** Win amount in bet-relative multiplier terms (× total bet). */
  amount: number;
  lineIndex?: number;
}

/** One evaluation + (optional) tumble refill step, replayable by the UI. */
export interface SpinStep {
  grid: string[][];
  wins: WinItem[];
  /** Total win of this step after step multiplier, × total bet. */
  stepWin: number;
  /** Multiplier applied to this step (ladder or bombs). */
  appliedMultiplier: number;
  /** Bomb values visible on this step's grid (scatterPays free spins). */
  bombs: { cell: [number, number]; value: number }[];
}

export interface SpinResult {
  steps: SpinStep[];
  /** Total win × total bet, capped at maxWinMultiplier. */
  totalWin: number;
  scatterCount: number;
  freeSpinsAwarded: number;
  isFreeSpin: boolean;
}

export interface FreeSpinSession {
  remaining: number;
  totalAwarded: number;
  accumulatedWin: number;
  spinIndex: number;
}

export interface SimReport {
  spins: number;
  rtp: number;
  baseRtp: number;
  freeSpinRtp: number;
  hitFrequency: number;
  freeSpinTriggerRate: number;
  maxWinObserved: number;
  /** Standard deviation of per-spin multiplier — volatility proxy. */
  stdDev: number;
  volatilityClass: 'low' | 'medium' | 'high' | 'extreme';
}
