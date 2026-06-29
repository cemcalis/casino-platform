import type { SlotConfig, ReelConfig } from './types';
import { NEON_PALACE_PAY_TABLE, REEL_STRIPS } from './symbols';
import { PAYLINES_20, PAYLINES_40, PAYLINES_50, PAYLINES_100 } from './paylines';

const REEL_CONFIGS: ReadonlyArray<ReelConfig> = REEL_STRIPS.map((strip) => ({
  strip,
  visibleRows: 3,
}));

export const NEON_PALACE_CONFIG: SlotConfig = {
  reels: REEL_CONFIGS,
  paylines: PAYLINES_20,
  payTable: NEON_PALACE_PAY_TABLE,
  minBet: 1,
  maxBet: 500,
  defaultBet: 10,
};

export function createNeonPalaceConfig(paylineCount: 20 | 40 | 50 | 100 = 20): SlotConfig {
  const paylines =
    paylineCount === 20  ? PAYLINES_20
    : paylineCount === 40 ? PAYLINES_40
    : paylineCount === 50 ? PAYLINES_50
    : PAYLINES_100;

  return { ...NEON_PALACE_CONFIG, paylines };
}
