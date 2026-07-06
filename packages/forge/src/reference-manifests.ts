import type { GameManifest } from './types';
import { standardPaylines10 } from './manifest';

/**
 * Reference manifests used by unit tests and the RTP gate, and copied by the
 * Game Factory skill as tuning starting points. Both are original themes.
 */

/** lines/tumble reference — medium volatility, 5×3, 10 lines. */
export function emberFalls(): GameManifest {
  return {
    gameId: 'ember-falls',
    gameName: 'Ember Falls',
    provider: 'Forge Studio',
    tagline: 'Volkanik vadide basamaklı kazançlar',
    columns: 5,
    rows: 3,
    payModel: 'lines',
    paylines: standardPaylines10(),
    tumble: true,
    maxWinMultiplier: 5000,
    targetRtp: { min: 0.92, max: 0.97 },
    volatility: 3,
    symbols: [
      { id: 'ash', label: '🪨', color: '#9ca3af', weight: 100, payouts: { 3: 5, 4: 18, 5: 45 } },
      { id: 'fern', label: '🌿', color: '#4ade80', weight: 95, payouts: { 3: 5, 4: 18, 5: 45 } },
      { id: 'opal', label: '🔷', color: '#60a5fa', weight: 85, payouts: { 3: 11, 4: 30, 5: 95 } },
      { id: 'amber', label: '🟠', color: '#fb923c', weight: 75, payouts: { 3: 12, 4: 38, 5: 120 } },
      { id: 'wolf', label: '🐺', color: '#cbd5e1', weight: 45, payouts: { 3: 30, 4: 100, 5: 300 } },
      { id: 'hawk', label: '🦅', color: '#f59e0b', weight: 38, payouts: { 3: 40, 4: 125, 5: 450 } },
      { id: 'ember', label: '🔥', color: '#ef4444', weight: 26, payouts: { 3: 60, 4: 250, 5: 1000 } },
      { id: 'wild', label: '🌋', color: '#f43f5e', weight: 16, kind: 'wild', payouts: { 3: 100, 4: 375, 5: 1500 } },
      { id: 'scatter', label: '💠', color: '#a78bfa', weight: 15, kind: 'scatter', payouts: {} },
    ],
    freeSpins: {
      awards: { 3: 10, 4: 12, 5: 15 },
      retriggerSpins: 5,
      multiplierLadder: [1, 2, 3, 5],
    },
    bonusBuy: { costMultiplier: 90 },
    anteBet: { extraCostFraction: 0.25, scatterWeightFactor: 2 },
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #2a0f0a 0%, #120503 55%, #050201 100%)',
      reelBg: 'rgba(20, 8, 4, 0.85)',
      accentColor: '#fb923c',
      accentColor2: '#fde68a',
      frameColor: '#7c2d12',
      music: 'epic',
      storageKey: 'forge_ember_falls',
    },
  };
}

/** scatterPays/tumble reference — high volatility, 6×5, bombs in free spins. */
export function sugarRealm(): GameManifest {
  return {
    gameId: 'sugar-realm',
    gameName: 'Sugar Realm',
    provider: 'Forge Studio',
    tagline: 'Şeker diyarında zincirleme patlamalar',
    columns: 6,
    rows: 5,
    payModel: 'scatterPays',
    tumble: true,
    maxWinMultiplier: 10000,
    targetRtp: { min: 0.92, max: 0.97 },
    volatility: 5,
    symbols: [
      { id: 'mint', label: '🟢', color: '#4ade80', weight: 120, payouts: { 8: 0.25, 10: 0.75, 12: 2 } },
      { id: 'berry', label: '🔵', color: '#60a5fa', weight: 110, payouts: { 8: 0.35, 10: 0.8, 12: 2.75 } },
      { id: 'grape', label: '🟣', color: '#c084fc', weight: 100, payouts: { 8: 0.45, 10: 0.9, 12: 3.6 } },
      { id: 'lemon', label: '🟡', color: '#fde047', weight: 85, payouts: { 8: 0.7, 10: 1.6, 12: 5.5 } },
      { id: 'cherry', label: '🔴', color: '#f87171', weight: 70, payouts: { 8: 0.9, 10: 2.25, 12: 7 } },
      { id: 'ring', label: '🍬', color: '#f472b6', weight: 45, payouts: { 8: 1.35, 10: 4.5, 12: 13.5 } },
      { id: 'crown', label: '👑', color: '#fbbf24', weight: 30, payouts: { 8: 2.25, 10: 9, 12: 27 } },
      { id: 'heartgem', label: '💖', color: '#fb7185', weight: 18, payouts: { 8: 4.5, 10: 18, 12: 55 } },
      { id: 'scatter', label: '🍭', color: '#e879f9', weight: 15, kind: 'scatter', payouts: {} },
      { id: 'bomb', label: '💣', color: '#f97316', weight: 0.001, freeSpinWeight: 9, kind: 'bomb', payouts: {} },
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
      bgGradient: 'radial-gradient(ellipse at top, #3b0764 0%, #1e0b38 55%, #0a0416 100%)',
      reelBg: 'rgba(30, 11, 56, 0.85)',
      accentColor: '#e879f9',
      accentColor2: '#fde047',
      frameColor: '#7e22ce',
      music: 'festive',
      storageKey: 'forge_sugar_realm',
    },
  };
}
