'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg: '#02000a',
  surface: '#06001a',
  card: '#0c0020',
  cardBorder: '#1e0638',

  gold: '#c8a040',
  goldBright: '#f4c430',
  goldLight: '#ffe066',
  goldDeep: '#7a5008',
  goldMid: '#d4a848',

  chrome: '#8090a8',
  chromeMid: '#b0c0d4',
  chromeBright: '#d8e8f8',

  text: '#f0eaf8',
  textDim: '#6a6080',
  textFaint: '#3a3050',

  reelBg: '#010004',
  reelBorder: '#100420',

  teal: '#00c8be',
  magenta: '#ff2068',
  green: '#00cc66',
  red: '#ff3355',
  purple: '#8b3df0',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #02000a; font-family: 'Outfit', sans-serif; overflow-x: hidden; }

/* ── Symbol animations ── */
@keyframes symbolGlow {
  0%,100% { filter: drop-shadow(0 0 6px currentColor) brightness(1); }
  50%      { filter: drop-shadow(0 0 26px currentColor) brightness(1.7); }
}
@keyframes scatterPulse {
  0%,100% { filter: drop-shadow(0 0 8px #00c8be) drop-shadow(0 0 16px #ff2068); }
  50%      { filter: drop-shadow(0 0 24px #00c8be) drop-shadow(0 0 44px #ff2068) brightness(1.4); }
}

/* ── Win animations ── */
@keyframes winAmount {
  0%   { transform: scale(0.4) translateY(8px); opacity:0; }
  60%  { transform: scale(1.1) translateY(-2px); }
  100% { transform: scale(1) translateY(0); opacity:1; }
}
@keyframes bigWinText {
  0%   { transform: scale(0) rotate(-12deg); opacity:0; }
  50%  { transform: scale(1.18) rotate(2deg); opacity:1; }
  75%  { transform: scale(0.96) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); opacity:1; }
}
@keyframes winLineDetail {
  from { opacity:0; transform: translateX(-12px); }
  to   { opacity:1; transform: translateX(0); }
}
@keyframes paylineTrace {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}
@keyframes coinBurst {
  0%   { transform: translate(var(--cx),var(--cy)) scale(0.4); opacity:1; }
  80%  { opacity: 0.8; }
  100% { transform: translate(calc(var(--cx) + var(--dx)),calc(var(--cy) + var(--dy))) scale(1); opacity:0; }
}

/* ── Jackpot ── */
@keyframes jackpotGlow {
  0%,100% { text-shadow: 0 0 6px #f4c43088, 0 0 12px #d4a84866; filter: brightness(1); }
  50%      { text-shadow: 0 0 12px #f4c430cc, 0 0 24px #d4a848aa, 0 0 44px #8a5e1055; filter: brightness(1.12); }
}
@keyframes jackpotPlate {
  0%,100% { box-shadow: 0 0 20px #d4a84820, inset 0 0 30px #00000088; }
  50%      { box-shadow: 0 0 36px #d4a84840, inset 0 0 30px #00000088; }
}

/* ── Cabinet/ambient ── */
@keyframes ambientOrb {
  0%,100% { opacity:0.35; transform: scale(1) translate(0,0); }
  33%      { opacity:0.55; transform: scale(1.1) translate(6px,-8px); }
  66%      { opacity:0.4;  transform: scale(0.96) translate(-4px,5px); }
}
@keyframes lightBeam {
  0%,100% { opacity:0.025; }
  50%      { opacity:0.06; }
}
@keyframes glassSheen {
  0%   { left: -30%; opacity:0; }
  5%   { opacity:1; }
  95%  { opacity:0.6; }
  100% { left: 130%; opacity:0; }
}
@keyframes cabinetEdgePulse {
  0%,100% { opacity:0.5; }
  50%      { opacity:0.8; }
}

/* ── Spin button ── */
@keyframes spinButtonIdle {
  0%,100% {
    box-shadow: 0 7px 0 #6a3e08, 0 10px 24px #000000aa,
                inset 0 2px 0 #ffe06655, inset 0 -3px 0 #0000003a,
                0 0 20px #d4a84844;
  }
  50% {
    box-shadow: 0 7px 0 #6a3e08, 0 10px 24px #000000aa,
                inset 0 2px 0 #ffe066aa, inset 0 -3px 0 #0000003a,
                0 0 40px #d4a84866;
  }
}

/* ── Logo ── */
@keyframes logoGold {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* ── Misc ── */
@keyframes wiggle {
  0%,100% { transform: rotate(0deg); }
  25%      { transform: rotate(-3deg); }
  75%      { transform: rotate(3deg); }
}
@keyframes coinSpin {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(360deg); }
}
@keyframes fadeInUp {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes historySlide {
  from { opacity:0; transform:translateX(-16px); }
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
@keyframes freeSpinBg {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes starDrift {
  0%   { transform: translateY(0) translateX(0); opacity: var(--so); }
  100% { transform: translateY(-120vh) translateX(var(--sx)); opacity: 0; }
}
@keyframes orbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-14px) scale(1.05); }
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
  { id:'WILD',     name:'Wild Crown',  weight:2,  payouts:[0,0,50,500,5000], color:'#f4c430', glow:'#ffe066', tier:5 },
  { id:'SCATTER',  name:'Star Gem',    weight:3,  payouts:[0,0,12,30,100],   color:'#00c8be', glow:'#ff2068', tier:5 },
  { id:'ZEUS',     name:'Diamond',     weight:6,  payouts:[0,0,20,100,1000], color:'#93c5fd', glow:'#bfdbfe', tier:4 },
  { id:'ATHENA',   name:'Ruby',        weight:8,  payouts:[0,0,15,75,750],   color:'#f87171', glow:'#fca5a5', tier:4 },
  { id:'POSEIDON', name:'Emerald',     weight:8,  payouts:[0,0,10,50,500],   color:'#34d399', glow:'#6ee7b7', tier:4 },
  { id:'ACE',      name:'Ace',         weight:12, payouts:[0,0,5,20,200],    color:'#f4c430', glow:'#fbbf24', tier:3 },
  { id:'KING',     name:'King',        weight:12, payouts:[0,0,4,15,150],    color:'#a78bfa', glow:'#c4b5fd', tier:3 },
  { id:'QUEEN',    name:'Queen',       weight:14, payouts:[0,0,3,10,100],    color:'#2dd4bf', glow:'#5eead4', tier:2 },
  { id:'JACK',     name:'Jack',        weight:15, payouts:[0,0,2,8,75],      color:'#f472b6', glow:'#f9a8d4', tier:2 },
  { id:'TEN',      name:'Ten',         weight:20, payouts:[0,0,1,5,50],      color:'#94a3b8', glow:'#cbd5e1', tier:1 },
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
  if (m >= 100) return 'mega'; if (m >= 50) return 'epic';
  if (m >= 15)  return 'big';  if (m >= 3)  return 'medium';
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

interface WinDetail { symbol: string; count: number; payout: number; }

function evaluateWin(grid: string[][], bet: number): {
  payout: number; winLines: number[]; winTier: string; winDetails: WinDetail[];
} {
  let payout = 0;
  const winLines: number[] = [];
  const winDetails: WinDetail[] = [];
  const scatCount = grid.flat().filter(s => s === 'SCATTER').length;
  if (scatCount >= 3) {
    const scatPay = bet * (scatCount === 3 ? 12 : scatCount === 4 ? 30 : 100);
    payout += scatPay;
    winDetails.push({ symbol: 'Star Gems', count: scatCount, payout: scatPay });
  }
  for (let li = 0; li < PAYLINES.length; li++) {
    const line = PAYLINES[li]!;
    const cells = line.map((row, col) => grid[col]![row]!);
    const first = cells[0] === 'WILD' ? (cells.find(c => c !== 'WILD') ?? 'WILD') : cells[0]!;
    let count = 0;
    for (const c of cells) { if (c === first || c === 'WILD') count++; else break; }
    if (count >= 2) {
      const sym = SYMBOLS.find(s => s.id === first);
      if (sym && sym.payouts[count - 1]) {
        const linePay = sym.payouts[count - 1]! * bet;
        payout += linePay;
        winLines.push(li);
        winDetails.push({ symbol: sym.name, count, payout: linePay });
      }
    }
  }
  let tier = 'none';
  if (payout > 0) {
    const m = payout / bet;
    if (m >= 100) tier = 'mega'; else if (m >= 50) tier = 'epic'; else if (m >= 15) tier = 'big'; else if (m >= 3) tier = 'medium'; else tier = 'small';
  }
  if (scatCount >= 3 && tier === 'none') tier = 'scatter';
  // Sort details by payout desc
  winDetails.sort((a, b) => b.payout - a.payout);
  return { payout, winLines, winTier: tier, winDetails };
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
  private osc(type: OscillatorType, freq: number, start: number, dur: number, vol = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start);
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
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
        this.osc('sine', f, t + i * 0.08, 0.4, 0.35);
        this.osc('triangle', f / 2, t + i * 0.08, 0.4, 0.15);
      });
      for (let i = 0; i < 20; i++) this.osc('sine', 200 + i * 50, t + i * 0.06, 0.3, 0.1);
      this.osc('sawtooth', 100, t, 1.2, 0.2);
    }
  }
  playScatter() {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) this.osc('sine', 800 + i * 100, t + i * 0.05, 0.3, 0.15);
  }
}

/* ─── SVG SYMBOL ART ─────────────────────────────────────────────────────────── */
function SymbolArt({ id, size = 90, glowing = false }: { id: string; size?: number; glowing?: boolean }) {
  const sym = SYMBOLS.find(s => s.id === id) ?? SYMBOLS[0]!;
  const gStyle: React.CSSProperties = glowing ? { animation: 'symbolGlow 0.8s ease-in-out infinite', color: sym.color } : {};
  const s = size;
  const wrap: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'center', width:s, height:s, ...gStyle };

  if (id === 'WILD') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4c430"/><stop offset="50%" stopColor="#ffe066"/><stop offset="100%" stopColor="#c8921a"/></linearGradient>
          <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe066"/><stop offset="100%" stopColor="#7a5008"/></linearGradient>
        </defs>
        <rect x="18" y="62" width="54" height="12" rx="4" fill="url(#wg2)" stroke="#f4c430" strokeWidth="1"/>
        <polygon points="18,62 18,38 31,50 45,30 59,50 72,38 72,62" fill="url(#wg)" stroke="#ffe066" strokeWidth="1"/>
        <circle cx="45" cy="47" r="5" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1"/>
        <circle cx="45" cy="47" r="2.5" fill="#eff6ff" opacity="0.9"/>
        <circle cx="28" cy="58" r="3" fill="#f87171" stroke="#fca5a5" strokeWidth="0.8"/>
        <circle cx="62" cy="58" r="3" fill="#34d399" stroke="#6ee7b7" strokeWidth="0.8"/>
        <line x1="22" y1="45" x2="26" y2="50" stroke="#ffe066" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
        <line x1="68" y1="45" x2="64" y2="50" stroke="#ffe066" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
        <text x="45" y="72" textAnchor="middle" fontSize="8" fontWeight="900" fill="#06000e" fontFamily="Outfit,sans-serif" letterSpacing="1">WILD</text>
      </svg>
    </div>
  );

  if (id === 'SCATTER') return (
    <div style={{ ...wrap, animation: glowing ? 'scatterPulse 1s ease-in-out infinite' : 'none' }}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <radialGradient id="scg" cx="40%" cy="35%"><stop offset="0%" stopColor="#5eead4"/><stop offset="50%" stopColor="#00c8be"/><stop offset="100%" stopColor="#004d49"/></radialGradient>
          <linearGradient id="scg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff2068"/><stop offset="100%" stopColor="#00c8be"/></linearGradient>
        </defs>
        {[0,45,90,135].map((angle, i) => (<line key={i} x1="45" y1="10" x2="45" y2="80" stroke="url(#scg2)" strokeWidth="2.5" opacity="0.4" transform={`rotate(${angle} 45 45)`}/>))}
        <polygon points="45,12 68,26 68,58 45,72 22,58 22,26" fill="url(#scg)" stroke="#00c8be" strokeWidth="1"/>
        <polygon points="45,12 68,26 45,38 22,26" fill="#5eead4" opacity="0.4"/>
        <polygon points="22,26 45,38 22,58" fill="#0d9488" opacity="0.5"/>
        <polygon points="68,26 45,38 68,58" fill="#ccfbf1" opacity="0.3"/>
        <polygon points="22,58 45,38 45,72" fill="#0f766e" opacity="0.5"/>
        <polygon points="68,58 45,72 45,38" fill="#14b8a6" opacity="0.4"/>
        <polygon points="45,16 63,27 45,36 27,27" fill="#a7f3d0" opacity="0.35"/>
        <circle cx="38" cy="26" r="4" fill="#fff" opacity="0.3"/>
        <circle cx="36" cy="24" r="2" fill="#fff" opacity="0.4"/>
        <text x="45" y="86" textAnchor="middle" fontSize="7" fontWeight="900" fill="#00c8be" fontFamily="Outfit,sans-serif" letterSpacing="1">SCATTER</text>
      </svg>
    </div>
  );

  /* DIAMOND */
  if (id === 'ZEUS') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="dig1" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0%" stopColor="#eff6ff"/><stop offset="40%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
          <linearGradient id="dig2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#dbeafe"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
        </defs>
        <polygon points="32,20 58,20 74,45 58,72 32,72 16,45" fill="url(#dig1)" stroke="#93c5fd" strokeWidth="0.8"/>
        <polygon points="37,26 53,26 62,38 53,56 37,56 28,38" fill="url(#dig2)" opacity="0.85"/>
        <polygon points="32,20 37,26 28,38 16,45" fill="#bfdbfe" opacity="0.55"/>
        <polygon points="58,20 74,45 62,38 53,26" fill="#eff6ff" opacity="0.65"/>
        <polygon points="37,26 32,20 58,20 53,26" fill="#fff" opacity="0.5"/>
        <polygon points="16,45 28,38 37,56 32,72" fill="#60a5fa" opacity="0.5"/>
        <polygon points="74,45 58,72 53,56 62,38" fill="#2563eb" opacity="0.55"/>
        <polygon points="32,72 37,56 53,56 58,72" fill="#3b82f6" opacity="0.4"/>
        <polygon points="38,22 48,22 53,26 37,26" fill="#fff" opacity="0.6"/>
        <circle cx="40" cy="28" r="3.5" fill="#fff" opacity="0.5"/>
        <circle cx="38" cy="26" r="1.5" fill="#fff" opacity="0.7"/>
      </svg>
    </div>
  );

  /* RUBY */
  if (id === 'ATHENA') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <radialGradient id="rug1" cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#fecaca"/><stop offset="35%" stopColor="#ef4444"/><stop offset="100%" stopColor="#7f1d1d"/></radialGradient>
          <radialGradient id="rug2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fee2e2"/><stop offset="100%" stopColor="#b91c1c"/></radialGradient>
        </defs>
        <ellipse cx="45" cy="46" rx="30" ry="36" fill="url(#rug1)" stroke="#f87171" strokeWidth="0.8"/>
        <ellipse cx="45" cy="42" rx="18" ry="22" fill="url(#rug2)" opacity="0.8"/>
        {[0,40,80,120,160,200,240,280,320].map((a,i) => (
          <line key={i} x1="45" y1="11" x2={45+Math.cos(a*Math.PI/180)*18} y2={42+Math.sin(a*Math.PI/180)*20} stroke="#fca5a5" strokeWidth="0.7" opacity="0.3"/>
        ))}
        <ellipse cx="38" cy="32" rx="9" ry="6" fill="#fff" opacity="0.18"/>
        <circle cx="33" cy="27" r="3.5" fill="#fff" opacity="0.35"/>
        <circle cx="32" cy="26" r="1.5" fill="#fff" opacity="0.5"/>
      </svg>
    </div>
  );

  /* EMERALD */
  if (id === 'POSEIDON') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="emg1" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0%" stopColor="#a7f3d0"/><stop offset="40%" stopColor="#059669"/><stop offset="100%" stopColor="#064e3b"/></linearGradient>
          <linearGradient id="emg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6ee7b7"/><stop offset="100%" stopColor="#047857"/></linearGradient>
        </defs>
        <polygon points="26,14 64,14 76,26 76,64 64,76 26,76 14,64 14,26" fill="url(#emg1)" stroke="#34d399" strokeWidth="0.8"/>
        <rect x="22" y="22" width="46" height="46" rx="2" fill="url(#emg2)" opacity="0.75"/>
        {[25,35,45,55,65].map((y, i) => (<line key={i} x1="16" y1={y} x2="74" y2={y} stroke="#6ee7b7" strokeWidth={i===2?0.8:0.6} opacity={i===2?0.55:0.45}/>))}
        <polygon points="14,26 26,14 26,26" fill="#6ee7b7" opacity="0.35"/>
        <polygon points="64,14 76,26 64,26" fill="#a7f3d0" opacity="0.4"/>
        <polygon points="14,64 26,76 26,64" fill="#047857" opacity="0.4"/>
        <polygon points="76,64 64,76 64,64" fill="#065f46" opacity="0.35"/>
        <rect x="26" y="16" width="38" height="6" rx="1" fill="#fff" opacity="0.18"/>
        <circle cx="30" cy="25" r="2.5" fill="#fff" opacity="0.38"/>
      </svg>
    </div>
  );

  const cardBg = '#06000e';
  const cardGrads: Record<string,[string,string,string]> = {
    ACE:   ['#ffe066','#f4c430','#7a5008'],
    KING:  ['#c4b5fd','#8b5cf6','#4c1d95'],
    QUEEN: ['#5eead4','#14b8a6','#0f4c45'],
    JACK:  ['#f9a8d4','#ec4899','#831843'],
    TEN:   ['#cbd5e1','#94a3b8','#334155'],
  };
  const [cLight, cMid, cDark] = cardGrads[id] ?? ['#f4c430','#d4a848','#8a5e10'];
  const gradId = `cg_${id}`;
  return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={cLight}/><stop offset="50%" stopColor={cMid}/><stop offset="100%" stopColor={cDark}/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="82" height="82" rx="11" fill={cardBg} stroke={`url(#${gradId})`} strokeWidth="2.5"/>
        <rect x="8" y="8" width="74" height="74" rx="8" fill="none" stroke={cMid} strokeWidth="0.6" opacity="0.3"/>
        <line x1="8" y1="28" x2="82" y2="28" stroke={cMid} strokeWidth="0.6" opacity="0.18"/>
        <line x1="8" y1="62" x2="82" y2="62" stroke={cMid} strokeWidth="0.6" opacity="0.18"/>
        <text x="14" y="26" fontSize="13" fontWeight="900" fill={`url(#${gradId})`} fontFamily="Outfit,sans-serif">{id==='TEN'?'10':id.charAt(0)}</text>
        <text x="76" y="80" fontSize="13" fontWeight="900" fill={`url(#${gradId})`} fontFamily="Outfit,sans-serif" textAnchor="middle" transform="rotate(180 76 76)">{id==='TEN'?'10':id.charAt(0)}</text>
        <text x="45" y="64" textAnchor="middle" fontSize={id==='TEN'?44:52} fontWeight="900" fill={`url(#${gradId})`} fontFamily="Outfit,sans-serif">{id==='TEN'?'10':id.charAt(0)}</text>
      </svg>
    </div>
  );
}

/* ─── PARTICLES ──────────────────────────────────────────────────────────────── */
interface Particle {
  id:number; x:number; y:number; vx:number; vy:number;
  rot:number; vrot:number; color:string; size:number;
  life:number; maxLife:number; shape:string;
}
function ParticleSystem({ active, tier, centerX, centerY }: { active:boolean; tier:string; centerX:number; centerY:number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const count = tier==='mega'?200:tier==='big'?120:tier==='medium'?60:30;
    const colors = tier==='mega'
      ? ['#f4c430','#ffe066','#c8921a','#ff2068','#00c8be','#ffffff']
      : tier==='big'
      ? ['#f4c430','#ffe066','#c8921a','#fbbf24','#ffffff']
      : tier==='medium'
      ? ['#00c8be','#6ee7b7','#a78bfa','#f4c430']
      : ['#f4c43099','#ffe06699','#ffffff99'];
    const shapes = ['circle','square','coin'];
    setParticles(Array.from({length:count},() => {
      const angle = Math.random()*Math.PI*2;
      const speed = 3+Math.random()*9;
      return {
        id:nextId.current++,
        x:centerX+(Math.random()-0.5)*80, y:centerY+(Math.random()-0.5)*80,
        vx:Math.cos(angle)*speed*(0.5+Math.random()),
        vy:Math.sin(angle)*speed-6-Math.random()*6,
        rot:Math.random()*360, vrot:(Math.random()-0.5)*16,
        color:colors[Math.floor(Math.random()*colors.length)]!,
        size:6+Math.random()*11,
        life:1, maxLife:60+Math.floor(Math.random()*90),
        shape:shapes[Math.floor(Math.random()*shapes.length)]!,
      };
    }));
    const tick = () => {
      setParticles(prev => {
        if (prev.length===0) return prev;
        return prev
          .map(p => ({...p, x:p.x+p.vx, y:p.y+p.vy, vy:p.vy+0.35, vx:p.vx*0.98, rot:p.rot+p.vrot, life:p.life-(1/p.maxLife)}))
          .filter(p => p.life>0);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [active, tier, centerX, centerY]);

  if (!active && particles.length===0) return null;
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,overflow:'hidden'}}>
      {particles.map(p => {
        const sz = p.size*(0.2+p.life*0.8);
        const isCoin = p.shape==='coin';
        return (
          <div key={p.id} style={{
            position:'absolute', left:p.x, top:p.y,
            width:isCoin?sz*1.1:sz, height:sz,
            opacity:p.life,
            transform:`rotate(${p.rot}deg) translate(-50%,-50%)`,
            background:p.shape==='circle'?`radial-gradient(circle,${p.color},transparent)`:p.color,
            borderRadius:isCoin?'50%':p.shape==='circle'?'50%':'3px',
            boxShadow:`0 0 ${sz*1.5}px ${p.color}88`,
            border: isCoin ? `1px solid ${p.color}aa` : 'none',
          }}/>
        );
      })}
    </div>
  );
}

/* ─── AMBIENT BACKGROUND ─────────────────────────────────────────────────────── */
function AmbientBackground({ winning }: { winning: boolean }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
      {/* Base palace gradient — dark hall with ceiling glow */}
      <div style={{
        position:'absolute', inset:0,
        background:`
          radial-gradient(ellipse 100% 55% at 50% 0%,   #1e0050 0%,  transparent 65%),
          radial-gradient(ellipse 45%  90% at 0%  50%,  #0e0030 0%,  transparent 75%),
          radial-gradient(ellipse 45%  90% at 100% 50%, #0e0030 0%,  transparent 75%),
          radial-gradient(ellipse 80%  40% at 50% 100%, #08001a 0%,  transparent 70%),
          #02000a
        `,
      }}/>

      {/* Large blurred atmospheric orbs */}
      <div style={{position:'absolute',left:'-5%',top:'15%',width:400,height:400,borderRadius:'50%',background:`radial-gradient(circle,${winning?'#2a003855':'#200030aa'},transparent 70%)`,filter:'blur(60px)',animation:'ambientOrb 14s ease-in-out infinite'}}/>
      <div style={{position:'absolute',right:'-5%',top:'25%',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,#18002866,transparent 70%)',filter:'blur(50px)',animation:'ambientOrb 18s 5s ease-in-out infinite'}}/>
      <div style={{position:'absolute',left:'30%',bottom:'-5%',width:500,height:250,borderRadius:'50%',background:'radial-gradient(circle,#10002055,transparent 70%)',filter:'blur(70px)',animation:'ambientOrb 22s 10s ease-in-out infinite'}}/>

      {/* Vertical light columns — palace pillars feel */}
      {[8, 22, 50, 78, 92].map((left, i) => (
        <div key={i} style={{
          position:'absolute', top:0, bottom:0,
          left:`${left}%`, width:1,
          background:`linear-gradient(180deg,transparent 0%,${C.goldMid}55 25%,${C.goldMid}66 50%,${C.goldMid}55 75%,transparent 100%)`,
          animation:`lightBeam ${9+i*2.5}s ${i*1.6}s ease-in-out infinite`,
          filter:'blur(2px)',
        }}/>
      ))}

      {/* Winning state — subtle color shift */}
      {winning && (
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 40% at 50% 60%,#2a001444,transparent 70%)',transition:'opacity 0.5s'}}/>
      )}
    </div>
  );
}

/* ─── STAR FIELD ─────────────────────────────────────────────────────────────── */
function StarField() {
  const stars = useMemo(() => Array.from({length:90},(_,i)=>({
    id:i,
    x:Math.random()*100, y:Math.random()*100,
    size:0.4+Math.random()*2.2,
    dur:9+Math.random()*24, delay:-Math.random()*24,
    sx:`${(Math.random()-0.5)*55}px`,
    so:0.1+Math.random()*0.7,
    color:(['#fff','#fff','#fff','#ffe080','#80c0ff','#ffb0c0'][Math.floor(Math.random()*6)]) ?? '#fff',
  })), []);
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute',
          left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size,
          borderRadius:'50%', background:s.color,
          opacity:s.so,
          '--sx':s.sx,'--so':s.so,
          animation:`starDrift ${s.dur}s ${s.delay}s linear infinite`,
          boxShadow:s.size>1.5?`0 0 ${s.size*2}px ${s.color}`:'none',
        } as React.CSSProperties}/>
      ))}
    </div>
  );
}

/* ─── REEL STRIP (TOP-TO-BOTTOM) ─────────────────────────────────────────────── */
// Strip: [buf(3), result(3), pre(40)] = 46 symbols
// translateY INCREASES during spin → symbols enter from top → top-to-bottom
const BUF      = 3;
const PRE_LEN  = 40;
const SYMBOL_H = 100;
const VISIBLE  = 3;
const FINAL_Y  = -(BUF * SYMBOL_H);
const LOOP_PT  = -(BUF + VISIBLE) * SYMBOL_H;
const LOOP_PERIOD = PRE_LEN * SYMBOL_H - SYMBOL_H;
const SNAP_Y   = -(BUF + VISIBLE + 1) * SYMBOL_H;
const SPIN_START = -((BUF + PRE_LEN - 1) * SYMBOL_H);

function ReelStrip({ reelSymbols, result, isSpinning, stopDelay, onStopped, winningRows }: {
  reelSymbols: string[]; result: string[]; isSpinning: boolean; stopDelay: number;
  onStopped: () => void; winningRows: number[];
}) {
  const stripRef  = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);
  const posRef    = useRef(FINAL_Y);
  const phaseRef  = useRef<'idle'|'spinning'|'landing'>('idle');
  const rafRef    = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const onStopped$ = useRef(onStopped);
  onStopped$.current = onStopped;

  const strip = useMemo(() => {
    const buf = Array.from({length:BUF}, () => reelSymbols[Math.floor(Math.random()*reelSymbols.length)]!);
    const pre = Array.from({length:PRE_LEN}, () => reelSymbols[Math.floor(Math.random()*reelSymbols.length)]!);
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
    applyPos(SPIN_START, 'none', 'blur(3px) brightness(1.18)');

    const SPEED = 18;
    const tick = () => {
      if (phaseRef.current !== 'spinning') return;
      const next = posRef.current + SPEED;
      applyPos(next > LOOP_PT ? next - LOOP_PERIOD : next, 'none');
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      phaseRef.current = 'landing';
      cancelAnimationFrame(rafRef.current);
      applyPos(SNAP_Y, 'none', 'blur(2px) brightness(1.08)');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        applyPos(FINAL_Y, 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.3s ease-out', 'none');
        setTimeout(() => {
          if (stripRef.current) {
            stripRef.current.style.transition = 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
            stripRef.current.style.transform  = `translateY(${FINAL_Y+9}px)`;
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

    return () => { cancelAnimationFrame(rafRef.current); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isSpinning, stopDelay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      width:100, height:VISIBLE*SYMBOL_H, overflow:'hidden', position:'relative',
      background:`linear-gradient(180deg,${C.reelBg} 0%,#08001a 50%,${C.reelBg} 100%)`,
      borderRadius:6,
    }}>
      {/* Top depth fade */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:36,background:`linear-gradient(180deg,${C.reelBg}ee,transparent)`,zIndex:10,pointerEvents:'none'}}/>
      {/* Bottom depth fade */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:36,background:`linear-gradient(0deg,${C.reelBg}ee,transparent)`,zIndex:10,pointerEvents:'none'}}/>
      {/* Symbol row dividers — subtle scanline effect */}
      {[1,2].map(i => (
        <div key={i} style={{position:'absolute',left:0,right:0,top:i*SYMBOL_H-1,height:1,background:'#ffffff06',zIndex:8,pointerEvents:'none'}}/>
      ))}

      <div ref={stripRef} style={{willChange:'transform',transform:`translateY(${FINAL_Y}px)`}}>
        {strip.map((symId, i) => {
          const rowInResult = i - BUF;
          const isWin = landed && rowInResult>=0 && rowInResult<VISIBLE && winningRows.includes(rowInResult);
          return (
            <div key={i} style={{
              width:100, height:SYMBOL_H,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:isWin?`radial-gradient(ellipse at center,${SYMBOLS.find(s=>s.id===symId)?.glow??'#f4c430'}30,transparent 72%)`:'transparent',
              transition:'background 0.3s',
            }}>
              <SymbolArt id={symId} size={88} glowing={isWin}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PAYLINE OVERLAY ────────────────────────────────────────────────────────── */
function PaylineOverlay({ winLines, active }: { winLines:number[]; active:boolean }) {
  if (!active || winLines.length===0) return null;
  const CW=100, SPACE=3, REEL_W=CW+SPACE;
  const W = 5*CW + 4*SPACE;
  const colors = ['#f4c430','#00c8be','#ff2068','#a78bfa','#34d399','#ff8c00','#93c5fd','#f9a8d4'];
  return (
    <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:20,width:'100%',height:'100%'}} viewBox={`0 0 ${W} 300`}>
      {winLines.slice(0,5).map((li,idx) => {
        const line = PAYLINES[li]!;
        const pts = line.map((row,col) => `${col*REEL_W+CW/2},${row*CW+CW/2}`).join(' ');
        return (
          <polyline key={li} points={pts} fill="none" stroke={colors[idx%colors.length]} strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.92"
            strokeDasharray="800" strokeDashoffset="800"
            style={{animation:`paylineTrace 0.6s ${idx*0.12}s ease-out forwards`}}/>
        );
      })}
    </svg>
  );
}

/* ─── BIG WIN OVERLAY ────────────────────────────────────────────────────────── */
const WIN_TIER_CFG: Record<string,{label:string;sub:string;grad:string;glow:string;bg:string;ring:string}> = {
  mega:    { label:'MEGA WIN',   sub:'MASSIVE PAYOUT',  grad:'linear-gradient(135deg,#ff2068,#f4c430,#00c8be,#ff2068)', glow:'#ff2068', ring:'#ff2068', bg:'radial-gradient(ellipse at center,#1e0030dd,#02000a99)' },
  epic:    { label:'EPIC WIN',   sub:'INCREDIBLE!',     grad:'linear-gradient(135deg,#a855f7,#f4c430,#00c8be,#a855f7)', glow:'#a855f7', ring:'#a855f7', bg:'radial-gradient(ellipse at center,#14002add,#02000a99)' },
  big:     { label:'BIG WIN',    sub:'GREAT SPIN!',     grad:'linear-gradient(135deg,#f4c430,#ffe066,#c8921a,#f4c430)', glow:'#f4c430', ring:'#d4a848', bg:'radial-gradient(ellipse at center,#160028cc,#02000a99)' },
  jackpot: { label:'JACKPOT!',   sub:'YOU HIT IT!',     grad:'linear-gradient(135deg,#ff2068,#f4c430,#00c8be,#ff2068)', glow:'#ffe066', ring:'#f4c430', bg:'radial-gradient(ellipse at center,#280050ee,#02000a99)' },
};
function BigWinOverlay({ tier, amount, onClose }: { tier:string; amount:number; onClose:()=>void }) {
  const cfg = WIN_TIER_CFG[tier] ?? WIN_TIER_CFG['big']!;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:cfg.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(8px)'}}>
      {/* Ring accent */}
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',border:`1px solid ${cfg.ring}22`,top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',border:`1px solid ${cfg.ring}11`,top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>

      {/* Subtitle */}
      <div style={{fontSize:'clamp(11px,2vw,15px)',fontWeight:700,letterSpacing:6,color:cfg.glow,textTransform:'uppercase',opacity:0.8,marginBottom:12,fontFamily:'Outfit,sans-serif',animation:'fadeInUp 0.4s ease both'}}>
        {cfg.sub}
      </div>

      {/* Title */}
      <div style={{fontSize:'clamp(38px,7vw,88px)',fontWeight:900,fontFamily:'Outfit,sans-serif',background:cfg.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200% 200%',animation:'bigWinText 0.8s cubic-bezier(0.34,1.56,0.64,1) both, logoGold 2s linear infinite',textAlign:'center',filter:`drop-shadow(0 0 30px ${cfg.glow})`}}>
        {cfg.label}
      </div>

      {/* Amount */}
      <div style={{fontSize:'clamp(26px,5.5vw,66px)',fontWeight:900,fontFamily:'Outfit,sans-serif',color:C.goldBright,marginTop:16,animation:'winAmount 0.6s 0.5s both',textShadow:`0 0 28px ${C.goldBright}, 0 0 56px ${cfg.glow}, 0 2px 0 #00000088`}}>
        +{amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
      </div>

      <div style={{color:C.textDim,marginTop:28,fontSize:13,fontFamily:'Outfit,sans-serif',letterSpacing:3,textTransform:'uppercase',animation:'fadeInUp 0.6s 0.8s both'}}>
        Tap anywhere to continue
      </div>
    </div>
  );
}

/* ─── JACKPOT LED DISPLAY ────────────────────────────────────────────────────── */
function JackpotDisplay({ value }: { value: number }) {
  const str = value.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
  return (
    <div style={{display:'flex',alignItems:'center',gap:1}}>
      <span style={{fontSize:'clamp(14px,2vw,20px)',fontWeight:900,color:C.goldMid,marginRight:2,letterSpacing:-1}}>$</span>
      {str.split('').map((ch, i) => {
        const isDigit = /\d/.test(ch);
        return (
          <div key={i} style={{
            background: isDigit ? 'linear-gradient(180deg,#030002,#050004)' : 'transparent',
            border: isDigit ? '1px solid #281000' : 'none',
            borderRadius: 4,
            padding: isDigit ? '1px 3px' : '0 1px',
            minWidth: isDigit ? 'clamp(14px,1.8vw,22px)' : 'auto',
            textAlign:'center',
            fontSize:'clamp(18px,2.8vw,30px)',
            fontWeight:900,
            fontFamily:"'Courier New',monospace",
            color:C.goldBright,
            lineHeight:1.25,
            textShadow:`0 0 8px ${C.goldBright}99, 0 0 18px ${C.goldMid}77`,
            animation: isDigit ? `jackpotGlow 1.8s ${i*0.08}s ease-in-out infinite` : 'none',
            boxShadow: isDigit ? `inset 0 2px 4px #00000077, inset 0 -1px 0 #2a1000` : 'none',
          }}>{ch}</div>
        );
      })}
    </div>
  );
}

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────── */
const BET_OPTIONS = [0.20,0.50,1,2,5,10,20,50];
const soundEngine = new SoundEngine();

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function NeonPalacePage() {
  const [balance, setBalance]         = useState(1000);
  const [bet, setBet]                 = useState(1);
  const [betIdx, setBetIdx]           = useState(2);
  const [spinning, setSpinning]       = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['ACE','KING','QUEEN'],['ZEUS','POSEIDON','ATHENA'],['KING','ACE','JACK'],
    ['QUEEN','TEN','KING'],['JACK','ACE','POSEIDON'],
  ]);
  const [winData, setWinData]         = useState<{payout:number;winLines:number[];winTier:string;winDetails:WinDetail[]}|null>(null);
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

  const tokenRef         = useRef<string|null>(null);
  const pendingServerWin = useRef<{payout:number;winLines:number[];winTier:string;freeSpins:number}|null>(null);
  const soundInit        = useRef(false);
  const autoRef          = useRef(false);
  const spinRef          = useRef(false);
  const stoppedCountRef  = useRef(0);
  const pendingResultRef = useRef<string[][]|null>(null);
  const betRef           = useRef(bet);
  const balanceRef       = useRef(balance);
  const turboRef         = useRef(turbo);
  const freeSpinsRef     = useRef(freeSpins);

  useEffect(() => { betRef.current = bet; },            [bet]);
  useEffect(() => { balanceRef.current = balance; },    [balance]);
  useEffect(() => { turboRef.current = turbo; },        [turbo]);
  useEffect(() => { freeSpinsRef.current = freeSpins; },[freeSpins]);
  useEffect(() => { autoRef.current = autoSpin; },      [autoSpin]);
  useEffect(() => { soundEngine.setVolume(volume); },   [volume]);

  // Jackpot ticker
  useEffect(() => {
    const id = setInterval(() => setJackpot(j => parseFloat((j+0.01+Math.random()*0.05).toFixed(2))), 300);
    return () => clearInterval(id);
  }, []);

  // Server wallet on mount
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    tokenRef.current = token;
    userApi.getWallet(token).then(w => { setBalance(parseFloat(w.balance)); setApiMode(true); }).catch(() => {});
  }, []);

  // Win count-up with easing
  useEffect(() => {
    if (!showWin || !winData || winData.payout===0) { setDisplayPayout(0); return; }
    const target = winData.payout;
    let step = 0;
    const steps = 32;
    const iv = setInterval(() => {
      step++;
      const p = step/steps;
      const eased = 1-Math.pow(1-p,3); // cubic ease-out
      setDisplayPayout(target*eased);
      if (step>=steps) clearInterval(iv);
    }, 35);
    return () => clearInterval(iv);
  }, [showWin, winData]);

  const initSound = useCallback(() => {
    if (!soundInit.current) { soundEngine.init(); soundInit.current = true; }
  }, []);

  const handleReelStop = useCallback((col: number) => {
    soundEngine.playReel(col);
    stoppedCountRef.current++;
    if (stoppedCountRef.current < 5) return;

    const result = pendingResultRef.current;
    if (!result) return;

    const betNow    = betRef.current;
    const serverWin = pendingServerWin.current;
    const evaluation = serverWin
      ? {
          payout:     serverWin.payout,
          winLines:   serverWin.winLines,
          winTier:    serverWin.winTier,
          winDetails: evaluateWin(result, betNow).winDetails,
        }
      : evaluateWin(result, betNow);

    setWinData(evaluation);
    setReelResults(result);

    if (evaluation.payout > 0) {
      setBalance(b => parseFloat((b+evaluation.payout).toFixed(2)));
      setShowWin(true);
      setParticles(true);
      soundEngine.playWin(evaluation.winTier);
      if (['big','epic','mega','jackpot'].includes(evaluation.winTier)) setBigWin(true);
      if (evaluation.winTier==='scatter') {
        soundEngine.playScatter();
        setFreeSpins(f => f+(serverWin?.freeSpins??8));
      }
      setWinCount(n => n+1);
      setTimeout(() => setParticles(false), 4500);
    }

    setHistory(h => [{payout:evaluation.payout,tier:evaluation.winTier,bet:betNow},...h].slice(0,10));
    setSpinning(false);
    spinRef.current = false;

    const tok = tokenRef.current;
    if (tok) userApi.getWallet(tok).then(w => setBalance(parseFloat(w.balance))).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSpin = useCallback(async (isFree = false) => {
    if (spinRef.current) return;
    if (!isFree && balanceRef.current < betRef.current) return;

    initSound();
    soundEngine.playSpin();
    if (!isFree) setBalance(b => parseFloat((b-betRef.current).toFixed(2)));

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
        const jackpotHit = isJackpot(grid);
        const winTier    = jackpotHit ? 'jackpot' : serverWinTier(res.totalPayout, betRef.current);
        const payout     = jackpotHit ? jackpot : res.totalPayout;
        pendingResultRef.current = grid;
        setPendingResult(grid);
        pendingServerWin.current = {
          payout: isFree ? payout+betRef.current : payout,
          winLines: res.paylineWins.map(w => w.paylineIndex),
          winTier,
          freeSpins: res.freeSpinsAwarded,
        };
        if (jackpotHit) setJackpot(2500);
      } catch { /* keep local */ }
    }
  }, [initSound, apiMode, jackpot]);

  const handleSpinRef = useRef(handleSpin);
  handleSpinRef.current = handleSpin;

  const effectiveSpin = useCallback(() => {
    if (freeSpinsRef.current > 0) { setFreeSpins(f => f-1); void handleSpinRef.current(true); }
    else void handleSpinRef.current();
  }, []);

  const effectiveSpinRef = useRef(effectiveSpin);
  effectiveSpinRef.current = effectiveSpin;

  // Auto-spin after each completed spin
  useEffect(() => {
    if (spinning || !autoRef.current) return;
    const delay = turboRef.current ? 400 : 1400;
    const timer = setTimeout(() => { if (autoRef.current) effectiveSpinRef.current(); }, delay);
    return () => clearTimeout(timer);
  }, [spinning]);

  const getResult  = (col: number) => (pendingResult ?? reelResults)[col]!;
  const getWinRows = (col: number): number[] => {
    if (!winData || !showWin) return [];
    return [...new Set(winData.winLines.map(li => PAYLINES[li]![col]!))];
  };

  const isFreeSpinBg = freeSpins > 0;
  const isBigWin     = bigWin && winData && ['big','epic','mega','jackpot'].includes(winData.winTier);
  const multiplier   = winData && bet>0 ? winData.payout/bet : 0;
  const isWinning    = showWin && !!winData && winData.payout > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>
      <AmbientBackground winning={isWinning}/>
      <StarField/>
      <ParticleSystem active={particles} tier={winData?.winTier ?? 'small'}
        centerX={typeof window!=='undefined'?window.innerWidth/2:400}
        centerY={typeof window!=='undefined'?window.innerHeight/2:300}/>
      {isBigWin && winData && (
        <BigWinOverlay tier={winData.winTier} amount={winData.payout} onClose={() => setBigWin(false)}/>
      )}

      {/* PAGE WRAPPER */}
      <div style={{
        minHeight:'100vh', position:'relative', zIndex:1,
        background: isFreeSpinBg
          ? 'linear-gradient(135deg,#1a0d00,#0d1500,#001a14,#1a0d00)'
          : 'transparent',
        backgroundSize: isFreeSpinBg ? '400% 400%' : 'auto',
        animation: isFreeSpinBg ? 'freeSpinBg 3s ease infinite' : (isBigWin ? 'screenShake 0.6s ease-out' : 'none'),
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'10px 12px 28px',
        fontFamily:'Outfit,sans-serif',
      }}>
        <div style={{width:'100%',maxWidth:840,display:'flex',flexDirection:'column',gap:10}}>

          {/* ── HEADER ── */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:4}}>
            {/* Logo */}
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.goldMid}55)`,width:40}}/>
                <span style={{color:C.gold,fontSize:9,opacity:0.6,letterSpacing:2}}>◆</span>
              </div>
              <div style={{
                fontSize:'clamp(20px,3.5vw,36px)',fontWeight:900,
                background:`linear-gradient(180deg,${C.goldLight} 0%,${C.goldBright} 25%,${C.goldMid} 60%,${C.goldDeep} 100%)`,
                backgroundSize:'200% auto',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                animation:'logoGold 4s linear infinite',
                letterSpacing:5,
                filter:`drop-shadow(0 2px 0 #00000077) drop-shadow(0 0 14px ${C.goldMid}44)`,
                lineHeight:1,
              }}>NEON PALACE</div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                <div style={{height:1,background:`linear-gradient(90deg,${C.goldMid}44,transparent)`,width:40}}/>
                <span style={{fontSize:8,color:C.textDim,letterSpacing:4,textTransform:'uppercase',fontWeight:700}}>Premium Slots</span>
              </div>
            </div>

            {/* Balance + volume */}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* Balance card */}
              <div style={{
                background:'linear-gradient(160deg,#0e001e,#06000e)',
                border:`1px solid ${C.goldMid}44`,
                borderRadius:12,padding:'6px 18px',textAlign:'center',
                boxShadow:`0 0 20px ${C.goldMid}18, inset 0 1px 0 ${C.goldLight}18`,
              }}>
                <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Balance</div>
                <div style={{fontSize:22,fontWeight:900,color:C.goldBright,lineHeight:1.1,textShadow:`0 0 12px ${C.goldMid}88`}}>
                  ${balance.toFixed(2)}
                </div>
              </div>
              {/* Volume */}
              <button onClick={() => { initSound(); setShowVolume(v=>!v); soundEngine.playButtonClick(); }}
                style={{width:38,height:38,borderRadius:10,border:`1px solid ${C.cardBorder}`,background:C.card,color:C.text,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                  {volume>0 && <path d="M15.54,8.46a5,5,0,0,1,0,7.07"/>}
                  {volume>0.5 && <path d="M19.07,4.93a10,10,0,0,1,0,14.14"/>}
                </svg>
              </button>
            </div>
          </div>

          {showVolume && (
            <div style={{position:'absolute',top:72,right:12,zIndex:100,background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:'12px 16px',display:'flex',flexDirection:'column',gap:8,animation:'fadeInUp 0.2s ease',boxShadow:`0 8px 24px #00000088`}}>
              <span style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Volume</span>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e=>{const v=parseFloat(e.target.value);setVolume(v);soundEngine.setVolume(v);}}
                style={{width:120,accentColor:C.goldBright}}/>
            </div>
          )}

          {/* ── JACKPOT PANEL ── */}
          <div style={{
            background:'linear-gradient(135deg,#0a0016,#0e001e,#0a0016)',
            border:`1px solid ${C.goldMid}55`,
            borderRadius:14,
            padding:'10px 20px',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            animation:'jackpotPlate 3s ease-in-out infinite',
            position:'relative', overflow:'hidden',
          }}>
            {/* Metal shine sweep */}
            <div style={{position:'absolute',top:0,bottom:0,width:60,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)',animation:'glassSheen 8s 2s ease-in-out infinite',pointerEvents:'none'}}/>

            <div>
              <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700,marginBottom:2}}>Progressive Jackpot</div>
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                {[...Array(5)].map((_,i) => (
                  <div key={i} style={{width:6,height:6,borderRadius:'50%',background:i<3?C.goldBright:'#1e0638',boxShadow:i<3?`0 0 6px ${C.goldMid}`:'none'}}/>
                ))}
              </div>
            </div>
            <JackpotDisplay value={jackpot}/>
          </div>

          {freeSpins>0 && (
            <div style={{background:'linear-gradient(135deg,#c8921a,#f4c430)',borderRadius:20,padding:'5px 20px',fontSize:13,fontWeight:800,color:'#02000a',textAlign:'center',boxShadow:`0 0 18px ${C.goldMid}aa`,animation:'wiggle 0.5s ease-in-out infinite'}}>
              FREE SPINS: {freeSpins} REMAINING
            </div>
          )}

          {/* ── PREMIUM CABINET ── */}
          <div className="np-reel-outer" style={{position:'relative'}}>

            {/* Chrome top strip with rivets */}
            <div style={{
              height:10,
              background:'linear-gradient(180deg,#6a7a8a 0%,#9daab8 35%,#c8d8e8 50%,#9daab8 65%,#4a5a6a 100%)',
              borderRadius:'16px 16px 0 0',
              position:'relative', overflow:'hidden',
            }}>
              {[8,22,38,50,62,78,92].map(left => (
                <div key={left} style={{position:'absolute',top:'50%',left:`${left}%`,transform:'translate(-50%,-50%)',width:5,height:5,borderRadius:'50%',background:'radial-gradient(circle at 35% 30%,#d8e8f8,#3a4a5a)',boxShadow:'0 1px 2px #00000066'}}/>
              ))}
            </div>

            {/* Outer cabinet shell */}
            <div style={{
              background:'linear-gradient(180deg,#0a001a 0%,#060010 100%)',
              border:`1px solid ${C.goldMid}66`,
              borderTop:'none',
              borderRadius:'0 0 18px 18px',
              padding:'14px 12px 16px',
              position:'relative', overflow:'hidden',
              boxShadow:[
                `0 0 0 1px ${C.chrome}22`,
                `0 20px 60px #000000cc`,
                `0 0 80px ${C.goldMid}14`,
                `inset 0 0 60px #00000099`,
                `inset 0 1px 0 ${C.goldLight}14`,
              ].join(','),
            }}>

              {/* Corner ambient orbs */}
              {[{top:10,left:10},{top:10,right:10},{bottom:10,left:10},{bottom:10,right:10}].map((pos,i) => (
                <div key={i} style={{
                  position:'absolute',
                  top:('top' in pos)?pos.top:undefined,
                  bottom:('bottom' in pos)?pos.bottom:undefined,
                  left:('left' in pos)?pos.left:undefined,
                  right:('right' in pos)?pos.right:undefined,
                  width:50, height:50, borderRadius:'50%',
                  background:`radial-gradient(circle,${C.goldLight}18,transparent 70%)`,
                  filter:'blur(8px)',
                  animation:`ambientOrb ${4+i}s ${i*0.8}s ease-in-out infinite`,
                  pointerEvents:'none',
                }}/>
              ))}

              {/* Cabinet interior label */}
              <div style={{textAlign:'center',marginBottom:10,position:'relative',zIndex:1}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:10}}>
                  <div style={{height:1,width:50,background:`linear-gradient(90deg,transparent,${C.goldMid}55)`}}/>
                  <span style={{fontSize:8,color:`${C.goldMid}88`,letterSpacing:5,textTransform:'uppercase',fontWeight:700}}>◆ NEON PALACE ◆</span>
                  <div style={{height:1,width:50,background:`linear-gradient(270deg,transparent,${C.goldMid}55)`}}/>
                </div>
              </div>

              {/* Reel window frame */}
              <div style={{
                border:`2px solid ${C.goldBright}`,
                borderRadius:12,
                padding:3,
                position:'relative',
                boxShadow:[
                  `0 0 0 1px ${C.goldDeep}`,
                  `0 0 0 3px #02000a`,
                  `0 0 0 4px ${C.chrome}33`,
                  `0 0 24px ${C.goldMid}33`,
                  `inset 0 0 24px #00000077`,
                  `inset 0 2px 0 ${C.goldLight}22`,
                ].join(','),
                background:'#010004',
              }}>
                {/* Reel grid */}
                <div style={{display:'flex',gap:3,justifyContent:'center',position:'relative',height:VISIBLE*SYMBOL_H}}>
                  <PaylineOverlay winLines={winData?.winLines??[]} active={showWin}/>
                  {[0,1,2,3,4].map(col => (
                    <div key={col} style={{display:'flex',flexDirection:'column',flexShrink:0}}>
                      <ReelStrip
                        reelSymbols={REEL_SYMBOLS}
                        result={getResult(col)}
                        isSpinning={spinning}
                        stopDelay={(turbo?330:720)+col*(turbo?120:190)}
                        onStopped={() => handleReelStop(col)}
                        winningRows={getWinRows(col)}
                      />
                    </div>
                  ))}
                  {/* Chrome separators between reels */}
                  {[0,1,2,3].map(i => (
                    <div key={`sep-${i}`} style={{
                      position:'absolute',
                      top:0,bottom:0,
                      left:`${(i+1)*103-1.5}px`, // 100px reel + 3px gap
                      width:3,
                      background:'linear-gradient(180deg,#2a3444 0%,#7080a0 15%,#c0d0e4 30%,#e0f0ff 50%,#c0d0e4 70%,#7080a0 85%,#2a3444 100%)',
                      borderRadius:2,
                      boxShadow:'1px 0 3px #00000066,-1px 0 3px #00000066',
                      pointerEvents:'none',
                      zIndex:15,
                    }}/>
                  ))}
                </div>

                {/* Glass overlay — reflection sweep */}
                <div style={{position:'absolute',inset:0,borderRadius:10,pointerEvents:'none',zIndex:25,overflow:'hidden',background:'linear-gradient(160deg,rgba(255,255,255,0.035) 0%,rgba(255,255,255,0.01) 35%,transparent 60%)'}}>
                  <div style={{position:'absolute',top:'-20%',bottom:'-20%',width:50,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.045),transparent)',animation:'glassSheen 12s 5s ease-in-out infinite'}}/>
                </div>
              </div>

              {/* Reel labels */}
              <div style={{display:'flex',gap:3,justifyContent:'center',marginTop:8}}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{width:100,textAlign:'center',fontSize:7,color:`${C.goldMid}55`,letterSpacing:3,textTransform:'uppercase',fontWeight:700}}>Reel {i+1}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── WIN DISPLAY ── */}
          {showWin && winData && winData.payout>0 && (
            <div style={{
              background:'linear-gradient(135deg,#0c001e,#160030)',
              border:`1px solid ${C.goldMid}55`,
              borderRadius:14, padding:'14px 20px',
              boxShadow:`0 0 28px ${C.goldMid}33, inset 0 1px 0 ${C.goldLight}18`,
              animation:'winAmount 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
                {/* Payout */}
                <div>
                  <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700,marginBottom:4}}>
                    {winData.winTier==='scatter'?'FREE SPINS TRIGGERED':winData.winLines.length>1?`${winData.winLines.length} WINNING LINES`:'WIN'}
                  </div>
                  <div style={{fontSize:'clamp(28px,5vw,50px)',fontWeight:900,color:C.goldBright,textShadow:`0 0 18px ${C.goldMid},0 0 36px ${C.goldDeep}`,lineHeight:1.05}}>
                    +${displayPayout.toFixed(2)}
                  </div>
                  <div style={{display:'flex',gap:20,marginTop:8}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:8,color:C.textFaint,letterSpacing:2,textTransform:'uppercase'}}>BET</div>
                      <div style={{fontSize:13,fontWeight:800,color:C.chrome}}>${bet.toFixed(2)}</div>
                    </div>
                    <div style={{width:1,background:C.cardBorder}}/>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:8,color:C.textFaint,letterSpacing:2,textTransform:'uppercase'}}>MULT</div>
                      <div style={{fontSize:13,fontWeight:800,color:C.teal}}>x{multiplier.toFixed(1)}</div>
                    </div>
                    <div style={{width:1,background:C.cardBorder}}/>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:8,color:C.textFaint,letterSpacing:2,textTransform:'uppercase'}}>PAYOUT</div>
                      <div style={{fontSize:13,fontWeight:800,color:C.goldBright}}>${winData.payout.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                {/* Line details */}
                {winData.winDetails.length>0 && (
                  <div style={{display:'flex',flexDirection:'column',gap:5,minWidth:140}}>
                    {winData.winDetails.slice(0,3).map((d,i) => (
                      <div key={i} style={{
                        display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,
                        padding:'4px 8px',borderRadius:7,
                        background:'#ffffff06',
                        animation:`winLineDetail 0.3s ${i*0.08}s ease both`,
                        fontSize:12,
                      }}>
                        <span style={{color:C.textDim,fontWeight:600}}>{d.symbol} ×{d.count}</span>
                        <span style={{color:C.goldBright,fontWeight:800}}>+${d.payout.toFixed(2)}</span>
                      </div>
                    ))}
                    {winData.winDetails.length>3 && (
                      <div style={{fontSize:10,color:C.textFaint,textAlign:'right',letterSpacing:1}}>+{winData.winDetails.length-3} more</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CONTROL PANEL ── */}
          <div style={{
            background:'linear-gradient(180deg,#0e001e,#06000e)',
            border:`1px solid ${C.cardBorder}`,
            borderRadius:16, padding:'14px 18px',
            boxShadow:`0 -2px 20px #00000055, inset 0 1px 0 ${C.goldLight}0a`,
          }}>
            {/* Bet row + aux controls */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8,flexWrap:'wrap'}}>
              {/* Bet selector */}
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Bet</span>
                <button
                  onClick={() => { initSound(); soundEngine.playButtonClick(); const ni=Math.max(0,betIdx-1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }}
                  disabled={spinning}
                  style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.cardBorder}`,background:'linear-gradient(180deg,#0e001e,#08000e)',color:C.chrome,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.4:1,boxShadow:'inset 0 2px 4px #00000066'}}>−</button>
                <div style={{
                  background:'linear-gradient(180deg,#060010,#0a0018)',
                  border:`1px solid ${C.goldMid}55`,
                  borderRadius:9, padding:'4px 14px',
                  minWidth:78, textAlign:'center',
                  color:C.goldBright, fontWeight:900, fontSize:17,
                  textShadow:`0 0 8px ${C.goldMid}66`,
                  boxShadow:`inset 0 2px 4px #00000066, 0 0 8px ${C.goldMid}18`,
                }}>
                  ${bet.toFixed(2)}
                </div>
                <button
                  onClick={() => { initSound(); soundEngine.playButtonClick(); const ni=Math.min(BET_OPTIONS.length-1,betIdx+1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }}
                  disabled={spinning}
                  style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.cardBorder}`,background:'linear-gradient(180deg,#0e001e,#08000e)',color:C.chrome,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.4:1,boxShadow:'inset 0 2px 4px #00000066'}}>+</button>
                {/* Lines info */}
                <div style={{marginLeft:4,padding:'4px 10px',borderRadius:7,background:'#ffffff06',border:`1px solid ${C.cardBorder}`,fontSize:10,color:C.textDim,fontWeight:700,letterSpacing:1,whiteSpace:'nowrap'}}>
                  20 LINES
                </div>
              </div>

              {/* Aux buttons — disabled while spinning */}
              <div style={{display:'flex',gap:6}}>
                <button
                  onClick={() => { initSound(); soundEngine.playButtonClick(); if (!spinning) { setAutoSpin(a => { const n=!a; autoRef.current=n; return n; }); } }}
                  disabled={spinning}
                  style={{
                    padding:'6px 14px', borderRadius:9,
                    border:`1px solid ${autoSpin&&!spinning?C.teal:C.cardBorder}`,
                    background:autoSpin&&!spinning?`${C.teal}1a`:C.card,
                    color:autoSpin&&!spinning?C.teal:C.textDim,
                    cursor:spinning?'not-allowed':'pointer', fontSize:10, fontWeight:700,
                    letterSpacing:1, textTransform:'uppercase', transition:'all 0.2s',
                    opacity:spinning?.5:1,
                  }}>
                  {autoSpin?'Stop Auto':'Auto'}
                </button>
                <button
                  onClick={() => { initSound(); soundEngine.playButtonClick(); setTurbo(t=>!t); }}
                  style={{
                    padding:'6px 14px', borderRadius:9,
                    border:`1px solid ${turbo?C.magenta:C.cardBorder}`,
                    background:turbo?`${C.magenta}1a`:C.card,
                    color:turbo?C.magenta:C.textDim,
                    cursor:'pointer', fontSize:10, fontWeight:700,
                    letterSpacing:1, textTransform:'uppercase', transition:'all 0.2s',
                  }}>Turbo</button>
              </div>
            </div>

            {/* PREMIUM SPIN BUTTON */}
            <button
              onClick={() => { initSound(); if (!spinRef.current) effectiveSpin(); }}
              disabled={spinning}
              style={{
                width:'100%', height:68, borderRadius:14,
                background: spinning
                  ? 'linear-gradient(180deg,#0e001e,#180030)'
                  : 'linear-gradient(180deg,#ffe066 0%,#f4c430 28%,#d4a030 55%,#9a6e10 80%,#7a5008 100%)',
                border: spinning ? `2px solid ${C.cardBorder}` : `2px solid ${C.goldLight}`,
                color: spinning ? C.textDim : '#02000a',
                fontSize:'clamp(16px,2.5vw,22px)', fontWeight:900,
                cursor: spinning ? 'not-allowed' : 'pointer',
                letterSpacing:6, textTransform:'uppercase',
                transition:'background 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.08s',
                boxShadow: spinning
                  ? `inset 0 2px 8px #00000088`
                  : [
                      '0 7px 0 #5a3206',
                      '0 10px 24px #000000aa',
                      'inset 0 2px 0 #ffe06666',
                      'inset 0 -3px 0 #00000033',
                    ].join(','),
                animation: spinning ? 'none' : 'spinButtonIdle 2.5s ease-in-out infinite',
                transform: spinning ? 'translateY(3px)' : 'translateY(0)',
                position:'relative', overflow:'hidden',
              }}>
              {/* Button shine */}
              {!spinning && <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0) 50%)',borderRadius:12,pointerEvents:'none'}}/>}
              {spinning ? (
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,position:'relative'}}>
                  <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite'}}>◈</span>
                  SPINNING
                  <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite reverse'}}>◈</span>
                </span>
              ) : (
                <span style={{position:'relative'}}>
                  {freeSpins>0 ? `FREE SPIN (${freeSpins})` : balance<bet ? 'INSUFFICIENT FUNDS' : 'SPIN'}
                </span>
              )}
            </button>
          </div>

          {/* ── INFO / HISTORY ── */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button
              onClick={() => { initSound(); soundEngine.playButtonClick(); setShowPaytable(p=>!p); }}
              style={{
                flex:1,minWidth:110,padding:'7px 10px',borderRadius:10,
                background:showPaytable?`${C.goldMid}18`:C.card,
                border:`1px solid ${showPaytable?C.goldMid:C.cardBorder}`,
                color:showPaytable?C.goldBright:C.textDim,
                cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase',
                transition:'all 0.2s',
              }}>Paytable</button>
            <div style={{flex:1,minWidth:110,padding:'7px 10px',borderRadius:10,background:C.card,border:`1px solid ${C.cardBorder}`,color:C.textDim,fontSize:10,fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
              <span style={{color:C.teal}}>◆</span><span>{winCount} wins</span><span style={{color:C.goldMid}}>◆</span><span>20 lines</span>
            </div>
            <div style={{flex:2,minWidth:190,borderRadius:10,overflow:'hidden',background:C.card,border:`1px solid ${C.cardBorder}`}}>
              <div style={{padding:'3px 10px',background:'#0a0018',borderBottom:`1px solid ${C.cardBorder}`,fontSize:8,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Last Spins</div>
              <div style={{display:'flex',gap:2,padding:'4px 6px',overflowX:'auto'}}>
                {history.slice(0,8).map((h,i) => (
                  <div key={i} style={{
                    flex:'0 0 auto',width:26,height:26,borderRadius:5,
                    background:h.payout>0?(h.tier==='mega'||h.tier==='big'?`${C.goldMid}28`:h.tier==='medium'?`${C.teal}1a`:'#ffffff0a'):'#ff206810',
                    border:`1px solid ${h.payout>0?(h.tier==='mega'||h.tier==='big'?C.goldMid:h.tier==='medium'?C.teal:'#ffffff22'):'#ff206833'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:8,fontWeight:700,
                    color:h.payout>0?(h.tier==='mega'||h.tier==='big'?C.goldBright:h.tier==='medium'?C.teal:C.textDim):'#ff2068',
                    animation:'historySlide 0.3s ease both',
                  }}>
                    {h.payout>0?`x${(h.payout/h.bet).toFixed(0)}`:'—'}
                  </div>
                ))}
                {history.length===0 && <span style={{fontSize:10,color:C.textDim,padding:'4px 6px',opacity:0.4}}>No spins yet</span>}
              </div>
            </div>
          </div>

          {/* ── PAYTABLE ── */}
          {showPaytable && (
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:16,padding:16,animation:'fadeInUp 0.3s ease both'}}>
              <div style={{fontSize:11,fontWeight:800,color:C.goldBright,textTransform:'uppercase',letterSpacing:3,marginBottom:12,textAlign:'center',textShadow:`0 0 8px ${C.goldMid}55`}}>Paytable — Neon Palace</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:5}}>
                {SYMBOLS.map(sym => (
                  <div key={sym.id} style={{display:'flex',alignItems:'center',gap:8,background:C.surface,borderRadius:9,padding:'5px 10px',border:`1px solid ${sym.color}22`}}>
                    <SymbolArt id={sym.id} size={38}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:800,color:sym.color}}>{sym.name}</div>
                      <div style={{fontSize:9,color:C.textDim}}>{sym.payouts.map((p,i)=>p>0?`${i+1}×${p}`:null).filter(Boolean).join(' | ')}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,padding:'7px 12px',background:'#0a0014',borderRadius:9,border:`1px solid ${C.teal}22`,textAlign:'center'}}>
                <span style={{fontSize:10,color:C.teal,fontWeight:700}}>3+ SCATTER = 8 FREE SPINS • WILD substitutes all symbols</span>
              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div style={{textAlign:'center',paddingTop:6}}>
            <div style={{fontSize:8,color:`${C.textDim}55`,letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>
              RTP 96.2% • Social Casino — No Real Money Gambling • Min $0.20 Max $50.00
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
