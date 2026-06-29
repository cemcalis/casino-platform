import type { RoundOutcome } from '@casino/engine';

export type SymbolId = string & { readonly __brand: 'SymbolId' };
export function symbolId(raw: string): SymbolId {
  return raw as SymbolId;
}

// SymbolGrid[col][row] — col 0 is leftmost reel
export type SymbolGrid = ReadonlyArray<ReadonlyArray<SymbolId>>;

export type ReelStrip = ReadonlyArray<SymbolId>;

export interface ReelConfig {
  readonly strip: ReelStrip;
  readonly visibleRows: number;
}

export interface PaylineCoord {
  readonly col: number;
  readonly row: number;
}

export type Payline = ReadonlyArray<PaylineCoord>;

export interface PayTableEntry {
  readonly symbolId: SymbolId;
  readonly isWild: boolean;
  readonly isScatter: boolean;
  readonly isBonus: boolean;
  // matchCount (3|4|5) → bet multiplier
  readonly multipliers: Readonly<Partial<Record<number, number>>>;
}

export interface PayTable {
  readonly entries: ReadonlyArray<PayTableEntry>;
  readonly wildId: SymbolId | null;
  readonly scatterId: SymbolId | null;
  readonly bonusId: SymbolId | null;
  readonly minMatchCount: number;
  // scatterCount (2|3|4|5) → total-bet multiplier
  readonly scatterMultipliers: Readonly<Partial<Record<number, number>>>;
  // scatterCount → free spins awarded
  readonly scatterFreeSpins: Readonly<Partial<Record<number, number>>>;
  // bonusCount → triggers bonus round when present on payline
  readonly bonusTriggerCount: number;
}

export interface SlotConfig {
  readonly reels: ReadonlyArray<ReelConfig>;
  readonly paylines: ReadonlyArray<Payline>;
  readonly payTable: PayTable;
  readonly minBet: number;
  readonly maxBet: number;
  readonly defaultBet: number;
}

export interface PaylineWin {
  readonly paylineIndex: number;
  readonly symbolId: SymbolId;
  readonly matchCount: number;
  readonly multiplier: number;
  readonly payout: number;
  readonly positions: ReadonlyArray<PaylineCoord>;
}

export interface ScatterWin {
  readonly symbolId: SymbolId;
  readonly count: number;
  readonly multiplier: number;
  readonly payout: number;
  readonly freeSpinsAwarded: number;
  readonly positions: ReadonlyArray<PaylineCoord>;
}

export interface BonusTrigger {
  readonly symbolId: SymbolId;
  readonly count: number;
  readonly positions: ReadonlyArray<PaylineCoord>;
}

export interface SpinResult extends RoundOutcome {
  readonly grid: SymbolGrid;
  readonly bet: number;
  readonly isFreeSpın: boolean;
  readonly paylineWins: ReadonlyArray<PaylineWin>;
  readonly scatterWin: ScatterWin | null;
  readonly bonusTrigger: BonusTrigger | null;
  readonly totalPaylinesPayout: number;
  readonly totalPayout: number;
  readonly netResult: number;
  readonly freeSpinsAwarded: number;
  // RoundOutcome fields:
  readonly multiplier: number;
  readonly payoutVirtualCoins: number;
  readonly rngSeed: string;
  readonly nonce: number;
}

export interface GameSession {
  readonly sessionId: string;
  readonly balance: number;
  readonly bet: number;
  readonly spinCount: number;
  readonly freeSpinsRemaining: number;
  readonly totalWon: number;
  readonly totalWagered: number;
  readonly config: SlotConfig;
}

export type SlotState =
  | 'IDLE'
  | 'BETTING'
  | 'SPINNING'
  | 'EVALUATING'
  | 'PAYING_OUT'
  | 'AWARDING_FREE_SPINS'
  | 'FREE_SPIN'
  | 'BONUS'
  | 'COMPLETE'
  | 'ERROR';

export type SlotEvent =
  | 'PLACE_BET'
  | 'SPIN'
  | 'RESOLVE'
  | 'COLLECT'
  | 'TRIGGER_FREE_SPINS'
  | 'TRIGGER_BONUS'
  | 'END_FREE_SPINS'
  | 'END_BONUS'
  | 'RESET'
  | 'ERROR';
