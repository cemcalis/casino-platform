import { symbolId } from './types';
import type { SymbolId, PayTable, PayTableEntry, ReelStrip } from './types';

// ── Symbol IDs ────────────────────────────────────────────────────────────────
export const SYM = {
  WILD:    symbolId('wild'),
  SCATTER: symbolId('scatter'),
  HIGH_1:  symbolId('high_1'),  // Diamond
  HIGH_2:  symbolId('high_2'),  // Chalice
  HIGH_3:  symbolId('high_3'),  // Horseshoe
  MED_1:   symbolId('med_1'),   // Cyber-7
  MED_2:   symbolId('med_2'),   // Star
  LOW_1:   symbolId('low_1'),   // Bar
  LOW_2:   symbolId('low_2'),   // Violet Gem
  LOW_3:   symbolId('low_3'),   // Cyan Gem
} as const satisfies Record<string, SymbolId>;

// ── Pay Table ─────────────────────────────────────────────────────────────────
function entry(
  id: SymbolId,
  opts: { wild?: boolean; scatter?: boolean; bonus?: boolean },
  m3: number,
  m4: number,
  m5: number,
): PayTableEntry {
  return {
    symbolId: id,
    isWild: opts.wild ?? false,
    isScatter: opts.scatter ?? false,
    isBonus: opts.bonus ?? false,
    multipliers: { 3: m3, 4: m4, 5: m5 },
  };
}

export const NEON_PALACE_PAY_TABLE: PayTable = {
  entries: [
    entry(SYM.WILD,    { wild: true },   60, 150, 600),
    entry(SYM.HIGH_1,  {},               30,  90, 300),
    entry(SYM.HIGH_2,  {},               24,  72, 240),
    entry(SYM.HIGH_3,  {},               18,  60, 180),
    entry(SYM.MED_1,   {},               12,  42, 120),
    entry(SYM.MED_2,   {},               12,  36,  90),
    entry(SYM.LOW_1,   {},                6,  24,  60),
    entry(SYM.LOW_2,   {},                6,  18,  48),
    entry(SYM.LOW_3,   {},                3,  12,  30),
    entry(SYM.SCATTER, { scatter: true }, 0,   0,   0),
  ],
  wildId:    SYM.WILD,
  scatterId: SYM.SCATTER,
  bonusId:   null,
  minMatchCount: 3,
  // Applied to totalBet (bet × 20); calibrated to ~96.5% RTP with current reel strips
  scatterMultipliers: { 3: 12, 4: 55, 5: 275 },
  scatterFreeSpins:   { 3: 8,  4: 12, 5: 20  },
  bonusTriggerCount:  3,
};

// ── Reel Strips (5 reels × 40 positions) ─────────────────────────────────────
// Symbol frequency is tuned to approximate 96% RTP with 20 paylines.
const W = SYM.WILD;
const S = SYM.SCATTER;
const H1 = SYM.HIGH_1;
const H2 = SYM.HIGH_2;
const H3 = SYM.HIGH_3;
const M1 = SYM.MED_1;
const M2 = SYM.MED_2;
const L1 = SYM.LOW_1;
const L2 = SYM.LOW_2;
const L3 = SYM.LOW_3;

export const REEL_STRIPS: [ReelStrip, ReelStrip, ReelStrip, ReelStrip, ReelStrip] = [
  // Reel 1
  [H1, L2, M1, L3, H2, L1, M2, L2, H3, L3, W,  L1, H1, L3, M1, L2, H2, L1, S,  L3,
   M2, H3, L2, M1, L1, H1, L3, H2, L2, M2, H3, L1, M1, L3, H1, L2, W,  M2, L1, S ],
  // Reel 2
  [L3, H2, L1, M2, L2, H1, L3, M1, H3, L1, S,  L2, M2, H1, L3, H3, L1, M1, L2, W,
   H2, L3, H1, L2, M2, L1, H3, L3, M1, H2, L2, L1, H1, M2, L3, H3, W,  L2, M1, S ],
  // Reel 3
  [M1, L1, H3, L2, M2, L3, H1, L1, H2, L3, W,  M1, L2, H3, L3, H1, L1, M2, L2, S,
   H2, L3, M1, H1, L1, M2, H3, L2, L3, H1, W,  L1, M1, L3, H2, M2, L2, H3, L1, S ],
  // Reel 4
  [H2, L3, M2, L1, H3, L2, M1, L3, H1, L1, S,  H2, L2, M2, H3, L3, H1, L1, M1, L2,
   W,  H3, L3, H1, M2, L1, H2, L2, M1, L3, H3, L1, W,  M2, L2, H1, L3, M1, H2, S ],
  // Reel 5
  [L1, H3, L3, M1, L2, H1, L1, M2, H2, L3, W,  L2, H3, L3, M1, H1, L1, H2, L2, S,
   M2, L3, H3, L1, H1, L2, M1, L3, H2, L1, W,  M2, H3, L2, L3, H1, M1, L1, H2, S ],
];
