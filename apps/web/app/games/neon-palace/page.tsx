'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0010', surface: '#160825', card: '#1e0c35', cardBorder: '#3a1a6e',
  gold: '#f4c430', goldGlow: '#ffdd00', teal: '#00d4c8', magenta: '#ff2d78',
  purple: '#7c3aed', text: '#f0e8ff', textDim: '#9d8ec0', silver: '#c0c8d8',
  electric: '#00aaff', green: '#00ff88', reelBg: '#0d0520', reelBorder: '#4a1f8a',
  btnGrad: 'linear-gradient(135deg, #f4c430 0%, #ff8c00 50%, #f4c430 100%)',
  darkPurple: '#110020',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0010; font-family: 'Outfit', sans-serif; }

@keyframes symbolGlow {
  0%,100% { filter: drop-shadow(0 0 6px currentColor) brightness(1); }
  50%      { filter: drop-shadow(0 0 20px currentColor) brightness(1.6); }
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
  0%,100% { box-shadow: 0 0 20px #f4c430aa, 0 0 40px #ff8c0066, inset 0 0 20px #f4c43022; }
  50%     { box-shadow: 0 0 40px #f4c430ff, 0 0 80px #ff8c00aa, inset 0 0 30px #f4c43044; }
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
  0%,100% { filter: drop-shadow(0 0 8px #00d4c8) drop-shadow(0 0 16px #ff2d78); }
  50%      { filter: drop-shadow(0 0 20px #00d4c8) drop-shadow(0 0 40px #ff2d78) brightness(1.4); }
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
  10% { transform: translate(-6px,-2px) rotate(-0.5deg); }
  20% { transform: translate(6px,2px) rotate(0.5deg); }
  40% { transform: translate(4px,1px) rotate(0.3deg); }
  60% { transform: translate(-3px,0) rotate(-0.2deg); }
  80% { transform: translate(2px,1px); }
}
@keyframes columnGlow {
  0%,100% { box-shadow: inset 0 0 30px #7c3aed44, 0 0 20px #7c3aed33; }
  50%      { box-shadow: inset 0 0 50px #7c3aed88, 0 0 40px #7c3aed66; }
}
@keyframes orbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-15px) scale(1.05); }
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
  { id:'WILD',     name:'Wild Crown',  weight:2,  payouts:[0,0,50,500,5000], color:'#f4c430', glow:'#ffdd00', tier:5 },
  { id:'SCATTER',  name:'Eye of Gods', weight:3,  payouts:[0,0,12,30,100],   color:'#00d4c8', glow:'#ff2d78', tier:5 },
  { id:'ZEUS',     name:'Zeus',        weight:6,  payouts:[0,0,20,100,1000], color:'#00aaff', glow:'#00ddff', tier:4 },
  { id:'ATHENA',   name:'Athena',      weight:8,  payouts:[0,0,15,75,750],   color:'#c084fc', glow:'#a855f7', tier:4 },
  { id:'POSEIDON', name:'Poseidon',    weight:8,  payouts:[0,0,10,50,500],   color:'#22d3ee', glow:'#0ea5e9', tier:4 },
  { id:'ACE',      name:'Ace',         weight:12, payouts:[0,0,5,20,200],    color:'#f4c430', glow:'#fbbf24', tier:3 },
  { id:'KING',     name:'King',        weight:12, payouts:[0,0,4,15,150],    color:'#a78bfa', glow:'#7c3aed', tier:3 },
  { id:'QUEEN',    name:'Queen',       weight:14, payouts:[0,0,3,10,100],    color:'#2dd4bf', glow:'#14b8a6', tier:2 },
  { id:'JACK',     name:'Jack',        weight:15, payouts:[0,0,2,8,75],      color:'#f472b6', glow:'#ec4899', tier:2 },
  { id:'TEN',      name:'Ten',         weight:20, payouts:[0,0,1,5,50],      color:'#94a3b8', glow:'#64748b', tier:1 },
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
  if (scatCount >= 3) payout += bet * (scatCount === 3 ? 12 : scatCount === 4 ? 30 : 100);
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
    const freqs = [800, 900, 1000, 1100, 1200];
    this.osc('triangle', freqs[idx]!, t, 0.05, 0.25);
    this.osc('sine', freqs[idx]! * 1.5, t + 0.02, 0.04, 0.1);
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
function SymbolArt({ id, size = 90, glowing = false }: { id: string; size?: number; glowing?: boolean }) {
  const sym = SYMBOLS.find(s => s.id === id) ?? SYMBOLS[0]!;
  const gStyle: React.CSSProperties = glowing ? { animation: 'symbolGlow 0.8s ease-in-out infinite', color: sym.color } : {};
  const s = size;
  const wrap: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: s, height: s, ...gStyle };

  if (id === 'WILD') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4c430"/><stop offset="100%" stopColor="#ff8c00"/>
          </linearGradient>
          <filter id="fwg"><feGaussianBlur stdDeviation="1.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        </defs>
        <polygon points="45,4 55,30 82,30 60,48 68,75 45,58 22,75 30,48 8,30 35,30" fill="url(#wg)" filter="url(#fwg)"/>
        <polygon points="45,14 52,33 72,33 57,46 62,67 45,54 28,67 33,46 18,33 38,33" fill="#fff7"/>
        <line x1="45" y1="20" x2="45" y2="70" stroke="#ffdd00" strokeWidth="2" strokeDasharray="4,3" opacity="0.8"/>
        <line x1="20" y1="45" x2="70" y2="45" stroke="#ffdd00" strokeWidth="2" strokeDasharray="4,3" opacity="0.8"/>
        <circle cx="45" cy="45" r="8" fill="#fff" opacity="0.9"/>
        <text x="45" y="50" textAnchor="middle" fontSize="10" fontWeight="900" fill="#f4c430" fontFamily="Outfit,sans-serif">W</text>
      </svg>
    </div>
  );

  if (id === 'SCATTER') return (
    <div style={{ ...wrap, animation: glowing ? 'scatterPulse 1s ease-in-out infinite' : 'none' }}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs>
          <linearGradient id="scg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00d4c8"/><stop offset="100%" stopColor="#ff2d78"/>
          </linearGradient>
        </defs>
        <polygon points="45,5 85,80 5,80" fill="none" stroke="url(#scg)" strokeWidth="3"/>
        <polygon points="45,18 76,72 14,72" fill="#ff2d7822"/>
        <ellipse cx="45" cy="38" rx="12" ry="14" fill="url(#scg)" opacity="0.9"/>
        <ellipse cx="45" cy="38" rx="6" ry="7" fill="#0d0520"/>
        <ellipse cx="45" cy="38" rx="3" ry="3.5" fill="#00d4c8"/>
        <circle cx="42" cy="36" r="1.5" fill="#fff" opacity="0.8"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, idx) => (
          <line key={idx} x1="45" y1="5" x2={45 + Math.cos(a * Math.PI / 180) * 8} y2={5 + Math.sin(a * Math.PI / 180) * 8} stroke="#ff2d78" strokeWidth="1" opacity="0.5"/>
        ))}
      </svg>
    </div>
  );

  if (id === 'ZEUS') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="zg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00aaff"/><stop offset="50%" stopColor="#f4c430"/><stop offset="100%" stopColor="#00aaff"/></linearGradient></defs>
        <polygon points="50,5 58,35 80,20 55,45 75,50 45,85 40,55 15,65 42,40 20,38 48,20 35,30" fill="url(#zg)" opacity="0.95"/>
        <polygon points="50,15 56,36 72,25 53,44 68,48 45,75 41,52 22,60 44,41 26,39 47,25 38,32" fill="#fff6"/>
        {[0,1,2].map(i => (<line key={i} x1={30 + i * 5} y1={55 + i * 8} x2={55 + i * 3} y2={35 + i * 5} stroke="#00ddff" strokeWidth="1" opacity={0.5 - i * 0.15}/>))}
      </svg>
    </div>
  );

  if (id === 'ATHENA') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
        <ellipse cx="45" cy="50" rx="28" ry="32" fill="url(#ag)" opacity="0.9"/>
        <ellipse cx="45" cy="45" rx="20" ry="25" fill="#1e0c35" opacity="0.6"/>
        <path d="M20,25 Q45,5 70,25 Q60,15 45,18 Q30,15 20,25Z" fill="url(#ag)"/>
        <ellipse cx="35" cy="45" rx="9" ry="10" fill="#a855f7"/>
        <ellipse cx="55" cy="45" rx="9" ry="10" fill="#a855f7"/>
        <ellipse cx="35" cy="45" rx="5" ry="5" fill="#1e0c35"/>
        <ellipse cx="55" cy="45" rx="5" ry="5" fill="#1e0c35"/>
        <circle cx="33" cy="43" r="2" fill="#c084fc" opacity="0.9"/>
        <circle cx="53" cy="43" r="2" fill="#c084fc" opacity="0.9"/>
        <path d="M38,62 Q45,68 52,62" stroke="#c084fc" strokeWidth="2" fill="none"/>
        <line x1="45" y1="72" x2="45" y2="85" stroke="#7c3aed" strokeWidth="3"/>
      </svg>
    </div>
  );

  if (id === 'POSEIDON') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient></defs>
        <line x1="45" y1="5" x2="45" y2="75" stroke="url(#pg)" strokeWidth="5" strokeLinecap="round"/>
        <line x1="45" y1="5" x2="25" y2="28" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round"/>
        <line x1="45" y1="5" x2="65" y2="28" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round"/>
        <line x1="45" y1="18" x2="32" y2="35" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="45" y1="18" x2="58" y2="35" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round"/>
        {([[35,65],[42,72],[52,68],[38,80],[55,75],[45,82]] as [number,number][]).map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="4" ry="6" fill="#22d3ee" opacity={0.6+i*0.05}/>
        ))}
        <path d="M15,78 Q25,70 35,78 Q45,86 55,78 Q65,70 75,78" stroke="#0ea5e9" strokeWidth="2.5" fill="none"/>
      </svg>
    </div>
  );

  if (id === 'ACE') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="acg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4c430"/><stop offset="100%" stopColor="#b45309"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#acg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#acg)" strokeWidth="2.5"/>
        <text x="45" y="62" textAnchor="middle" fontSize="55" fontWeight="900" fill="url(#acg)" fontFamily="Outfit,sans-serif" letterSpacing="-2">A</text>
      </svg>
    </div>
  );

  if (id === 'KING') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#5b21b6"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#kg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#kg)" strokeWidth="2.5"/>
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#kg)" fontFamily="Outfit,sans-serif">K</text>
      </svg>
    </div>
  );

  if (id === 'QUEEN') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="qg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#qg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#qg)" strokeWidth="2.5"/>
        {([[18,18],[72,18],[18,72],[72,72],[45,8]] as [number,number][]).map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="4" fill={(['#f472b6','#a78bfa','#f4c430','#22d3ee','#ff2d78'])[i]}/>
        ))}
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#qg)" fontFamily="Outfit,sans-serif">Q</text>
      </svg>
    </div>
  );

  if (id === 'JACK') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="jg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#be185d"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#jg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#jg)" strokeWidth="2.5"/>
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#jg)" fontFamily="Outfit,sans-serif">J</text>
      </svg>
    </div>
  );

  if (id === 'TEN') return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#tg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#tg)" strokeWidth="2.5"/>
        <text x="45" y="62" textAnchor="middle" fontSize="46" fontWeight="900" fill="url(#tg)" fontFamily="Outfit,sans-serif">10</text>
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
    const count = tier==='mega'?200:tier==='big'?120:tier==='medium'?60:30;
    const colors = tier==='mega'?['#f4c430','#ffdd00','#ff8c00','#ff2d78','#00d4c8']:tier==='big'?['#f4c430','#ffdd00','#ff8c00','#fbbf24']:tier==='medium'?['#00d4c8','#2dd4bf','#a78bfa']:['#fff','#f0e8ff','#c0c8d8'];
    const shapes = ['circle','square','star'];
    setParticles(Array.from({length:count},(_,) => {
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
        return <div key={p.id} style={{position:'absolute',left:p.x,top:p.y,width:sz,height:sz,opacity:p.life,transform:`rotate(${p.rot}deg) translate(-50%,-50%)`,background:p.shape==='circle'?`radial-gradient(circle,${p.color},transparent)`:p.color,borderRadius:p.shape==='circle'?'50%':'4px',boxShadow:`0 0 ${sz*1.5}px ${p.color}88`}}/>;
      })}
    </div>
  );
}

/* ─── REEL STRIP ─────────────────────────────────────────────────────────────── */
const PRE_LEN = 28;    // random symbols before the result window
const SYMBOL_H = 100;
const VISIBLE = 3;
const FINAL_Y = -(PRE_LEN * SYMBOL_H);           // -2800: where result is visible
const SNAP_Y  = -(PRE_LEN - 5) * SYMBOL_H;       // -2300: snap point before deceleration
const LOOP_PT =  -(PRE_LEN - 6) * SYMBOL_H;      // -2200: RAF wraps here, never reaches result

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

  // Rebuild strip whenever result changes — random pre-section + result at tail
  const strip = useMemo(() => {
    const pre = Array.from({ length: PRE_LEN }, () =>
      reelSymbols[Math.floor(Math.random() * reelSymbols.length)]!
    );
    return [...pre, ...result];
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
    applyPos(0, 'none', 'blur(3px) brightness(1.15)');

    const SPEED = 18; // px per animation frame

    const tick = () => {
      if (phaseRef.current !== 'spinning') return;
      const next = posRef.current - SPEED;
      // Loop within the pre-spin zone; never reach FINAL_Y during fast spin
      applyPos(next < LOOP_PT ? next - LOOP_PT : next, 'none');
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      phaseRef.current = 'landing';
      cancelAnimationFrame(rafRef.current);

      // Invisible snap (still blurred) to a position 5 symbols above result
      applyPos(SNAP_Y, 'none', 'blur(2px) brightness(1.1)');

      // Two rAF to flush snap before starting transition
      requestAnimationFrame(() => requestAnimationFrame(() => {
        applyPos(FINAL_Y,
          'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.32s ease-out',
          'none'
        );

        setTimeout(() => {
          // Small overshoot bounce
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
      background:`linear-gradient(180deg,${C.reelBg} 0%,#130a2a 50%,${C.reelBg} 100%)`,
      borderRadius:8,
      boxShadow:'inset 0 0 30px #00000088, inset 0 2px 0 #7c3aed44, inset 0 -2px 0 #7c3aed44',
    }}>
      {/* shadow masks for depth */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:32,background:'linear-gradient(180deg,#0a001099,transparent)',zIndex:10,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:32,background:'linear-gradient(0deg,#0a001099,transparent)',zIndex:10,pointerEvents:'none'}}/>

      <div ref={stripRef} style={{willChange:'transform', transform:`translateY(${FINAL_Y}px)`}}>
        {strip.map((symId, i) => {
          const rowInResult = i - PRE_LEN;
          const isWin = landed && rowInResult >= 0 && rowInResult < VISIBLE && winningRows.includes(rowInResult);
          return (
            <div key={i} style={{
              width:100, height:SYMBOL_H,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderBottom:`1px solid ${C.reelBorder}22`,
              background: isWin ? `radial-gradient(ellipse at center,${SYMBOLS.find(s=>s.id===symId)?.glow??'#f4c430'}22,transparent 70%)` : 'transparent',
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
  if (!active || winLines.length === 0) return null;
  const W = 520, CW = 100, SPACE = 4, REEL_W = CW + SPACE;
  const colors = ['#f4c430','#00d4c8','#ff2d78','#a78bfa','#00ff88','#ff8c00','#22d3ee','#f472b6'];
  return (
    <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:20,width:'100%',height:'100%'}} viewBox={`0 0 ${W} 300`}>
      {winLines.slice(0, 5).map((li, idx) => {
        const line = PAYLINES[li]!;
        const pts = line.map((row, col) => `${col*REEL_W+CW/2},${row*CW+CW/2}`).join(' ');
        return (
          <polyline key={li} points={pts} fill="none" stroke={colors[idx % colors.length]} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
            strokeDasharray="800" strokeDashoffset="800"
            style={{animation:`paylineTrace 0.6s ${idx*0.12}s ease-out forwards`}}/>
        );
      })}
    </svg>
  );
}

/* ─── STAR FIELD ─────────────────────────────────────────────────────────────── */
function StarField() {
  const stars = useMemo(() => Array.from({length:80},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:0.5+Math.random()*2.5, dur:8+Math.random()*20, delay:-Math.random()*20,
    sx:`${(Math.random()-0.5)*60}px`, so:0.2+Math.random()*0.8,
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
  mega:    { label:'MEGA WIN',  grad:'linear-gradient(135deg,#ff2d78,#f4c430,#00d4c8,#ff2d78)', glow:'#ff2d78', bg:'radial-gradient(ellipse at center,#2d0050dd,#0a001099)' },
  epic:    { label:'EPIC WIN',  grad:'linear-gradient(135deg,#a855f7,#f4c430,#00d4c8,#a855f7)', glow:'#a855f7', bg:'radial-gradient(ellipse at center,#1a0040dd,#0a001099)' },
  big:     { label:'BIG WIN',   grad:'linear-gradient(135deg,#f4c430,#ffdd00,#ff8c00,#f4c430)', glow:'#f4c430', bg:'radial-gradient(ellipse at center,#1a0035cc,#0a001099)' },
  jackpot: { label:'JACKPOT!',  grad:'linear-gradient(135deg,#ff2d78,#f4c430,#00d4c8,#ff2d78)', glow:'#ffdd00', bg:'radial-gradient(ellipse at center,#3d0070ee,#0a001099)' },
};
function BigWinOverlay({ tier, amount, onClose }: { tier:string; amount:number; onClose:()=>void }) {
  const cfg = WIN_TIER_CFG[tier] ?? WIN_TIER_CFG['big']!;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:cfg.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(4px)'}}>
      <div style={{fontSize:'clamp(36px,7vw,82px)',fontWeight:900,fontFamily:'Outfit,sans-serif',background:cfg.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200% 200%',animation:'bigWinText 0.8s cubic-bezier(0.34,1.56,0.64,1) both, logoShimmer 2s linear infinite',textAlign:'center',filter:`drop-shadow(0 0 30px ${cfg.glow})`}}>
        {cfg.label}
      </div>
      <div style={{fontSize:'clamp(24px,5vw,60px)',fontWeight:900,fontFamily:'Outfit,sans-serif',color:'#f4c430',marginTop:16,animation:'winAmount 0.6s 0.4s both',textShadow:`0 0 30px #f4c430, 0 0 60px ${cfg.glow}`}}>
        +{amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
      </div>
      <div style={{color:C.textDim,marginTop:24,fontSize:14,fontFamily:'Outfit,sans-serif'}}>Tap to continue</div>
    </div>
  );
}

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────── */
const BET_OPTIONS = [0.20,0.50,1,2,5,10,20,50];
const soundEngine = new SoundEngine();

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function NeonPalacePage() {
  const [balance, setBalance]       = useState(1000);
  const [bet, setBet]               = useState(1);
  const [betIdx, setBetIdx]         = useState(2);
  const [spinning, setSpinning]     = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['ACE','KING','QUEEN'],['ZEUS','POSEIDON','ATHENA'],['KING','ACE','JACK'],
    ['QUEEN','TEN','KING'],['JACK','ACE','POSEIDON'],
  ]);
  const [winData, setWinData]       = useState<{payout:number;winLines:number[];winTier:string}|null>(null);
  const [showWin, setShowWin]       = useState(false);
  const [displayPayout, setDisplayPayout] = useState(0);
  const [particles, setParticles]   = useState(false);
  const [bigWin, setBigWin]         = useState(false);
  const [freeSpins, setFreeSpins]   = useState(0);
  const [jackpot, setJackpot]       = useState(47382.50);
  const [volume, setVolume]         = useState(0.6);
  const [showVolume, setShowVolume] = useState(false);
  const [autoSpin, setAutoSpin]     = useState(false);
  const [turbo, setTurbo]           = useState(false);
  const [history, setHistory]       = useState<{payout:number;tier:string;bet:number}[]>([]);
  const [winCount, setWinCount]     = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const [pendingResult, setPendingResult] = useState<string[][]|null>(null);
  const [apiMode, setApiMode]       = useState(false);

  // Refs for callbacks — avoids stale closures
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

  // Keep refs in sync with state
  useEffect(() => { betRef.current = bet; },           [bet]);
  useEffect(() => { balanceRef.current = balance; },   [balance]);
  useEffect(() => { turboRef.current = turbo; },       [turbo]);
  useEffect(() => { freeSpinsRef.current = freeSpins; },[freeSpins]);
  useEffect(() => { autoRef.current = autoSpin; },     [autoSpin]);
  useEffect(() => { soundEngine.setVolume(volume); },  [volume]);

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
        const jackpotHit = isJackpot(grid);
        const winTier    = jackpotHit ? 'jackpot' : serverWinTier(res.totalPayout, betRef.current);
        const payout     = jackpotHit ? jackpot : res.totalPayout;
        pendingResultRef.current = grid;
        setPendingResult(grid);
        pendingServerWin.current = {
          payout: isFree ? payout + betRef.current : payout,
          winLines: res.paylineWins.map(w => w.paylineIndex),
          winTier,
          freeSpins: res.freeSpinsAwarded,
        };
        if (jackpotHit) setJackpot(2500);
      } catch { /* use local result */ }
    }
  }, [initSound, apiMode, jackpot]);

  // Keep a stable ref to handleSpin so auto-spin can call the latest version
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

  const getResult    = (col: number) => (pendingResult ?? reelResults)[col]!;
  const getWinRows   = (col: number): number[] => {
    if (!winData || !showWin) return [];
    return [...new Set(winData.winLines.map(li => PAYLINES[li]![col]!))];
  };

  const isFreeSpinBg = freeSpins > 0;
  const isBigWin     = bigWin && winData && ['big','epic','mega','jackpot'].includes(winData.winTier);

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
          ? 'linear-gradient(135deg,#1a0d00,#0d1a00,#001a1a,#1a0d00)'
          : 'radial-gradient(ellipse at 50% 0%,#2a0060 0%,#0a0010 60%)',
        backgroundSize: isFreeSpinBg ? '400% 400%' : 'auto',
        animation: isFreeSpinBg
          ? 'freeSpinBg 3s ease infinite'
          : (isBigWin ? 'screenShake 0.6s ease-out' : 'none'),
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'12px 16px 24px', gap:12,
        fontFamily:'Outfit,sans-serif',
      }}>

        {/* HEADER */}
        <div style={{width:'100%',maxWidth:800,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
          <div style={{lineHeight:1}}>
            <span style={{fontSize:'clamp(18px,3vw,28px)',fontWeight:900,background:'linear-gradient(90deg,#f4c430,#ffdd00,#ff8c00,#f4c430)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'logoShimmer 3s linear infinite',letterSpacing:1,display:'block'}}>NEON PALACE</span>
            <span style={{fontSize:'clamp(8px,1.5vw,11px)',color:C.textDim,letterSpacing:3,textTransform:'uppercase',fontWeight:600}}>Gods of Fortune</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:'6px 16px',textAlign:'center'}}>
              <div style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:600}}>Balance</div>
              <div style={{fontSize:22,fontWeight:900,color:C.gold,lineHeight:1.1,textShadow:`0 0 10px ${C.gold}88`}}>${balance.toFixed(2)}</div>
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
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => { const v = parseFloat(e.target.value); setVolume(v); soundEngine.setVolume(v); }} style={{width:120,accentColor:C.gold}}/>
          </div>
        )}

        {/* JACKPOT */}
        <div style={{width:'100%',maxWidth:800,background:`linear-gradient(135deg,${C.card},#2d0a50)`,border:'1px solid #7c3aed66',borderRadius:14,padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 0 30px #7c3aed33'}}>
          <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Progressive Jackpot</span>
          <span style={{fontSize:'clamp(20px,3.5vw,32px)',fontWeight:900,color:C.gold,textShadow:`0 0 20px ${C.gold}, 0 0 40px #ff8c00`,animation:'jackpotTick 2s ease-in-out infinite',fontVariantNumeric:'tabular-nums'}}>
            ${jackpot.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </span>
          <div style={{display:'flex',gap:6}}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<3?C.gold:'#3a1a6e',boxShadow:i<3?`0 0 8px ${C.gold}`:'none'}}/>
            ))}
          </div>
        </div>

        {freeSpins > 0 && (
          <div style={{background:'linear-gradient(135deg,#f4c430,#ff8c00)',borderRadius:20,padding:'6px 20px',fontSize:14,fontWeight:800,color:'#0a0010',boxShadow:`0 0 20px ${C.gold}aa`,animation:'wiggle 0.5s ease-in-out infinite'}}>
            FREE SPINS: {freeSpins} REMAINING
          </div>
        )}

        {/* REEL CABINET */}
        <div className="np-reel-outer" style={{width:'100%',maxWidth:800,position:'relative'}}>
          {/* Outer cabinet frame */}
          <div style={{
            background:'linear-gradient(180deg,#2a0060,#1a0040)',
            border:`2px solid ${C.reelBorder}`,borderRadius:16,
            padding:'16px 12px',
            boxShadow:`0 0 50px #7c3aed44, inset 0 0 40px #00000088`,
            position:'relative',overflow:'hidden',
          }}>
            {/* Gold corner ornaments */}
            {[0,1,2,3].map(i => (
              <div key={i} style={{position:'absolute',top:i<2?8:'auto',bottom:i>=2?8:'auto',left:i%2===0?8:'auto',right:i%2===1?8:'auto',width:20,height:20,borderTop:i<2?`2px solid ${C.gold}`:'none',borderBottom:i>=2?`2px solid ${C.gold}`:'none',borderLeft:i%2===0?`2px solid ${C.gold}`:'none',borderRight:i%2===1?`2px solid ${C.gold}`:'none'}}/>
            ))}

            {/* Gold reel window frame */}
            <div style={{
              border:`3px solid ${C.gold}`,
              borderRadius:12,
              padding:2,
              boxShadow:`0 0 20px ${C.gold}44, inset 0 0 20px #00000066`,
              position:'relative',
            }}>
              <div style={{display:'flex',gap:4,justifyContent:'center',position:'relative',height:VISIBLE*SYMBOL_H}}>
                <PaylineOverlay winLines={winData?.winLines ?? []} active={showWin}/>
                {[0,1,2,3,4].map(col => (
                  <div key={col} style={{display:'flex',flexDirection:'column',border:`1px solid ${C.reelBorder}`,borderRadius:10,overflow:'hidden',boxShadow:'0 0 15px #7c3aed22'}}>
                    <ReelStrip
                      reelSymbols={REEL_SYMBOLS}
                      result={getResult(col)}
                      isSpinning={spinning}
                      stopDelay={(turbo?400:800)+col*(turbo?150:220)}
                      onStopped={() => handleReelStop(col)}
                      winningRows={getWinRows(col)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:4,justifyContent:'center',marginTop:6}}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{width:100,textAlign:'center',fontSize:9,color:C.textDim,letterSpacing:2,textTransform:'uppercase'}}>Reel {i+1}</div>
            ))}
          </div>
        </div>

        {/* WIN DISPLAY */}
        {showWin && winData && winData.payout > 0 && (
          <div style={{
            background:`linear-gradient(135deg,${C.card},#3d1060)`,
            border:`1px solid ${C.gold}66`,borderRadius:14,
            padding:'12px 32px',textAlign:'center',
            boxShadow:`0 0 30px ${C.gold}44`,
            animation:'winAmount 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>
              {winData.winTier==='scatter'?'FREE SPINS TRIGGERED!':winData.winLines.length>1?`${winData.winLines.length} WINNING LINES`:'WIN'}
            </div>
            <div style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:900,color:C.gold,textShadow:`0 0 20px ${C.gold}, 0 0 40px #ff8c00`,lineHeight:1.1}}>
              +${displayPayout.toFixed(2)}
            </div>
            {bet > 0 && <div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1}}>x{(winData.payout/bet).toFixed(1)} MULTIPLIER</div>}
          </div>
        )}

        {/* CONTROL PANEL */}
        <div style={{width:'100%',maxWidth:800,background:`linear-gradient(180deg,${C.card},${C.darkPurple})`,border:`1px solid ${C.cardBorder}`,borderRadius:16,padding:'16px 20px',boxShadow:'0 -4px 30px #7c3aed22'}}>
          {/* Bet row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:8,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:600}}>Bet</span>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); const ni = Math.max(0,betIdx-1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1}}>−</button>
              <div style={{background:C.surface,border:`1px solid ${C.gold}66`,borderRadius:10,padding:'4px 16px',minWidth:80,textAlign:'center',color:C.gold,fontWeight:800,fontSize:18,textShadow:`0 0 8px ${C.gold}88`}}>${bet.toFixed(2)}</div>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); const ni = Math.min(BET_OPTIONS.length-1,betIdx+1); setBetIdx(ni); setBet(BET_OPTIONS[ni]!); }} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1}}>+</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); setAutoSpin(a => { const n = !a; autoRef.current = n; return n; }); }}
                style={{padding:'6px 16px',borderRadius:10,border:`1px solid ${autoSpin?C.teal:C.cardBorder}`,background:autoSpin?`${C.teal}22`:C.surface,color:autoSpin?C.teal:C.textDim,cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'}}>
                {autoSpin?'Stop Auto':'Auto'}
              </button>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); setTurbo(t => !t); }}
                style={{padding:'6px 16px',borderRadius:10,border:`1px solid ${turbo?C.magenta:C.cardBorder}`,background:turbo?`${C.magenta}22`:C.surface,color:turbo?C.magenta:C.textDim,cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'}}>Turbo</button>
            </div>
          </div>

          {/* Spin button */}
          <button
            onClick={() => { initSound(); if (!spinRef.current) effectiveSpin(); }}
            disabled={spinning}
            style={{
              width:'100%',height:64,borderRadius:14,
              background: spinning ? 'linear-gradient(135deg,#3a1a6e,#5b21b6)' : C.btnGrad,
              border:`2px solid ${spinning?C.purple:C.gold}`,
              color: spinning ? C.textDim : '#0a0010',
              fontSize:'clamp(18px,3vw,24px)',fontWeight:900,
              cursor: spinning ? 'not-allowed' : 'pointer',
              letterSpacing:4,textTransform:'uppercase',
              animation: spinning ? 'none' : 'spinButtonPulse 2s ease-in-out infinite',
              transition:'background 0.3s, color 0.3s, border-color 0.3s',
              boxShadow: spinning ? 'none' : `0 0 30px ${C.gold}88, 0 4px 20px #00000088`,
            }}>
            {spinning ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite'}}>◈</span>
                SPINNING…
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
            style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:showPaytable?`${C.purple}33`:C.card,border:`1px solid ${showPaytable?C.purple:C.cardBorder}`,color:showPaytable?C.text:C.textDim,cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>Paytable</button>
          <div style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:C.card,border:`1px solid ${C.cardBorder}`,color:C.textDim,fontSize:11,fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span style={{color:C.teal}}>◆</span><span>{winCount} wins</span><span style={{color:C.gold}}>◆</span><span>20 lines</span>
          </div>
          <div style={{flex:2,minWidth:200,borderRadius:10,overflow:'hidden',background:C.card,border:`1px solid ${C.cardBorder}`}}>
            <div style={{padding:'4px 10px',background:'#1a0830',borderBottom:`1px solid ${C.cardBorder}`,fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Last Spins</div>
            <div style={{display:'flex',gap:2,padding:'4px 6px',overflowX:'auto'}}>
              {history.slice(0,8).map((h,i)=>(
                <div key={i} style={{flex:'0 0 auto',width:28,height:28,borderRadius:6,background:h.payout>0?(h.tier==='mega'||h.tier==='big'?`${C.gold}33`:h.tier==='medium'?`${C.teal}22`:'#ffffff11'):'#ff2d7811',border:`1px solid ${h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:'#ffffff44'):'#ff2d7844'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:C.textDim):'#ff2d78',animation:'historySlide 0.3s ease both'}}>
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
            <div style={{fontSize:13,fontWeight:800,color:C.gold,textTransform:'uppercase',letterSpacing:3,marginBottom:12,textAlign:'center',textShadow:`0 0 10px ${C.gold}88`}}>Paytable — Gods of Fortune</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:6}}>
              {SYMBOLS.map(sym=>(
                <div key={sym.id} style={{display:'flex',alignItems:'center',gap:8,background:C.surface,borderRadius:10,padding:'6px 10px',border:`1px solid ${sym.color}33`}}>
                  <SymbolArt id={sym.id} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:sym.color}}>{sym.name}</div>
                    <div style={{fontSize:10,color:C.textDim}}>{sym.payouts.map((p,i)=>p>0?`${i+1}x${p}`:null).filter(Boolean).join(' | ')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:'8px 12px',background:'#0a0020',borderRadius:10,border:`1px solid ${C.teal}33`,textAlign:'center'}}>
              <span style={{fontSize:11,color:C.teal,fontWeight:700}}>3+ SCATTER = 12 FREE SPINS • WILD substitutes all symbols</span>
            </div>
          </div>
        )}

        <div style={{width:'100%',maxWidth:800,textAlign:'center',paddingTop:8}}>
          <div style={{fontSize:9,color:`${C.textDim}88`,letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>
            RTP 96.2% • Min Bet $0.20 • Max Bet $50.00 • Play Responsibly
          </div>
        </div>
      </div>
    </>
  );
}
