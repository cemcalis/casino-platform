import type { Payline, PaylineCoord } from './types';

function p(...coords: [number, number][]): Payline {
  return coords.map(([col, row]): PaylineCoord => ({ col, row }));
}

// Standard 20-payline set for 5-reel × 3-row slot
// Row: 0=top, 1=middle, 2=bottom
export const PAYLINES_20: ReadonlyArray<Payline> = [
  p([0,1],[1,1],[2,1],[3,1],[4,1]),  //  1 straight middle
  p([0,0],[1,0],[2,0],[3,0],[4,0]),  //  2 straight top
  p([0,2],[1,2],[2,2],[3,2],[4,2]),  //  3 straight bottom
  p([0,0],[1,1],[2,2],[3,1],[4,0]),  //  4 V-shape
  p([0,2],[1,1],[2,0],[3,1],[4,2]),  //  5 inverted V
  p([0,1],[1,0],[2,0],[3,0],[4,1]),  //  6 top arch
  p([0,1],[1,2],[2,2],[3,2],[4,1]),  //  7 bottom arch
  p([0,0],[1,1],[2,1],[3,1],[4,2]),  //  8 diagonal down
  p([0,2],[1,1],[2,1],[3,1],[4,0]),  //  9 diagonal up
  p([0,1],[1,0],[2,1],[3,0],[4,1]),  // 10 zigzag top
  p([0,1],[1,2],[2,1],[3,2],[4,1]),  // 11 zigzag bottom
  p([0,0],[1,0],[2,1],[3,2],[4,2]),  // 12 steep diagonal down
  p([0,2],[1,2],[2,1],[3,0],[4,0]),  // 13 steep diagonal up
  p([0,1],[1,1],[2,0],[3,1],[4,1]),  // 14 middle bump top
  p([0,1],[1,1],[2,2],[3,1],[4,1]),  // 15 middle bump bottom
  p([0,0],[1,1],[2,0],[3,1],[4,0]),  // 16 top zigzag
  p([0,2],[1,1],[2,2],[3,1],[4,2]),  // 17 bottom zigzag
  p([0,0],[1,0],[2,1],[3,0],[4,0]),  // 18 top dip
  p([0,2],[1,2],[2,1],[3,2],[4,2]),  // 19 bottom bump
  p([0,0],[1,2],[2,1],[3,2],[4,0]),  // 20 wide V
];

// 40 paylines: 20 + 20 additional
const EXTRA_20: ReadonlyArray<Payline> = [
  p([0,0],[1,1],[2,2],[3,2],[4,2]),  // 21 down-then-bottom
  p([0,2],[1,1],[2,0],[3,0],[4,0]),  // 22 up-then-top
  p([0,0],[1,0],[2,0],[3,1],[4,2]),  // 23 top-then-down
  p([0,2],[1,2],[2,2],[3,1],[4,0]),  // 24 bottom-then-up
  p([0,1],[1,0],[2,1],[3,2],[4,1]),  // 25 wide zigzag
  p([0,1],[1,2],[2,1],[3,0],[4,1]),  // 26 wide zigzag inverted
  p([0,0],[1,2],[2,0],[3,2],[4,0]),  // 27 alternating top-bottom
  p([0,2],[1,0],[2,2],[3,0],[4,2]),  // 28 alternating bottom-top
  p([0,0],[1,0],[2,2],[3,0],[4,0]),  // 29 top with bottom spike
  p([0,2],[1,2],[2,0],[3,2],[4,2]),  // 30 bottom with top spike
  p([0,1],[1,1],[2,1],[3,0],[4,0]),  // 31 middle-then-top
  p([0,1],[1,1],[2,1],[3,2],[4,2]),  // 32 middle-then-bottom
  p([0,0],[1,0],[2,1],[3,1],[4,1]),  // 33 top-then-middle
  p([0,2],[1,2],[2,1],[3,1],[4,1]),  // 34 bottom-then-middle
  p([0,0],[1,1],[2,1],[3,0],[4,0]),  // 35 v-top
  p([0,2],[1,1],[2,1],[3,2],[4,2]),  // 36 v-bottom
  p([0,1],[1,0],[2,0],[3,1],[4,2]),  // 37 arch-then-drop
  p([0,1],[1,2],[2,2],[3,1],[4,0]),  // 38 arch-then-rise
  p([0,0],[1,1],[2,2],[3,1],[4,2]),  // 39 zigzag down
  p([0,2],[1,1],[2,0],[3,1],[4,0]),  // 40 zigzag up
];

export const PAYLINES_40: ReadonlyArray<Payline> = [...PAYLINES_20, ...EXTRA_20];

const EXTRA_10: ReadonlyArray<Payline> = [
  p([0,0],[1,2],[2,2],[3,2],[4,0]),  // 41
  p([0,2],[1,0],[2,0],[3,0],[4,2]),  // 42
  p([0,1],[1,0],[2,2],[3,0],[4,1]),  // 43
  p([0,1],[1,2],[2,0],[3,2],[4,1]),  // 44
  p([0,0],[1,2],[2,1],[3,0],[4,2]),  // 45
  p([0,2],[1,0],[2,1],[3,2],[4,0]),  // 46
  p([0,0],[1,2],[2,0],[3,1],[4,0]),  // 47
  p([0,2],[1,0],[2,2],[3,1],[4,2]),  // 48
  p([0,1],[1,1],[2,0],[3,0],[4,1]),  // 49
  p([0,1],[1,1],[2,2],[3,2],[4,1]),  // 50
];

export const PAYLINES_50: ReadonlyArray<Payline> = [...PAYLINES_40, ...EXTRA_10];

// 100-payline set: all unique 3-symbol combinations extended to 5 reels
// Built programmatically from all row-0/1/2 permutations on positions 2-4
const extra50: Payline[] = [];
const rows = [0, 1, 2] as const;
for (const r2 of rows) {
  for (const r3 of rows) {
    for (const r4 of rows) {
      for (const r0 of rows) {
        for (const r1 of rows) {
          const candidate = p([0,r0],[1,r1],[2,r2],[3,r3],[4,r4]);
          const key = `${r0}${r1}${r2}${r3}${r4}`;
          // Only add if not already in PAYLINES_50
          const existing50Keys = new Set(
            PAYLINES_50.map((pl) => pl.map((c) => c.row).join(''))
          );
          if (!existing50Keys.has(key) && extra50.length < 50) {
            extra50.push(candidate);
          }
        }
      }
    }
  }
}

export const PAYLINES_100: ReadonlyArray<Payline> = [...PAYLINES_50, ...extra50.slice(0, 50)];
