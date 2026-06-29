export type GameCategory = 'SLOTS' | 'TABLE' | 'CARD' | 'DICE' | 'CRASH' | 'INSTANT';

export type GamePhase =
  | 'IDLE'
  | 'WAITING_FOR_BET'
  | 'BET_PLACED'
  | 'PLAYING'
  | 'RESOLVING'
  | 'SHOWING_RESULT'
  | 'COMPLETE'
  | 'ERROR';

export type Volatility = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GameMeta {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly category: GameCategory;
  readonly volatility: Volatility;
  readonly rtpPercent: number;
  readonly minBet: number;
  readonly maxBet: number;
  readonly defaultBet: number;
}

export interface RoundOutcome {
  readonly multiplier: number;
  readonly payoutVirtualCoins: number;
  readonly rngSeed: string;
  readonly nonce: number;
}

export interface GameDefinition<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
  TState extends Record<string, unknown> = Record<string, unknown>,
  TOutcome extends RoundOutcome = RoundOutcome,
> {
  readonly meta: GameMeta;
  createInitialState(config: TConfig): TState;
  validateBet(bet: number): boolean;
  resolveRound(state: TState, rngSeed: string, nonce: number): TOutcome;
  applyOutcome(state: TState, outcome: TOutcome): TState;
}

export type EventListener<T> = (payload: T) => void;
export type UnsubscribeFn = () => void;
