import type { GameManifest } from '../types';

/**
 * Atlas Reef — derin deniz krallığı. Pilot game of the Game Factory pipeline.
 * 6×5 scatterPays/tumble, pearl multipliers in free spins, volatility 5.
 */
export function atlasReef(): GameManifest {
  return {
    gameId: 'atlas-reef',
    gameName: 'Atlas Reef',
    provider: 'Forge Studio',
    tagline: 'Batık krallığın incileri zincirleme patlıyor',
    columns: 6,
    rows: 5,
    payModel: 'scatterPays',
    tumble: true,
    maxWinMultiplier: 10000,
    targetRtp: { min: 0.92, max: 0.97 },
    volatility: 5,
    symbols: [
      { id: 'bubble', label: '🫧', color: '#7dd3fc', weight: 120, payouts: { 8: 0.25, 10: 0.75, 12: 2 } },
      { id: 'shell', label: '🐚', color: '#fda4af', weight: 110, payouts: { 8: 0.35, 10: 0.8, 12: 2.75 } },
      { id: 'starfish', label: '🌟', color: '#fbbf24', weight: 100, payouts: { 8: 0.45, 10: 0.9, 12: 3.6 } },
      { id: 'fish', label: '🐠', color: '#38bdf8', weight: 85, payouts: { 8: 0.7, 10: 1.6, 12: 5.5 } },
      { id: 'crab', label: '🦀', color: '#f87171', weight: 70, payouts: { 8: 0.9, 10: 2.25, 12: 7 } },
      { id: 'octopus', label: '🐙', color: '#c084fc', weight: 45, payouts: { 8: 1.35, 10: 4.5, 12: 13.5 } },
      { id: 'shark', label: '🦈', color: '#94a3b8', weight: 30, payouts: { 8: 2.25, 10: 9, 12: 27 } },
      { id: 'trident', label: '🔱', color: '#fde047', weight: 18, payouts: { 8: 4.5, 10: 18, 12: 55 } },
      { id: 'scatter', label: '🌀', color: '#22d3ee', weight: 15, kind: 'scatter', payouts: {} },
      { id: 'bomb', label: '🦪', color: '#f0abfc', weight: 0.001, freeSpinWeight: 9, kind: 'bomb', payouts: {} },
    ],
    freeSpins: {
      awards: { 4: 10, 5: 12, 6: 15 },
      retriggerSpins: 5,
      bombValues: [
        { value: 2, weight: 44 },
        { value: 3, weight: 25 },
        { value: 5, weight: 15 },
        { value: 8, weight: 8 },
        { value: 10, weight: 4 },
        { value: 25, weight: 2.4 },
        { value: 50, weight: 1 },
        { value: 100, weight: 0.6 },
      ],
    },
    bonusBuy: { costMultiplier: 100 },
    anteBet: { extraCostFraction: 0.25, scatterWeightFactor: 2 },
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #082f49 0%, #0c1e3a 55%, #020617 100%)',
      reelBg: 'rgba(8, 30, 58, 0.85)',
      accentColor: '#22d3ee',
      accentColor2: '#fde047',
      frameColor: '#155e75',
      music: 'mystic',
      storageKey: 'forge_atlas_reef',
      assets: {
        background: '/assets/atlas-reef/backgrounds/background.svg',
        symbols: {
          bubble: '/assets/atlas-reef/symbols/bubble.svg',
          shell: '/assets/atlas-reef/symbols/shell.svg',
          starfish: '/assets/atlas-reef/symbols/starfish.svg',
          fish: '/assets/atlas-reef/symbols/fish.svg',
          crab: '/assets/atlas-reef/symbols/crab.svg',
          octopus: '/assets/atlas-reef/symbols/octopus.svg',
          shark: '/assets/atlas-reef/symbols/shark.svg',
          trident: '/assets/atlas-reef/symbols/trident.svg',
          scatter: '/assets/atlas-reef/symbols/scatter.svg',
          bomb: '/assets/atlas-reef/symbols/bomb.svg',
        },
      },
    },
  };
}
