// Types
export type {
  SymbolId,
  SymbolGrid,
  ReelStrip,
  ReelConfig,
  PaylineCoord,
  Payline,
  PayTableEntry,
  PayTable,
  SlotConfig,
  PaylineWin,
  ScatterWin,
  BonusTrigger,
  SpinResult,
  GameSession,
  SlotState,
  SlotEvent,
} from './types';
export { symbolId } from './types';

// Symbols & configuration
export { SYM, NEON_PALACE_PAY_TABLE, REEL_STRIPS } from './symbols';
export { NEON_PALACE_CONFIG, createNeonPalaceConfig } from './neon-palace-config';

// Paylines
export { PAYLINES_20, PAYLINES_40, PAYLINES_50, PAYLINES_100 } from './paylines';

// Reel mechanics
export { extractWindow, spinReels, getSymbolAt } from './reel';

// Win evaluation
export { evaluatePayline, evaluateAllPaylines } from './win-evaluator';

// Scatter & bonus
export { evaluateScatter, evaluateBonus } from './scatter-handler';

// Payout engine
export { computeSpinResult, validateBet } from './payout-engine';

// Session management
export { createSession, setBet, applySpinResult, canSpin } from './game-session';

// Game loop
export { GameLoop, createGameLoop } from './game-loop';
export type { SpinOutcome } from './game-loop';

// State machine
export { createSlotStateMachine } from './slot-state-machine';
