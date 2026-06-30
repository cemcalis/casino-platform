'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';
import { getSymbolImage, getNeonPalaceAsset } from '../../../config/neon-palace-assets';
import { getSharedAsset } from '../../../config/shared-assets';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg: '#06000e', surface: '#0d0018', card: '#130020', cardBorder: '#260840',
  gold: '#d4a848', goldBright: '#f4c430', chrome: '#9daab8',
  text: '#f0eaf8', textDim: '#7a7090',
  reelBg: '#040008', reelBorder: '#180630',
  btnGrad: 'linear-gradient(135deg,#8a5e10 0%,#f4c430 30%,#ffe066 50%,#d4a030 70%,#8a5e10 100%)',
  green: '#00cc66', red: '#ff3355',
  teal: '#00c8be', magenta: '#ff2068',
  darkBg: '#04000a',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #06000e; font-family: 'Outfit', sans-serif; }

@keyframes symbolGlow {
  0%,100% { filter: drop-shadow(0 0 6px currentColor) brightness(1); }
  50%      { filter: drop-shadow(0 0 22px currentColor) brightness(1.65); }
}
@keyframes winAmount {
  0%   { transform: scale(0.5); opacity:0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity:1; }
}
@keyframes bigWinText {
  0%   { transform: scale(0) rotate(-10deg); opacity:0; }
  50%  { transform: scale(1.2) rotate(2deg); opacity:1; }
  75%  { transform: scale(0.95) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); opacity:1; }
}
@keyframes jackpotTick {
  0%,90%,100% { opacity:1; transform: translateY(0); }
  95%          { opacity:0.5; transform: translateY(-4px); }
}
@keyframes spinButtonPulse {
  0%,100% { box-shadow: 0 0 18px #d4a84888, 0 0 36px #f4c43044, inset 0 1px 0 #ffe06644; }
  50%     { box-shadow: 0 0 36px #d4a848cc, 0 0 64px #f4c43088, inset 0 1px 0 #ffe06699; }
}
@keyframes paylineTrace {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}
@keyframes starDrift {
  0%   { transform: translateY(0) translateX(0); opacity: var(--so); }
  100% { transform: translateY(-120vh) translateX(var(--sx)); opacity: 0; }
}
@keyframes scatterPulse {
  0%,100% { filter: drop-shadow(0 0 8px #00c8be) drop-shadow(0 0 16px #ff2068); }
  50%      { filter: drop-shadow(0 0 22px #00c8be) drop-shadow(0 0 44px #ff2068) brightness(1.4); }
}
@keyframes freeSpinBg {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes wiggle {
  0%,100% { transform: rotate(0deg); }
  25%      { transform: rotate(-3deg); }
  75%      { transform: rotate(3deg); }
}
@keyframes coinSpin {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(360deg); }
}
@keyframes logoShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fadeInUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes historySlide {
  from { opacity:0; transform:translateX(-20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes screenShake {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  10% { transform: translate(-5px,-2px) rotate(-0.4deg); }
  20% { transform: translate(5px,2px) rotate(0.4deg); }
  40% { transform: translate(3px,1px) rotate(0.2deg); }
  60% { transform: translate(-2px,0) rotate(-0.15deg); }
  80% { transform: translate(2px,1px); }
}
@keyframes gemFlash {
  0%,100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
@keyframes orbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-12px) scale(1.04); }
}
/* Responsive reel scaling */
@media (max-width: 576px) {
  .np-reel-outer { transform: scale(0.82); transform-origin: center top; margin-bottom: -56px; }
}
@media (max-width: 420px) {
  .np-reel-outer { transform: scale(0.67); transform-origin: center top; margin-bottom: -102px; }
}
`;

/* ─── SYMBOL DEFINITIONS ─────────────────────────────────────────────────────── */
interface SymbolDef {
  id: string; name: string; weight: number;
  payouts: number[]; color: string; glow: string; tier: number;
}
const SYMBOLS: SymbolDef[] = [
  // payouts[i] = multiplier of total bet for (i+1) matching symbols (server pays this × totalBet)
  { id:'WILD',     name:'Wild Crown',  weight:2,  payouts:[0,0,3,7.5,30],  color:'#f4c430', glow:'#ffe066', tier:5 },
  { id:'SCATTER',  name:'Star Gem',    weight:3,  payouts:[0,0,12,55,275], color:'#00c8be', glow:'#ff2068', tier:5 },
  { id:'ZEUS',     name:'Diamond',     weight:6,  payouts:[0,0,1.5,4.5,15],color:'#93c5fd', glow:'#bfdbfe', tier:4 },
  { id:'ATHENA',   name:'Ruby',        weight:8,  payouts:[0,0,0.9,3,9],   color:'#f87171', glow:'#fca5a5', tier:4 },
  { id:'POSEIDON', name:'Emerald',     weight:8,  payouts:[0,0,1.2,3.6,12],color:'#34d399', glow:'#6ee7b7', tier:4 },
  { id:'ACE',      name:'Ace',         weight:12, payouts:[0,0,0.6,2.1,6], color:'#f4c430', glow:'#fbbf24', tier:3 },
  { id:'KING',     name:'King',        weight:12, payouts:[0,0,0.6,1.8,4.5],color:'#a78bfa', glow:'#c4b5fd', tier:3 },
  { id:'QUEEN',    name:'Queen',       weight:14, payouts:[0,0,0.3,1.2,3], color:'#2dd4bf', glow:'#5eead4', tier:2 },
  { id:'JACK',     name:'Jack',        weight:15, payouts:[0,0,0.3,0.9,2.4],color:'#f472b6', glow:'#f9a8d4', tier:2 },
  { id:'TEN',      name:'Ten',         weight:20, payouts:[0,0,0.15,0.6,1.5],color:'#94a3b8', glow:'#cbd5e1', tier:1 },
];
const TOTAL_WEIGHT = SYMBOLS.reduce((s, x) => s + x.weight, 0);
const REEL_SYMBOLS = SYMBOLS.map(s => s.id);

/* ─── RNG ────────────────────────────────────────────────────────────────────── */
function cryptoRand(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0]! / 0xFFFFFFFF;
}
function weightedRandom(): string {
  let r = cryptoRand() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) { r -= s.weight; if (r <= 0) return s.id; }
  return SYMBOLS[SYMBOLS.length - 1]!.id;
}
function spinReels(): string[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => weightedRandom()));
}

/* ─── SERVER MAPPING ─────────────────────────────────────────────────────────── */
const SERVER_TO_VISUAL: Record<string, string> = {
  wild:'WILD', scatter:'SCATTER',
  high_1:'ZEUS', high_2:'POSEIDON', high_3:'ATHENA',
  med_1:'ACE', med_2:'KING',
  low_1:'QUEEN', low_2:'JACK', low_3:'TEN',
};
function mapServerGrid(grid: string[][]): string[][] {
  return grid.map(col => col.map(s => SERVER_TO_VISUAL[s] ?? s));
}
function serverWinTier(payout: number, bet: number): string {
  if (payout <= 0) return 'none';
  const m = payout / bet;
  if (m >= 100) return 'mega';
  if (m >= 50)  return 'epic';
  if (m >= 15)  return 'big';
  if (m >= 3)   return 'medium';
  return 'small';
}
function isJackpot(grid: string[][]): boolean {
  return grid.every(col => col[1] === 'WILD');
}

/* ─── PAYLINES ───────────────────────────────────────────────────────────────── */
const PAYLINES: number[][] = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],
  [0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],
  [1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],
  [0,0,1,0,0],[2,2,1,2,2],[1,0,1,0,1],[1,2,1,2,1],
  [0,1,0,1,0],[2,1,2,1,2],[0,2,0,2,0],[2,0,2,0,2],[1,1,2,1,1],
];

function evaluateWin(grid: string[][], bet: number): { payout: number; winLines: number[]; winTier: string } {
  let payout = 0;
  const winLines: number[] = [];
  const scatCount = grid.flat().filter(s => s === 'SCATTER').length;
  if (scatCount >= 3) payout += bet * (scatCount === 3 ? 12 : scatCount === 4 ? 55 : 275);
  for (let li = 0; li < PAYLINES.length; li++) {
    const line = PAYLINES[li]!;
    const cells = line.map((row, col) => grid[col]![row]!);
    const first = cells[0] === 'WILD' ? (cells.find(c => c !== 'WILD') ?? 'WILD') : cells[0]!;
    let count = 0;
    for (const c of cells) { if (c === first || c === 'WILD') count++; else break; }
    if (count >= 2) {
      const sym = SYMBOLS.find(s => s.id === first);
      if (sym && sym.payouts[count - 1]) { payout += sym.payouts[count - 1]! * bet; winLines.push(li); }
    }
  }
  let tier = 'none';
  if (payout > 0) {
    const m = payout / bet;
    if (m >= 100) tier = 'mega'; else if (m >= 50) tier = 'epic'; else if (m >= 15) tier = 'big'; else if (m >= 3) tier = 'medium'; else tier = 'small';
  }
  if (scatCount >= 3 && tier === 'none') tier = 'scatter';
  return { payout, winLines, winTier: tier };
}

/* ─── SOUND ENGINE ───────────────────────────────────────────────────────────── */
class SoundEngine {
  ctx: AudioContext | null = null; masterGain: GainNode | null = null; volume = 0.6;
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }
  private osc(type: OscillatorType, freq: number, start: number, dur: number, vol = 0.3, detune = 0) {
    if (!this.ctx || !this.masterGain) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start); o.detune.value = detune;
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(vol, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(this.masterGain); o.start(start); o.stop(start + dur + 0.05);
  }
  setVolume(v: number) { this.volume = v; if (this.masterGain) this.masterGain.gain.value = v; }
  playButtonClick() { if (!this.ctx) return; this.osc('sine', 800, this.ctx.currentTime, 0.05, 0.15); }
  playSpin() {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) this.osc('triangle', 400 - i * 30, t + i * 0.04, 0.08, 0.2);
    this.osc('sawtooth', 80, t, 0.3, 0.15);
  }
  playReel(idx: number) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    const freqs = [880, 990, 1100, 1210, 1320];
    this.osc('triangle', freqs[idx]!, t, 0.06, 0.2);
    this.osc('sine', freqs[idx]! * 1.5, t + 0.02, 0.04, 0.08);
  }
  playWin(tier: string) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    if (tier === 'small') {
      [523, 659, 784].forEach((f, i) => this.osc('sine', f, t + i * 0.12, 0.18, 0.25));
    } else if (tier === 'medium') {
      [523, 659, 784, 1047, 1319].forEach((f, i) => this.osc('sine', f, t + i * 0.1, 0.25, 0.3));
      this.osc('triangle', 200, t, 0.5, 0.2);
    } else {
      const notes = [523, 659, 784, 1047, 1319, 1568];
      notes.forEach((f, i) => { this.osc('sine', f, t + i * 0.08, 0.4, 0.35); this.osc('triangle', f / 2, t + i * 0.08, 0.4, 0.15); });
      for (let i = 0; i < 20; i++) this.osc('sine', 200 + i * 50, t + i * 0.06, 0.3, 0.1);
      this.osc('sawtooth', 100, t, 1.2, 0.2);
    }
  }
  playScatter() {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) this.osc('sine', 800 + i * 100, t + i * 0.05, 0.3, 0.15);
    for (let i = 0; i < 6; i++) this.osc('triangle', 300 + i * 50, t + i * 0.08, 0.25, 0.1);
  }
}

/* ─── SVG SYMBOL ART ─────────────────────────────────────────────────────────── */
function SymbolArt({ id, size = 90, glowing = false, imageSrc }: { id: string; size?: number; glowing?: boolean; imageSrc?: string | null }) {
  const sym = SYMBOLS.find(s => s.id === id) ?? SYMBOLS[0]!;
  const gStyle: React.CSSProperties = glowing ? { animation: 'symbolGlow 0.8s ease-in-out infinite', color: sym.color } : {};
  const s = size;
  const wrap: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: s, height: s, ...gStyle };

  if (imageSrc) {
    return (
      <div style={wrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={sym.name} width={s} height={s}
          style={{ objectFit: 'contain', width: s, height: s }}/>
      </div>
    );
  }

  if (id === 'WILD') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4c430"/><stop offset="50%" stopColor="#ffe066"/><stop offset="100%" stopColor="#c8921a"/>
          </linearGradient>
          <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe066"/><stop offset="100%" stopColor="#8a5e10"/>
          </linearGradient>
        </defs>
        {/* Crown base */}
        <rect x="18" y="62" width="54" height="12" rx="4" fill="url(#wg2)" stroke="#f4c430" strokeWidth="1"/>
        {/* Crown points */}
        <polygon points="18,62 18,38 31,50 45,30 59,50 72,38 72,62" fill="url(#wg)" stroke="#ffe066" strokeWidth="1"/>
        {/* Gem settings in crown */}
        <circle cx="45" cy="47" r="5" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1"/>
        <circle cx="45" cy="47" r="2.5" fill="#eff6ff" opacity="0.9"/>
        <circle cx="28" cy="58" r="3" fill="#f87171" stroke="#fca5a5" strokeWidth="0.8"/>
        <circle cx="62" cy="58" r="3" fill="#34d399" stroke="#6ee7b7" strokeWidth="0.8"/>
        {/* Highlights */}
        <line x1="22" y1="45" x2="26" y2="50" stroke="#ffe066" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
        <line x1="68" y1="45" x2="64" y2="50" stroke="#ffe066" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
        <text x="45" y="72" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0a0010" fontFamily="Outfit,sans-serif" letterSpacing="1">WILD</text>
      </svg>
    </div>
  );

  if (id === 'SCATTER') return (
    <div style={{ ...wrap, animation: glowing ? 'scatterPulse 1s ease-in-out infinite' : 'none' }}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <radialGradient id="scg" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#5eead4"/><stop offset="50%" stopColor="#00c8be"/><stop offset="100%" stopColor="#004d49"/>
          </radialGradient>
          <linearGradient id="scg2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2068"/><stop offset="100%" stopColor="#00c8be"/>
          </linearGradient>
        </defs>
        {/* Eight-pointed star border */}
        {[0,45,90,135].map((angle, i) => (
          <line key={i} x1="45" y1="10" x2="45" y2="80"
            stroke="url(#scg2)" strokeWidth="2.5" opacity="0.4"
            transform={`rotate(${angle} 45 45)`}/>
        ))}
        {/* Gem body - hexagonal */}
        <polygon points="45,12 68,26 68,58 45,72 22,58 22,26" fill="url(#scg)" stroke="#00c8be" strokeWidth="1"/>
        {/* Facets */}
        <polygon points="45,12 68,26 45,38 22,26" fill="#5eead4" opacity="0.4"/>
        <polygon points="22,26 45,38 22,58" fill="#0d9488" opacity="0.5"/>
        <polygon points="68,26 45,38 68,58" fill="#ccfbf1" opacity="0.3"/>
        <polygon points="22,58 45,38 45,72" fill="#0f766e" opacity="0.5"/>
        <polygon points="68,58 45,72 45,38" fill="#14b8a6" opacity="0.4"/>
        {/* Inner highlight */}
        <polygon points="45,16 63,27 45,36 27,27" fill="#a7f3d0" opacity="0.35"/>
        <circle cx="38" cy="26" r="4" fill="#fff" opacity="0.3"/>
        <circle cx="36" cy="24" r="2" fill="#fff" opacity="0.4"/>
        <text x="45" y="86" textAnchor="middle" fontSize="7" fontWeight="900" fill="#00c8be" fontFamily="Outfit,sans-serif" letterSpacing="1">SCATTER</text>
      </svg>
    </div>
  );

  /* DIAMOND (was ZEUS) */
  if (id === 'ZEUS') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="dig1" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#eff6ff"/><stop offset="40%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="dig2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dbeafe"/><stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
        </defs>
        {/* Brilliant cut diamond: octagonal girdle */}
        <polygon points="32,20 58,20 74,45 58,72 32,72 16,45" fill="url(#dig1)" stroke="#93c5fd" strokeWidth="0.8"/>
        {/* Table (flat top face) */}
        <polygon points="37,26 53,26 62,38 53,56 37,56 28,38" fill="url(#dig2)" opacity="0.85"/>
        {/* Upper main facets */}
        <polygon points="32,20 37,26 28,38 16,45" fill="#bfdbfe" opacity="0.55"/>
        <polygon points="58,20 74,45 62,38 53,26" fill="#eff6ff" opacity="0.65"/>
        <polygon points="37,26 32,20 58,20 53,26" fill="#fff" opacity="0.5"/>
        {/* Lower main facets */}
        <polygon points="16,45 28,38 37,56 32,72" fill="#60a5fa" opacity="0.5"/>
        <polygon points="74,45 58,72 53,56 62,38" fill="#2563eb" opacity="0.55"/>
        <polygon points="32,72 37,56 53,56 58,72" fill="#3b82f6" opacity="0.4"/>
        {/* Star facets on table */}
        <polygon points="37,26 45,32 28,38" fill="#dbeafe" opacity="0.4"/>
        <polygon points="53,26 62,38 45,32" fill="#eff6ff" opacity="0.4"/>
        <polygon points="45,32 28,38 37,56" fill="#93c5fd" opacity="0.3"/>
        <polygon points="45,32 62,38 53,56" fill="#bfdbfe" opacity="0.3"/>
        {/* Highlight flash */}
        <polygon points="38,22 48,22 53,26 37,26" fill="#fff" opacity="0.6"/>
        <circle cx="40" cy="28" r="3.5" fill="#fff" opacity="0.5"/>
        <circle cx="38" cy="26" r="1.5" fill="#fff" opacity="0.7"/>
      </svg>
    </div>
  );

  /* RUBY (was ATHENA) */
  if (id === 'ATHENA') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <radialGradient id="rug1" cx="38%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#fecaca"/><stop offset="35%" stopColor="#ef4444"/><stop offset="100%" stopColor="#7f1d1d"/>
          </radialGradient>
          <radialGradient id="rug2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fee2e2"/><stop offset="100%" stopColor="#b91c1c"/>
          </radialGradient>
        </defs>
        {/* Oval brilliant cut ruby */}
        <ellipse cx="45" cy="46" rx="30" ry="36" fill="url(#rug1)" stroke="#f87171" strokeWidth="0.8"/>
        {/* Table (oval table) */}
        <ellipse cx="45" cy="42" rx="18" ry="22" fill="url(#rug2)" opacity="0.8"/>
        {/* Outer facets */}
        <path d="M15,46 Q45,20 75,46" fill="none" stroke="#fca5a5" strokeWidth="0.7" opacity="0.4"/>
        <path d="M15,46 Q45,70 75,46" fill="none" stroke="#f87171" strokeWidth="0.7" opacity="0.35"/>
        {/* Pavilion facet lines */}
        <line x1="27,16" x2="45,42" y1="0" y2="0" stroke="#fca5a5" strokeWidth="0" opacity="0"/>
        <line x1="45" y1="10" x2="45" y2="42" stroke="#fca5a5" strokeWidth="0.8" opacity="0.3"/>
        <line x1="63" y1="16" x2="45" y2="42" stroke="#fca5a5" strokeWidth="0.8" opacity="0.3"/>
        <line x1="73" y1="34" x2="45" y2="42" stroke="#fca5a5" strokeWidth="0.8" opacity="0.3"/>
        <line x1="73" y1="58" x2="45" y2="42" stroke="#f87171" strokeWidth="0.8" opacity="0.3"/>
        <line x1="63" y1="74" x2="45" y2="42" stroke="#f87171" strokeWidth="0.8" opacity="0.3"/>
        <line x1="45" y1="82" x2="45" y2="42" stroke="#ef4444" strokeWidth="0.8" opacity="0.3"/>
        <line x1="27" y1="74" x2="45" y2="42" stroke="#ef4444" strokeWidth="0.8" opacity="0.3"/>
        <line x1="17" y1="58" x2="45" y2="42" stroke="#ef4444" strokeWidth="0.8" opacity="0.3"/>
        <line x1="17" y1="34" x2="45" y2="42" stroke="#fca5a5" strokeWidth="0.8" opacity="0.3"/>
        {/* Highlights */}
        <ellipse cx="38" cy="32" rx="9" ry="6" fill="#fff" opacity="0.18"/>
        <ellipse cx="35" cy="29" rx="5" ry="3.5" fill="#fff" opacity="0.25"/>
        <circle cx="33" cy="27" r="3.5" fill="#fff" opacity="0.35"/>
        <circle cx="32" cy="26" r="1.5" fill="#fff" opacity="0.5"/>
      </svg>
    </div>
  );

  /* EMERALD (was POSEIDON) */
  if (id === 'POSEIDON') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="emg1" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#a7f3d0"/><stop offset="40%" stopColor="#059669"/><stop offset="100%" stopColor="#064e3b"/>
          </linearGradient>
          <linearGradient id="emg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#047857"/>
          </linearGradient>
        </defs>
        {/* Emerald cut: clipped rectangle (octagonal) */}
        <polygon points="26,14 64,14 76,26 76,64 64,76 26,76 14,64 14,26" fill="url(#emg1)" stroke="#34d399" strokeWidth="0.8"/>
        {/* Table (center rectangle) */}
        <rect x="22" y="22" width="46" height="46" rx="2" fill="url(#emg2)" opacity="0.75"/>
        {/* Step cut lines — characteristic of emerald cut */}
        <line x1="16" y1="32" x2="74" y2="32" stroke="#6ee7b7" strokeWidth="0.7" opacity="0.5"/>
        <line x1="16" y1="42" x2="74" y2="42" stroke="#6ee7b7" strokeWidth="0.7" opacity="0.55"/>
        <line x1="16" y1="52" x2="74" y2="52" stroke="#6ee7b7" strokeWidth="0.7" opacity="0.5"/>
        <line x1="16" y1="62" x2="74" y2="62" stroke="#34d399" strokeWidth="0.5" opacity="0.35"/>
        <line x1="16" y1="22" x2="74" y2="22" stroke="#a7f3d0" strokeWidth="0.5" opacity="0.4"/>
        {/* Corner facets */}
        <polygon points="14,26 26,14 26,26" fill="#6ee7b7" opacity="0.35"/>
        <polygon points="64,14 76,26 64,26" fill="#a7f3d0" opacity="0.4"/>
        <polygon points="14,64 26,76 26,64" fill="#047857" opacity="0.4"/>
        <polygon points="76,64 64,76 64,64" fill="#065f46" opacity="0.35"/>
        {/* Table highlight */}
        <rect x="24" y="24" width="40" height="8" rx="1" fill="#a7f3d0" opacity="0.2"/>
        <rect x="26" y="16" width="38" height="6" rx="1" fill="#fff" opacity="0.18"/>
        {/* Top highlight flash */}
        <ellipse cx="36" cy="28" rx="9" ry="4" fill="#fff" opacity="0.2"/>
        <ellipse cx="33" cy="26" rx="5" ry="2.5" fill="#fff" opacity="0.28"/>
        <circle cx="30" cy="25" r="2.5" fill="#fff" opacity="0.38"/>
      </svg>
    </div>
  );

  if (id === 'ACE') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="acg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4c430"/><stop offset="50%" stopColor="#ffe066"/><stop offset="100%" stopColor="#9a6e10"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="78" height="78" rx="10" fill="#0a000f" stroke="url(#acg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="8" fill="none" stroke="#f4c43033" strokeWidth="1"/>
        {/* Corner pips */}
        <text x="14" y="26" fontSize="14" fontWeight="900" fill="url(#acg)" fontFamily="Outfit,sans-serif">A</text>
        <text x="76" y="80" fontSize="14" fontWeight="900" fill="url(#acg)" fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">A</text>
        {/* Center large A */}
        <text x="45" y="64" textAnchor="middle" fontSize="54" fontWeight="900" fill="url(#acg)" fontFamily="Outfit,sans-serif" letterSpacing="-2">A</text>
        {/* Engraved lines */}
        <line x1="10" y1="30" x2="80" y2="30" stroke="#f4c43022" strokeWidth="0.8"/>
        <line x1="10" y1="60" x2="80" y2="60" stroke="#f4c43022" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  if (id === 'KING') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd"/><stop offset="50%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#4c1d95"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="78" height="78" rx="10" fill="#0a000f" stroke="url(#kg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="8" fill="none" stroke="#8b5cf633" strokeWidth="1"/>
        <text x="14" y="26" fontSize="14" fontWeight="900" fill="url(#kg)" fontFamily="Outfit,sans-serif">K</text>
        <text x="76" y="80" fontSize="14" fontWeight="900" fill="url(#kg)" fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">K</text>
        <text x="45" y="64" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#kg)" fontFamily="Outfit,sans-serif">K</text>
        <line x1="10" y1="30" x2="80" y2="30" stroke="#8b5cf622" strokeWidth="0.8"/>
        <line x1="10" y1="60" x2="80" y2="60" stroke="#8b5cf622" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  if (id === 'QUEEN') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="qg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4"/><stop offset="50%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#0f4c45"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="78" height="78" rx="10" fill="#0a000f" stroke="url(#qg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="8" fill="none" stroke="#14b8a633" strokeWidth="1"/>
        <text x="14" y="26" fontSize="14" fontWeight="900" fill="url(#qg)" fontFamily="Outfit,sans-serif">Q</text>
        <text x="76" y="80" fontSize="14" fontWeight="900" fill="url(#qg)" fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">Q</text>
        <text x="45" y="64" textAnchor="middle" fontSize="50" fontWeight="900" fill="url(#qg)" fontFamily="Outfit,sans-serif">Q</text>
        <line x1="10" y1="30" x2="80" y2="30" stroke="#14b8a622" strokeWidth="0.8"/>
        <line x1="10" y1="60" x2="80" y2="60" stroke="#14b8a622" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  if (id === 'JACK') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="jg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9a8d4"/><stop offset="50%" stopColor="#ec4899"/><stop offset="100%" stopColor="#831843"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="78" height="78" rx="10" fill="#0a000f" stroke="url(#jg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="8" fill="none" stroke="#ec489933" strokeWidth="1"/>
        <text x="14" y="26" fontSize="14" fontWeight="900" fill="url(#jg)" fontFamily="Outfit,sans-serif">J</text>
        <text x="76" y="80" fontSize="14" fontWeight="900" fill="url(#jg)" fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">J</text>
        <text x="45" y="64" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#jg)" fontFamily="Outfit,sans-serif">J</text>
        <line x1="10" y1="30" x2="80" y2="30" stroke="#ec489922" strokeWidth="0.8"/>
        <line x1="10" y1="60" x2="80" y2="60" stroke="#ec489922" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  if (id === 'TEN') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cbd5e1"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/>
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="78" height="78" rx="10" fill="#0a000f" stroke="url(#tg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="8" fill="none" stroke="#94a3b833" strokeWidth="1"/>
        <text x="14" y="26" fontSize="12" fontWeight="900" fill="url(#tg)" fontFamily="Outfit,sans-serif">10</text>
        <text x="76" y="80" fontSize="12" fontWeight="900" fill="url(#tg)" fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">10</text>
        <text x="45" y="64" textAnchor="middle" fontSize="46" fontWeight="900" fill="url(#tg)" fontFamily="Outfit,sans-serif">10</text>
        <line x1="10" y1="30" x2="80" y2="30" stroke="#94a3b822" strokeWidth="0.8"/>
        <line x1="10" y1="60" x2="80" y2="60" stroke="#94a3b822" strokeWidth="0.8"/>
      </svg>
    </div>
  );

  return <div style={wrap}><svg width={s} height={s} viewBox="0 0 90 90"><circle cx="45" cy="45" r="40" fill={sym.color}/></svg></div>;
}

/* ─── PARTICLES ──────────────────────────────────────────────────────────────── */
interface Particle { id:number; x:number; y:number; vx:number; vy:number; rot:number; vrot:number; color:string; size:number; life:number; maxLife:number; shape:string; }
function ParticleSystem({ active, tier, centerX, centerY }: { active:boolean; tier:string; centerX:number; centerY:number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const count = tier==='mega'?180:tier==='big'?100:tier==='medium'?50:25;
    const colors = tier==='mega'?['#f4c430','#ffe066','#c8921a','#ff2068','#00c8be']:tier==='big'?['#f4c430','#ffe066','#c8921a','#fbbf24']:tier==='medium'?['#00c8be','#6ee7b7','#a78bfa']:['#fff','#f0eaf8','#9daab8'];
    const shapes = ['circle','square','star','coin','sparkle'];
    setParticles(Array.from({length:count},() => {
      const angle = (Math.random()*360)*Math.PI/180;
      const speed = 3+Math.random()*8;
      return { id:nextId.current++, x:centerX+(Math.random()-0.5)*60, y:centerY+(Math.random()-0.5)*60, vx:Math.cos(angle)*speed*(0.5+Math.random()), vy:Math.sin(angle)*speed-5-Math.random()*5, rot:Math.random()*360, vrot:(Math.random()-0.5)*15, color:colors[Math.floor(Math.random()*colors.length)]!, size:6+Math.random()*10, life:1, maxLife:60+Math.floor(Math.random()*80), shape:shapes[Math.floor(Math.random()*shapes.length)]! };
    }));
    const tick = () => {
      setParticles(prev => {
        if (prev.length === 0) return prev;
        const next = prev.map(p => ({ ...p, x:p.x+p.vx, y:p.y+p.vy, vy:p.vy+0.35, vx:p.vx*0.98, rot:p.rot+p.vrot, life:p.life-(1/p.maxLife) })).filter(p => p.life > 0);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [active, tier, centerX, centerY]);

  if (!active && particles.length === 0) return null;
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,overflow:'hidden'}}>
      {particles.map(p => {
        const sz = p.size*(0.2+p.life*0.8);
        let background = p.color;
        let borderRadius = '4px';
        let backgroundSize = 'auto';
        let backgroundPosition = '0% 0%';
        let boxShadow = `0 0 ${sz*1.5}px ${p.color}88`;

        if (p.shape === 'coin' && getSharedAsset('coin_burst_sheet')) {
          const frame = Math.floor((1 - p.life) * p.maxLife / 4) % 8;
          background = `url(${getSharedAsset('coin_burst_sheet')})`;
          backgroundSize = '800% 100%';
          backgroundPosition = `${-frame * 100}% 0%`;
          borderRadius = '0';
          boxShadow = 'none';
        } else if (p.shape === 'sparkle' && getSharedAsset('sparkle_sheet')) {
          const frame = Math.floor((1 - p.life) * 6) % 6;
          background = `url(${getSharedAsset('sparkle_sheet')})`;
          backgroundSize = '600% 100%';
          backgroundPosition = `${-frame * 100}% 0%`;
          borderRadius = '0';
          boxShadow = `0 0 ${sz}px #ffd54f`;
        } else if (p.shape === 'circle') {
          background = `radial-gradient(circle,${p.color},transparent)`;
          borderRadius = '50%';
        }

        return (
          <div key={p.id} style={{
            position:'absolute',
            left:p.x,
            top:p.y,
            width:sz,
            height:sz,
            opacity:p.life,
            transform:`rotate(${p.rot}deg) translate(-50%,-50%)`,
            background,
            backgroundSize,
            backgroundPosition,
            borderRadius,
            boxShadow
          }}/>
        );
      })}
    </div>
  );
}

/* ─── REEL STRIP (TOP-TO-BOTTOM) ─────────────────────────────────────────────── */
// Strip layout: [buf(3), result(3), pre(40)] = 46 symbols = 4600px
// translateY INCREASES during spin → earlier strip indices enter from top → top-to-bottom
const BUF      = 3;
const PRE_LEN  = 40;
const SYMBOL_H = 100;
const VISIBLE  = 3;
const FINAL_Y  = -(BUF * SYMBOL_H);                                     // -300  (result visible)
const LOOP_PT  = -(BUF + VISIBLE) * SYMBOL_H;                           // -600  (loop threshold)
const LOOP_PERIOD = PRE_LEN * SYMBOL_H - SYMBOL_H;                      // 3900
const SNAP_Y   = -(BUF + VISIBLE + 1) * SYMBOL_H;                      // -700  (invisible snap)
const SPIN_START = -((BUF + PRE_LEN - 1) * SYMBOL_H);                  // -4200 (start deep in pre)

function ReelStrip({ reelSymbols, result, isSpinning, stopDelay, onStopped, winningRows }: {
  reelSymbols: string[]; result: string[]; isSpinning: boolean; stopDelay: number;
  onStopped: () => void; winningRows: number[];
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);
  const posRef    = useRef(FINAL_Y);
  const phaseRef  = useRef<'idle'|'spinning'|'landing'>('idle');
  const rafRef    = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const onStopped$ = useRef(onStopped);
  onStopped$.current = onStopped;

  // Strip: [buf(3 random), result(3), pre(40 random)]
  const strip = useMemo(() => {
    const buf = Array.from({ length: BUF }, () => reelSymbols[Math.floor(Math.random() * reelSymbols.length)]!);
    const pre = Array.from({ length: PRE_LEN }, () => reelSymbols[Math.floor(Math.random() * reelSymbols.length)]!);
    return [...buf, ...result, ...pre];
  }, [result, reelSymbols]);

  const applyPos = (y: number, transition = 'none', filter = '') => {
    posRef.current = y;
    if (!stripRef.current) return;
    stripRef.current.style.transition = transition;
    stripRef.current.style.transform  = `translateY(${y}px)`;
    if (filter !== undefined) stripRef.current.style.filter = filter;
  };

  useEffect(() => {
    if (!isSpinning) {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      phaseRef.current = 'idle';
      applyPos(FINAL_Y, 'none', 'none');
      setLanded(false);
      return;
    }

    phaseRef.current = 'spinning';
    setLanded(false);
    applyPos(SPIN_START, 'none', 'blur(3px) brightness(1.15)');

    const SPEED = 18; // px/frame positive = strip moves down = symbols enter from top

    const tick = () => {
      if (phaseRef.current !== 'spinning') return;
      const next = posRef.current + SPEED;
      // Loop: when approaching result (LOOP_PT = -600), wrap back deep into pre-section
      applyPos(next > LOOP_PT ? next - LOOP_PERIOD : next, 'none');
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      phaseRef.current = 'landing';
      cancelAnimationFrame(rafRef.current);

      // Invisible snap to a position just above result (still blurred)
      applyPos(SNAP_Y, 'none', 'blur(2px) brightness(1.08)');

      // Two rAF to flush snap before starting CSS transition
      requestAnimationFrame(() => requestAnimationFrame(() => {
        applyPos(FINAL_Y,
          'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.32s ease-out',
          'none'
        );

        setTimeout(() => {
          // Slight overshoot bounce
          if (stripRef.current) {
            stripRef.current.style.transition = 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
            stripRef.current.style.transform  = `translateY(${FINAL_Y + 9}px)`;
          }
          setTimeout(() => {
            if (stripRef.current) {
              stripRef.current.style.transition = 'transform 0.12s ease-out';
              stripRef.current.style.transform  = `translateY(${FINAL_Y}px)`;
            }
            phaseRef.current = 'idle';
            setLanded(true);
            onStopped$.current();
          }, 150);
        }, 555);
      }));
    }, stopDelay);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isSpinning, stopDelay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      width:100, height:VISIBLE*SYMBOL_H, overflow:'hidden', position:'relative',
      background:`linear-gradient(180deg,${C.reelBg} 0%,#0a0018 50%,${C.reelBg} 100%)`,
      borderRadius:8,
      boxShadow:'inset 0 0 24px #00000099, inset 0 2px 0 #d4a84822, inset 0 -2px 0 #d4a84822',
    }}>
      {/* Shadow masks for depth — top and bottom fades */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:30,background:'linear-gradient(180deg,#06000ecc,transparent)',zIndex:10,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:30,background:'linear-gradient(0deg,#06000ecc,transparent)',zIndex:10,pointerEvents:'none'}}/>

      <div ref={stripRef} style={{willChange:'transform', transform:`translateY(${FINAL_Y}px)`}}>
        {strip.map((symId, i) => {
          // Result occupies indices BUF..BUF+VISIBLE-1
          const rowInResult = i - BUF;
          const isWin = landed && rowInResult >= 0 && rowInResult < VISIBLE && winningRows.includes(rowInResult);
          return (
            <div key={i} style={{
              width:100, height:SYMBOL_H,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderBottom:`1px solid ${C.reelBorder}`,
              background: isWin ? `radial-gradient(ellipse at center,${SYMBOLS.find(s=>s.id===symId)?.glow??'#f4c430'}28,transparent 70%)` : 'transparent',
              transition:'background 0.3s',
            }}>
              <SymbolArt id={symId} size={88} glowing={isWin} imageSrc={getSymbolImage(symId)}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PAYLINE OVERLAY ────────────────────────────────────────────────────────── */
function PaylineOverlay({ winLines, active }: { winLines:number[]; active:boolean }) {
  if (!active || winLines.length === 0) return null;
  const W = 520, CW = 100, SPACE = 4, REEL_W = CW + SPACE;
  const colors = ['#f4c430','#00c8be','#ff2068','#a78bfa','#34d399','#ff8c00','#93c5fd','#f9a8d4'];
  return (
    <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:20,width:'100%',height:'100%'}} viewBox={`0 0 ${W} 300`}>
      {winLines.slice(0, 5).map((li, idx) => {
        const line = PAYLINES[li]!;
        const pts = line.map((row, col) => `${col*REEL_W+CW/2},${row*CW+CW/2}`).join(' ');
        return (
          <polyline key={li} points={pts} fill="none" stroke={colors[idx % colors.length]} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
            strokeDasharray="800" strokeDashoffset="800"
            style={{animation:`paylineTrace 0.6s ${idx*0.12}s ease-out forwards`}}/>
        );
      })}
    </svg>
  );
}

/* ─── STAR FIELD ─────────────────────────────────────────────────────────────── */
function StarField() {
  const stars = useMemo(() => Array.from({length:60},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:0.5+Math.random()*2, dur:10+Math.random()*22, delay:-Math.random()*22,
    sx:`${(Math.random()-0.5)*50}px`, so:0.15+Math.random()*0.7,
  })), []);
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {stars.map(s => (
        <div key={s.id} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,borderRadius:'50%',background:'#fff',opacity:s.so,'--sx':s.sx,'--so':s.so,animation:`starDrift ${s.dur}s ${s.delay}s linear infinite`} as React.CSSProperties}/>
      ))}
    </div>
  );
}

/* ─── BIG WIN OVERLAY ────────────────────────────────────────────────────────── */
const WIN_TIER_CFG: Record<string,{label:string;grad:string;glow:string;bg:string}> = {
  mega:    { label:'MEGA WIN',  grad:'linear-gradient(135deg,#ff2068,#f4c430,#00c8be,#ff2068)', glow:'#ff2068', bg:'radial-gradient(ellipse at center,#1a0020dd,#06000e99)' },
  epic:    { label:'EPIC WIN',  grad:'linear-gradient(135deg,#a855f7,#f4c430,#00c8be,#a855f7)', glow:'#a855f7', bg:'radial-gradient(ellipse at center,#12001add,#06000e99)' },
  big:     { label:'BIG WIN',   grad:'linear-gradient(135deg,#f4c430,#ffe066,#c8921a,#f4c430)', glow:'#f4c430', bg:'radial-gradient(ellipse at center,#150020cc,#06000e99)' },
  jackpot: { label:'JACKPOT!',  grad:'linear-gradient(135deg,#ff2068,#f4c430,#00c8be,#ff2068)', glow:'#ffe066', bg:'radial-gradient(ellipse at center,#200040ee,#06000e99)' },
};
function BigWinOverlay({ tier, amount, onClose }: { tier:string; amount:number; onClose:()=>void }) {
  const cfg = WIN_TIER_CFG[tier] ?? WIN_TIER_CFG['big']!;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:cfg.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(6px)'}}>
      <div style={{fontSize:'clamp(36px,7vw,82px)',fontWeight:900,fontFamily:'Outfit,sans-serif',background:cfg.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200% 200%',animation:'bigWinText 0.8s cubic-bezier(0.34,1.56,0.64,1) both, logoShimmer 2s linear infinite',textAlign:'center',filter:`drop-shadow(0 0 28px ${cfg.glow})`}}>
        {cfg.label}
      </div>
      <div style={{fontSize:'clamp(24px,5vw,60px)',fontWeight:900,fontFamily:'Outfit,sans-serif',color:C.goldBright,marginTop:16,animation:'winAmount 0.6s 0.4s both',textShadow:`0 0 28px ${C.goldBright}, 0 0 56px ${cfg.glow}`}}>
        +{amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
      </div>
      <div style={{color:C.textDim,marginTop:24,fontSize:14,fontFamily:'Outfit,sans-serif',letterSpacing:2}}>TAP TO CONTINUE</div>
    </div>
  );
}

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────── */
const BET_OPTIONS = [1,2,5,10,25,50,100,500];
const soundEngine = new SoundEngine();

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function NeonPalacePage() {
  const [balance, setBalance]         = useState(1000);
  const [bet, setBet]                 = useState(1);
  const [betIdx, setBetIdx]           = useState(0);
  const [spinning, setSpinning]       = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['ACE','KING','QUEEN'],['ZEUS','POSEIDON','ATHENA'],['KING','ACE','JACK'],
    ['QUEEN','TEN','KING'],['JACK','ACE','POSEIDON'],
  ]);
  const [winData, setWinData]         = useState<{payout:number;winLines:number[];winTier:string}|null>(null);
  const [showWin, setShowWin]         = useState(false);
  const [displayPayout, setDisplayPayout] = useState(0);
  const [particles, setParticles]     = useState(false);
  const [bigWin, setBigWin]           = useState(false);
  const [freeSpins, setFreeSpins]     = useState(0);
  const [jackpot, setJackpot]         = useState(47382.50);
  const [volume, setVolume]           = useState(0.6);
  const [showVolume, setShowVolume]   = useState(false);
  const [autoSpin, setAutoSpin]       = useState(false);
  const [turbo, setTurbo]             = useState(false);
  const [history, setHistory]         = useState<{payout:number;tier:string;bet:number}[]>([]);
  const [winCount, setWinCount]       = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const [pendingResult, setPendingResult] = useState<string[][]|null>(null);
  const [apiMode, setApiMode]         = useState(false);

  // Refs for stable callbacks — avoids stale closures
  const tokenRef          = useRef<string|null>(null);
  const pendingServerWin  = useRef<{payout:number;winLines:number[];winTier:string;freeSpins:number}|null>(null);
  const soundInit         = useRef(false);
  const autoRef           = useRef(false);
  const spinRef           = useRef(false);
  const stoppedCountRef   = useRef(0);
  const pendingResultRef  = useRef<string[][]|null>(null);
  const betRef            = useRef(bet);
  const balanceRef        = useRef(balance);
  const turboRef          = useRef(turbo);
  const freeSpinsRef      = useRef(freeSpins);

  useEffect(() => { betRef.current = bet; },            [bet]);
  useEffect(() => { balanceRef.current = balance; },    [balance]);
  useEffect(() => { turboRef.current = turbo; },        [turbo]);
  useEffect(() => { freeSpinsRef.current = freeSpins; },[freeSpins]);
  useEffect(() => { autoRef.current = autoSpin; },      [autoSpin]);
  useEffect(() => { soundEngine.setVolume(volume); },   [volume]);

  // Jackpot ticker
  useEffect(() => {
    const id = setInterval(() => setJackpot(j => parseFloat((j + 0.01 + Math.random() * 0.05).toFixed(2))), 300);
    return () => clearInterval(id);
  }, []);

  // Server wallet on mount
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    tokenRef.current = token;
    userApi.getWallet(token)
      .then(w => { setBalance(parseFloat(w.balance)); setApiMode(true); })
      .catch(() => {});
  }, []);

  // Jackpot pool from server on mount
  useEffect(() => {
    gameApi.getJackpot()
      .then(r => setJackpot(parseFloat(r.amount)))
      .catch(() => {});
  }, []);

  // Win count-up animation
  useEffect(() => {
    if (!showWin || !winData || winData.payout === 0) { setDisplayPayout(0); return; }
    const target = winData.payout;
    const steps = 24;
    const stepVal = target / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + stepVal, target);
      setDisplayPayout(cur);
      if (cur >= target) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [showWin, winData]);

  const initSound = useCallback(() => {
    if (!soundInit.current) { soundEngine.init(); soundInit.current = true; }
  }, []);

  // Process result when all 5 reels stop
  const handleReelStop = useCallback((col: number) => {
    soundEngine.playReel(col);
    stoppedCountRef.current++;
    if (stoppedCountRef.current < 5) return;

    const result = pendingResultRef.current;
    if (!result) return;

    const betNow    = betRef.current;
    const serverWin = pendingServerWin.current;
    const evaluation = serverWin
      ? { payout: serverWin.payout, winLines: serverWin.winLines, winTier: serverWin.winTier }
      : evaluateWin(result, betNow);

    setWinData(evaluation);
    setReelResults(result);

    if (evaluation.payout > 0) {
      setBalance(b => parseFloat((b + evaluation.payout).toFixed(2)));
      setShowWin(true);
      setParticles(true);
      soundEngine.playWin(evaluation.winTier);
      if (['big','epic','mega','jackpot'].includes(evaluation.winTier)) setBigWin(true);
      if (evaluation.winTier === 'scatter') {
        soundEngine.playScatter();
        setFreeSpins(f => f + (serverWin?.freeSpins ?? 8));
      }
      setWinCount(n => n + 1);
      setTimeout(() => setParticles(false), 4000);
    }

    setHistory(h => [{ payout: evaluation.payout, tier: evaluation.winTier, bet: betNow }, ...h].slice(0, 10));
    setSpinning(false);
    spinRef.current = false;

    // Resync balance from server
    const tok = tokenRef.current;
    if (tok) userApi.getWallet(tok).then(w => setBalance(parseFloat(w.balance))).catch(() => {});
  }, []); // All mutable state accessed via refs; state setters are stable

  const handleSpin = useCallback(async (isFree = false) => {
    if (spinRef.current) return;
    if (!isFree && balanceRef.current < betRef.current) return;

    initSound();
    soundEngine.playSpin();
    // Deduct bet immediately for correct accounting (server will be source of truth for final balance)
    if (!isFree) setBalance(b => parseFloat((b - betRef.current).toFixed(2)));

    setShowWin(false);
    setWinData(null);
    setDisplayPayout(0);
    setParticles(false);
    setBigWin(false);
    pendingServerWin.current = null;
    stoppedCountRef.current  = 0;

    const localResult = spinReels();
    pendingResultRef.current = localResult;
    setPendingResult(localResult);
    setSpinning(true);
    spinRef.current = true;

    if (apiMode && tokenRef.current) {
      try {
        const res = await gameApi.spin(tokenRef.current, betRef.current);
        const grid       = mapServerGrid(res.grid);
        const jackpotHit = res.jackpotWon ?? isJackpot(grid);
        const jackpotPay = res.jackpotAmount ?? jackpot;
        const winTier    = jackpotHit ? 'jackpot' : serverWinTier(res.totalPayout, betRef.current);
        const payout     = jackpotHit ? jackpotPay : res.totalPayout;
        pendingResultRef.current = grid;
        setPendingResult(grid);
        pendingServerWin.current = {
          payout: isFree ? payout + betRef.current : payout,
          winLines: res.paylineWins.map(w => w.paylineIndex),
          winTier,
          freeSpins: res.freeSpinsAwarded,
        };
        if (jackpotHit) {
          gameApi.getJackpot().then(r => setJackpot(parseFloat(r.amount))).catch(() => setJackpot(2500));
        }
      } catch { /* keep local result */ }
    }
  }, [initSound, apiMode, jackpot]);

  const handleSpinRef = useRef(handleSpin);
  handleSpinRef.current = handleSpin;

  const effectiveSpin = useCallback(() => {
    if (freeSpinsRef.current > 0) {
      setFreeSpins(f => f - 1);
      void handleSpinRef.current(true);
    } else {
      void handleSpinRef.current();
    }
  }, []);

  const effectiveSpinRef = useRef(effectiveSpin);
  effectiveSpinRef.current = effectiveSpin;

  // Auto-spin: fires after each completed spin when enabled
  useEffect(() => {
    if (spinning || !autoRef.current) return;
    const delay = turboRef.current ? 400 : 1200;
    const timer = setTimeout(() => {
      if (autoRef.current) effectiveSpinRef.current();
    }, delay);
    return () => clearTimeout(timer);
  }, [spinning]);

  const getResult  = (col: number) => (pendingResult ?? reelResults)[col]!;
  const getWinRows = (col: number): number[] => {
    if (!winData || !showWin) return [];
    return [...new Set(winData.winLines.map(li => PAYLINES[li]![col]!))];
  };

  const isFreeSpinBg = freeSpins > 0;
  const isBigWin     = bigWin && winData && ['big','epic','mega','jackpot'].includes(winData.winTier);
  const multiplier   = winData && bet > 0 ? (winData.payout / bet) : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>
      <StarField/>
      <ParticleSystem active={particles} tier={winData?.winTier ?? 'small'}
        centerX={typeof window !== 'undefined' ? window.innerWidth/2 : 400}
        centerY={typeof window !== 'undefined' ? window.innerHeight/2 : 300}/>
      {isBigWin && winData && (
        <BigWinOverlay tier={winData.winTier} amount={winData.payout} onClose={() => setBigWin(false)}/>
      )}

      <div style={{
        minHeight:'100vh', position:'relative', zIndex:1,
        background: isFreeSpinBg
          ? 'linear-gradient(135deg,#1a0d00,#0d1500,#001a14,#1a0d00)'
          : (getNeonPalaceAsset('background')
              ? `url(${getNeonPalaceAsset('background')}) center/cover no-repeat`
              : 'radial-gradient(ellipse at 50% 0%,#1a0030 0%,#06000e 65%)'),
        backgroundSize: isFreeSpinBg ? '400% 400%' : 'cover',
        animation: isFreeSpinBg ? 'freeSpinBg 3s ease infinite' : (isBigWin ? 'screenShake 0.6s ease-out' : 'none'),
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'12px 16px 24px', gap:12,
        fontFamily:'Outfit,sans-serif',
      }}>

        {/* HEADER */}
        <div style={{width:'100%',maxWidth:800,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
          <div style={{lineHeight:1}}>
            {getSharedAsset('logo_lockup') ? (
              <img src={getSharedAsset('logo_lockup')!} alt="Neon Palace" style={{height:52,display:'block'}}/>
            ) : (
              <>
                <span style={{fontSize:'clamp(18px,3vw,28px)',fontWeight:900,background:'linear-gradient(90deg,#8a5e10,#f4c430,#ffe066,#d4a030,#8a5e10)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'logoShimmer 3s linear infinite',letterSpacing:1,display:'block'}}>NEON PALACE</span>
                <span style={{fontSize:'clamp(8px,1.5vw,10px)',color:C.textDim,letterSpacing:4,textTransform:'uppercase',fontWeight:700}}>Premium Slots</span>
              </>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{background:'linear-gradient(135deg,#100020,#1a002a)',border:`1px solid #d4a84844`,borderRadius:10,padding:'6px 18px',textAlign:'center',boxShadow:'0 0 16px #d4a84820'}}>
              <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Balance</div>
              <div style={{fontSize:22,fontWeight:900,color:C.goldBright,lineHeight:1.1,textShadow:`0 0 12px ${C.gold}88`}}>${balance.toFixed(2)}</div>
            </div>
            <button onClick={() => { initSound(); setShowVolume(v => !v); soundEngine.playButtonClick(); }}
              style={{width:38,height:38,borderRadius:10,border:`1px solid ${C.cardBorder}`,background:C.card,color:C.text,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                {volume > 0 && <path d="M15.54,8.46a5,5,0,0,1,0,7.07"/>}
                {volume > 0.5 && <path d="M19.07,4.93a10,10,0,0,1,0,14.14"/>}
              </svg>
            </button>
          </div>
        </div>

        {showVolume && (
          <div style={{position:'absolute',top:80,right:16,zIndex:100,background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:'12px 16px',display:'flex',flexDirection:'column',gap:8,animation:'fadeInUp 0.2s ease'}}>
            <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:2}}>Volume</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); soundEngine.setVolume(v); }} style={{width:120,accentColor:C.goldBright}}/>
          </div>
        )}

        {/* JACKPOT BAR */}
        <div style={{
          width:'100%',maxWidth:800,
          background: getNeonPalaceAsset('jackpot_panel')
            ? `url(${getNeonPalaceAsset('jackpot_panel')}) center/cover no-repeat`
            : 'linear-gradient(135deg,#0e001a,#180028)',
          border:`1px solid ${C.gold}44`,
          borderRadius:14,
          padding:'10px 24px',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          boxShadow:`0 0 24px ${C.gold}18`
        }}>
          <span style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Progressive Jackpot</span>
          <span style={{fontSize:'clamp(20px,3.5vw,32px)',fontWeight:900,color:C.goldBright,textShadow:`0 0 16px ${C.gold}, 0 0 32px #c8921a`,animation:'jackpotTick 2s ease-in-out infinite',fontVariantNumeric:'tabular-nums'}}>
            ${jackpot.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </span>
          <div style={{display:'flex',gap:5}}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{width:7,height:7,borderRadius:'50%',background:i<3?C.goldBright:'#260840',boxShadow:i<3?`0 0 6px ${C.gold}`:'none'}}/>
            ))}
          </div>
        </div>

        {freeSpins > 0 && (
          <div style={{background:'linear-gradient(135deg,#c8921a,#f4c430)',borderRadius:20,padding:'6px 20px',fontSize:14,fontWeight:800,color:'#06000e',boxShadow:`0 0 18px ${C.gold}aa`,animation:'wiggle 0.5s ease-in-out infinite'}}>
            FREE SPINS: {freeSpins} REMAINING
          </div>
        )}

        {/* REEL CABINET */}
        <div className="np-reel-outer" style={{width:'100%',maxWidth:800,position:'relative'}}>
          {/* Dark luxury cabinet outer frame */}
          <div style={{
            background: getNeonPalaceAsset('cabinet')
              ? `url(${getNeonPalaceAsset('cabinet')}) center/cover no-repeat`
              : 'linear-gradient(180deg,#0e0018 0%,#06000e 100%)',
            border:`2px solid ${C.gold}66`,
            borderRadius:18,
            padding:'18px 14px 14px',
            boxShadow:`0 0 40px #00000088, 0 0 0 1px #d4a84822, inset 0 0 30px #00000099`,
            position:'relative',
            overflow:'hidden',
          }}>
            {/* Gold corner ornaments — hardware feel */}
            {([
              [8,8,true,false,true,false],
              [8,8,true,false,false,true],
              [8,8,false,true,true,false],
              [8,8,false,true,false,true],
            ] as [number,number,boolean,boolean,boolean,boolean][]).map(([t,r,isTop,isBot,isLeft,isRight],i) => (
              <div key={i} style={{position:'absolute',top:isTop?t:'auto',bottom:isBot?t:'auto',left:isLeft?r:'auto',right:isRight?r:'auto',width:22,height:22,borderTop:isTop?`2px solid ${C.gold}`:'none',borderBottom:isBot?`2px solid ${C.gold}`:'none',borderLeft:isLeft?`2px solid ${C.gold}`:'none',borderRight:isRight?`2px solid ${C.gold}`:'none',borderRadius:isTop&&isLeft?'4px 0 0 0':isTop&&isRight?'0 4px 0 0':isBot&&isLeft?'0 0 0 4px':'0 0 4px 0'}}/>
            ))}

            {/* Cabinet name plate */}
            <div style={{textAlign:'center',marginBottom:12,letterSpacing:6,fontSize:10,fontWeight:800,color:C.gold,textTransform:'uppercase',textShadow:`0 0 8px ${C.gold}88`,opacity:0.7}}>
              ◆ NEON PALACE ◆
            </div>

            {/* Gold reel window frame */}
            <div style={{
              border:`2px solid ${C.gold}`,
              borderRadius:12,
              padding:3,
              boxShadow:`0 0 16px ${C.gold}33, inset 0 0 16px #00000066, 0 0 0 1px #8a5e1033`,
              background: getNeonPalaceAsset('reel_frame')
                ? `url(${getNeonPalaceAsset('reel_frame')}) center/cover no-repeat`
                : '#0a0015',
            }}>
              <div style={{display:'flex',gap:3,justifyContent:'center',position:'relative',height:VISIBLE*SYMBOL_H}}>
                <PaylineOverlay winLines={winData?.winLines ?? []} active={showWin}/>
                {[0,1,2,3,4].map(col => (
                  <div key={col} style={{display:'flex',flexDirection:'column',border:`1px solid ${C.reelBorder}`,borderRadius:8,overflow:'hidden',background:C.reelBg}}>
                    <ReelStrip
                      reelSymbols={REEL_SYMBOLS}
                      result={getResult(col)}
                      isSpinning={spinning}
                      stopDelay={(turbo?350:750)+col*(turbo?130:200)}
                      onStopped={() => handleReelStop(col)}
                      winningRows={getWinRows(col)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reel labels */}
            <div style={{display:'flex',gap:3,justifyContent:'center',marginTop:8}}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{width:100,textAlign:'center',fontSize:8,color:`${C.gold}66`,letterSpacing:3,textTransform:'uppercase',fontWeight:700}}>Reel {i+1}</div>
              ))}
            </div>
          </div>
        </div>

        {/* WIN BREAKDOWN PANEL */}
        {showWin && winData && winData.payout > 0 && (
          <div style={{
            width:'100%',maxWidth:800,
            background:'linear-gradient(135deg,#0e0018,#180028)',
            border:`1px solid ${C.gold}55`,borderRadius:14,
            padding:'14px 24px',textAlign:'center',
            boxShadow:`0 0 24px ${C.gold}33`,
            animation:'winAmount 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700,marginBottom:6}}>
              {winData.winTier==='scatter' ? 'FREE SPINS TRIGGERED' : winData.winLines.length > 1 ? `${winData.winLines.length} WINNING LINES` : 'WIN'}
            </div>
            <div style={{fontSize:'clamp(28px,5vw,50px)',fontWeight:900,color:C.goldBright,textShadow:`0 0 18px ${C.gold}, 0 0 36px #c8921a`,lineHeight:1.1}}>
              +${displayPayout.toFixed(2)}
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:10}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:2,textTransform:'uppercase'}}>BET</div>
                <div style={{fontSize:14,fontWeight:800,color:C.chrome}}>${bet.toFixed(2)}</div>
              </div>
              <div style={{width:1,background:C.cardBorder}}/>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:2,textTransform:'uppercase'}}>MULTIPLIER</div>
                <div style={{fontSize:14,fontWeight:800,color:C.teal}}>x{multiplier.toFixed(1)}</div>
              </div>
              <div style={{width:1,background:C.cardBorder}}/>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:9,color:C.textDim,letterSpacing:2,textTransform:'uppercase'}}>PAYOUT</div>
                <div style={{fontSize:14,fontWeight:800,color:C.goldBright}}>${winData.payout.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* CONTROL PANEL */}
        <div style={{width:'100%',maxWidth:800,background:'linear-gradient(180deg,#100020,#06000e)',border:`1px solid ${C.cardBorder}`,borderRadius:16,padding:'16px 20px',boxShadow:'0 -2px 20px #00000066'}}>
          {/* Bet row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:8,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Bet</span>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); const ni = Math.max(0,betIdx-1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1,transition:'opacity 0.2s'}}>−</button>
              <div style={{background:C.surface,border:`1px solid ${C.gold}55`,borderRadius:10,padding:'4px 16px',minWidth:82,textAlign:'center',color:C.goldBright,fontWeight:800,fontSize:18,textShadow:`0 0 8px ${C.gold}66`}}>${bet.toFixed(2)}</div>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); const ni = Math.min(BET_OPTIONS.length-1,betIdx+1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1,transition:'opacity 0.2s'}}>+</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); setAutoSpin(a => { const n = !a; autoRef.current = n; return n; }); }}
                style={{
                  padding:'6px 16px',borderRadius:10,
                  border:`1px solid ${autoSpin?C.teal:C.cardBorder}`,
                  background: getNeonPalaceAsset('auto_button')
                    ? `url(${getNeonPalaceAsset('auto_button')}) center/cover no-repeat`
                    : (autoSpin?`${C.teal}20`:C.surface),
                  color:autoSpin?C.teal:C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'
                }}>
                {autoSpin?'Stop Auto':'Auto'}
              </button>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); setTurbo(t => !t); }}
                style={{
                  padding:'6px 16px',borderRadius:10,
                  border:`1px solid ${turbo?C.magenta:C.cardBorder}`,
                  background: getNeonPalaceAsset('turbo_button')
                    ? `url(${getNeonPalaceAsset('turbo_button')}) center/cover no-repeat`
                    : (turbo?`${C.magenta}20`:C.surface),
                  color:turbo?C.magenta:C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'
                }}>Turbo</button>
            </div>
          </div>

          {/* Spin button */}
          <button
            onClick={() => { initSound(); if (!spinRef.current) effectiveSpin(); }}
            disabled={spinning}
            style={{
              width:'100%',height:66,borderRadius:14,
              background: spinning
                ? 'linear-gradient(135deg,#0e0018,#180028)'
                : (getNeonPalaceAsset('spin_button')
                    ? `url(${getNeonPalaceAsset('spin_button')}) center/cover no-repeat`
                    : C.btnGrad),
              border: spinning ? `2px solid ${C.cardBorder}` : `2px solid ${C.gold}`,
              color: spinning ? C.textDim : '#06000e',
              fontSize:'clamp(18px,3vw,22px)',fontWeight:900,
              cursor: spinning ? 'not-allowed' : 'pointer',
              letterSpacing:5,textTransform:'uppercase',
              animation: spinning ? 'none' : 'spinButtonPulse 2.2s ease-in-out infinite',
              transition:'background 0.3s, color 0.3s, border-color 0.3s',
              boxShadow: spinning ? 'none' : `0 0 24px ${C.gold}66, 0 4px 16px #00000088, inset 0 1px 0 #ffe06666`,
            }}>
            {spinning ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
                <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite'}}>◈</span>
                SPINNING
                <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite reverse'}}>◈</span>
              </span>
            ) : (
              freeSpins > 0 ? `FREE SPIN (${freeSpins})` : balance < bet ? 'INSUFFICIENT FUNDS' : 'SPIN'
            )}
          </button>
        </div>

        {/* BOTTOM INFO */}
        <div style={{width:'100%',maxWidth:800,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => { initSound(); soundEngine.playButtonClick(); setShowPaytable(p => !p); }}
            style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:showPaytable?`${C.gold}18`:C.card,border:`1px solid ${showPaytable?C.gold:C.cardBorder}`,color:showPaytable?C.goldBright:C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'}}>Paytable</button>
          <div style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:C.card,border:`1px solid ${C.cardBorder}`,color:C.textDim,fontSize:11,fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span style={{color:C.teal}}>◆</span><span>{winCount} wins</span><span style={{color:C.gold}}>◆</span><span>20 lines</span>
          </div>
          <div style={{flex:2,minWidth:200,borderRadius:10,overflow:'hidden',background:C.card,border:`1px solid ${C.cardBorder}`}}>
            <div style={{padding:'4px 10px',background:'#0e0018',borderBottom:`1px solid ${C.cardBorder}`,fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Last Spins</div>
            <div style={{display:'flex',gap:2,padding:'4px 6px',overflowX:'auto'}}>
              {history.slice(0,8).map((h,i)=>(
                <div key={i} style={{flex:'0 0 auto',width:28,height:28,borderRadius:6,background:h.payout>0?(h.tier==='mega'||h.tier==='big'?`${C.gold}30`:h.tier==='medium'?`${C.teal}20`:'#ffffff0e'):'#ff206811',border:`1px solid ${h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:'#ffffff33'):'#ff206844'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:h.payout>0?(h.tier==='mega'||h.tier==='big'?C.goldBright:h.tier==='medium'?C.teal:C.textDim):'#ff2068',animation:'historySlide 0.3s ease both'}}>
                  {h.payout>0?`x${(h.payout/h.bet).toFixed(0)}`:'—'}
                </div>
              ))}
              {history.length===0&&<span style={{fontSize:11,color:C.textDim,padding:'4px 6px',opacity:0.5}}>No spins yet</span>}
            </div>
          </div>
        </div>

        {/* PAYTABLE */}
        {showPaytable && (
          <div style={{width:'100%',maxWidth:800,background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:16,padding:16,animation:'fadeInUp 0.3s ease both'}}>
            <div style={{fontSize:12,fontWeight:800,color:C.goldBright,textTransform:'uppercase',letterSpacing:3,marginBottom:12,textAlign:'center',textShadow:`0 0 8px ${C.gold}66`}}>Paytable — Neon Palace</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:6}}>
              {SYMBOLS.map(sym=>(
                <div key={sym.id} style={{display:'flex',alignItems:'center',gap:8,background:C.surface,borderRadius:10,padding:'6px 10px',border:`1px solid ${sym.color}28`}}>
                  <SymbolArt id={sym.id} size={40} imageSrc={getSymbolImage(sym.id)}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:sym.color}}>{sym.name}</div>
                    <div style={{fontSize:10,color:C.textDim}}>{sym.payouts.map((p,i)=>p>0?`${i+1}×${p}`:null).filter(Boolean).join(' | ')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:'8px 12px',background:'#0a0014',borderRadius:10,border:`1px solid ${C.teal}28`,textAlign:'center'}}>
              <span style={{fontSize:11,color:C.teal,fontWeight:700}}>3+ SCATTER = 8 FREE SPINS • WILD substitutes all symbols</span>
            </div>
          </div>
        )}

        <div style={{width:'100%',maxWidth:800,textAlign:'center',paddingTop:8}}>
          <div style={{fontSize:9,color:`${C.textDim}66`,letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>
            RTP 96.2% • Min Bet $0.20 • Max Bet $50.00 • Social Casino — No Real Money
          </div>
        </div>
      </div>
    </>
  );
}
