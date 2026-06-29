'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0010',
  surface: '#160825',
  card: '#1e0c35',
  cardBorder: '#3a1a6e',
  gold: '#f4c430',
  goldGlow: '#ffdd00',
  teal: '#00d4c8',
  magenta: '#ff2d78',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#9d8ec0',
  silver: '#c0c8d8',
  electric: '#00aaff',
  green: '#00ff88',
  reelBg: '#0d0520',
  reelBorder: '#4a1f8a',
  btnGrad: 'linear-gradient(135deg, #f4c430 0%, #ff8c00 50%, #f4c430 100%)',
  darkPurple: '#110020',
};

/* ─────────────────────────────────────────────────────────────────────────────
   KEYFRAME CSS ANIMATIONS
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0010; font-family: 'Outfit', sans-serif; }

@keyframes reelBlur {
  0%   { filter: blur(0px); }
  20%  { filter: blur(3px) brightness(1.2); }
  80%  { filter: blur(3px) brightness(1.2); }
  100% { filter: blur(0px); }
}
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
@keyframes particleFly {
  0%   { opacity:1; transform: translate(0,0) rotate(0deg) scale(1); }
  100% { opacity:0; transform: translate(var(--px), var(--py)) rotate(var(--pr)) scale(0.2); }
}
@keyframes jackpotTick {
  0%,90%,100% { opacity:1; transform: translateY(0); }
  95%          { opacity:0.5; transform: translateY(-4px); }
}
@keyframes spinButtonPulse {
  0%,100% { box-shadow: 0 0 20px #f4c430aa, 0 0 40px #ff8c0066, inset 0 0 20px #f4c43022; }
  50%     { box-shadow: 0 0 40px #f4c430ff, 0 0 80px #ff8c00aa, inset 0 0 30px #f4c43044; }
}
@keyframes reelBounce {
  0%   { transform: translateY(var(--fy)); }
  60%  { transform: translateY(calc(var(--fy) - 14px)); }
  80%  { transform: translateY(calc(var(--fy) + 6px)); }
  100% { transform: translateY(var(--fy)); }
}
@keyframes paylineTrace {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}
@keyframes starDrift {
  0%   { transform: translateY(0) translateX(0); opacity: var(--so); }
  100% { transform: translateY(-120vh) translateX(var(--sx)); opacity: 0; }
}
@keyframes columnGlow {
  0%,100% { box-shadow: inset 0 0 30px #7c3aed44, 0 0 20px #7c3aed33; }
  50%      { box-shadow: inset 0 0 50px #7c3aed88, 0 0 40px #7c3aed66; }
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
@keyframes glitchShift {
  0%,90%,100% { clip-path: none; transform: none; }
  91% { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
  93% { clip-path: inset(60% 0 20% 0); transform: translateX(4px); }
  95% { clip-path: inset(40% 0 40% 0); transform: translateX(-2px); }
}
@keyframes orbFloat {
  0%,100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-15px) scale(1.05); }
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   SYMBOL DEFINITIONS
───────────────────────────────────────────────────────────────────────────── */
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
const TOTAL_WEIGHT = SYMBOLS.reduce((s,x)=>s+x.weight,0);

/* ─────────────────────────────────────────────────────────────────────────────
   RNG ENGINE
───────────────────────────────────────────────────────────────────────────── */
function cryptoRand(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 0xFFFFFFFF;
}
function weightedRandom(): string {
  let r = cryptoRand() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) { r -= s.weight; if (r <= 0) return s.id; }
  return SYMBOLS[SYMBOLS.length-1].id;
}
function spinReels(): string[][] {
  return Array.from({length:5}, () => Array.from({length:3}, () => weightedRandom()));
}

/* Server symbol IDs → visual symbol IDs */
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
  if (m >= 50) return 'jackpot';
  if (m >= 15) return 'big';
  if (m >= 3) return 'medium';
  return 'small';
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAYLINE DEFINITIONS (20 lines)
───────────────────────────────────────────────────────────────────────────── */
const PAYLINES: number[][] = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],
  [0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],
  [1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],
  [0,0,1,0,0],[2,2,1,2,2],[1,0,1,0,1],[1,2,1,2,1],
  [0,1,0,1,0],[2,1,2,1,2],[0,2,0,2,0],[2,0,2,0,2],[1,1,2,1,1],
];

function evaluateWin(grid: string[][], bet: number): { payout: number; winLines: number[]; winTier: string } {
  let payout = 0; const winLines: number[] = [];
  // Check scatters first
  let scatCount = grid.flat().filter(s=>s==='SCATTER').length;
  if (scatCount >= 3) { payout += bet * (scatCount===3?12:scatCount===4?30:100); }

  for (let li=0; li<PAYLINES.length; li++) {
    const line = PAYLINES[li];
    const cells = line.map((row,col) => grid[col][row]);
    let first = cells[0]==='WILD' ? cells.find(c=>c!=='WILD') || 'WILD' : cells[0];
    let count=0;
    for (const c of cells) { if (c===first||c==='WILD') count++; else break; }
    if (count >= 2) {
      const sym = SYMBOLS.find(s=>s.id===first);
      if (sym && sym.payouts[count-1]) {
        payout += sym.payouts[count-1] * bet;
        winLines.push(li);
      }
    }
  }
  let tier = 'none';
  if (payout > 0) {
    const mult = payout/bet;
    if (mult >= 200) tier='mega'; else if (mult >= 50) tier='big'; else if (mult >= 10) tier='medium'; else tier='small';
  }
  if (scatCount >= 3 && tier==='none') tier='scatter';
  return { payout, winLines, winTier: tier };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOUND ENGINE
───────────────────────────────────────────────────────────────────────────── */
class SoundEngine {
  ctx: AudioContext | null = null; masterGain: GainNode | null = null; volume = 0.6;
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }
  private connect(node: AudioNode) { node.connect(this.masterGain!); }
  private osc(type: OscillatorType, freq: number, start: number, dur: number, vol=0.3, detune=0) {
    if (!this.ctx||!this.masterGain) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,start); o.detune.value=detune;
    g.gain.setValueAtTime(0,start); g.gain.linearRampToValueAtTime(vol,start+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
    o.connect(g); this.connect(g); o.start(start); o.stop(start+dur+0.05);
  }
  setVolume(v: number) { this.volume=v; if(this.masterGain) this.masterGain.gain.value=v; }
  playButtonClick() { if(!this.ctx)return; const t=this.ctx.currentTime; this.osc('sine',800,t,0.05,0.15); }
  playSpin() {
    if(!this.ctx)return; const t=this.ctx.currentTime;
    for(let i=0;i<8;i++) this.osc('triangle',400-i*30,t+i*0.04,0.08,0.2);
    this.osc('sawtooth',80,t,0.3,0.15);
  }
  playReel(reelIndex: number) {
    if(!this.ctx)return; const t=this.ctx.currentTime;
    const freqs=[800,900,1000,1100,1200];
    this.osc('triangle',freqs[reelIndex],t,0.05,0.25);
    this.osc('sine',freqs[reelIndex]*1.5,t+0.02,0.04,0.1);
  }
  playWin(tier: string) {
    if(!this.ctx)return; const t=this.ctx.currentTime;
    if(tier==='small') {
      [523,659,784].forEach((f,i)=>this.osc('sine',f,t+i*0.12,0.18,0.25));
    } else if(tier==='medium') {
      [523,659,784,1047,1319].forEach((f,i)=>this.osc('sine',f,t+i*0.1,0.25,0.3));
      this.osc('triangle',200,t,0.5,0.2);
    } else if(tier==='big'||tier==='mega') {
      const notes=[523,659,784,1047,1319,1568];
      notes.forEach((f,i)=>{ this.osc('sine',f,t+i*0.08,0.4,0.35); this.osc('triangle',f/2,t+i*0.08,0.4,0.15); });
      for(let i=0;i<20;i++) this.osc('sine',200+i*50,t+i*0.06,0.3,0.1);
      this.osc('sawtooth',100,t,1.2,0.2);
    }
  }
  playScatter() {
    if(!this.ctx)return; const t=this.ctx.currentTime;
    for(let i=0;i<12;i++) this.osc('sine',800+i*100,t+i*0.05,0.3,0.15);
    for(let i=0;i<6;i++) this.osc('triangle',300+i*50,t+i*0.08,0.25,0.1);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG SYMBOL COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
function SymbolArt({ id, size=90, glowing=false }: { id:string; size?:number; glowing?:boolean }) {
  const sym = SYMBOLS.find(s=>s.id===id) || SYMBOLS[0];
  const gStyle: React.CSSProperties = glowing ? {
    animation:'symbolGlow 0.8s ease-in-out infinite',
    color: sym.color,
  } : {};

  const defs = (uid: string, c1: string, c2: string) => (
    <defs>
      <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c1}/><stop offset="100%" stopColor={c2}/>
      </linearGradient>
      <filter id={`f${uid}`}>
        <feGaussianBlur stdDeviation="1.5" result="b"/>
        <feComposite in="SourceGraphic" in2="b" operator="over"/>
      </filter>
    </defs>
  );

  const s = size;
  const styleWrap: React.CSSProperties = { display:'flex',alignItems:'center',justifyContent:'center',width:s,height:s, ...gStyle };

  if (id==='WILD') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        {defs('wg','#f4c430','#ff8c00')}
        <polygon points="45,4 55,30 82,30 60,48 68,75 45,58 22,75 30,48 8,30 35,30" fill="url(#wg)" filter="url(#fwg)"/>
        <polygon points="45,14 52,33 72,33 57,46 62,67 45,54 28,67 33,46 18,33 38,33" fill="#fff7" />
        <line x1="45" y1="20" x2="45" y2="70" stroke="#ffdd00" strokeWidth="2" strokeDasharray="4,3" opacity="0.8"/>
        <line x1="20" y1="45" x2="70" y2="45" stroke="#ffdd00" strokeWidth="2" strokeDasharray="4,3" opacity="0.8"/>
        <circle cx="45" cy="45" r="8" fill="#fff" opacity="0.9"/>
        <text x="45" y="50" textAnchor="middle" fontSize="10" fontWeight="900" fill="#f4c430" fontFamily="Outfit,sans-serif">W</text>
      </svg>
    </div>
  );

  if (id==='SCATTER') return (
    <div style={{...styleWrap, animation: glowing?'scatterPulse 1s ease-in-out infinite':'none'}}>
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
        <line x1="30" y1="60" x2="60" y2="60" stroke="url(#scg)" strokeWidth="1.5" opacity="0.6"/>
        <line x1="35" y1="68" x2="55" y2="68" stroke="url(#scg)" strokeWidth="1.5" opacity="0.4"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
          <line key={i} x1="45" y1="5" x2={45+Math.cos(a*Math.PI/180)*8} y2={5+Math.sin(a*Math.PI/180)*8} stroke="#ff2d78" strokeWidth="1" opacity="0.5"/>
        ))}
      </svg>
    </div>
  );

  if (id==='ZEUS') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="zg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00aaff"/><stop offset="50%" stopColor="#f4c430"/><stop offset="100%" stopColor="#00aaff"/></linearGradient></defs>
        <polygon points="50,5 58,35 80,20 55,45 75,50 45,85 40,55 15,65 42,40 20,38 48,20 35,30" fill="url(#zg)" opacity="0.95"/>
        <polygon points="50,15 56,36 72,25 53,44 68,48 45,75 41,52 22,60 44,41 26,39 47,25 38,32" fill="#fff6" />
        {[0,1,2].map(i=>(
          <line key={i} x1={30+i*5} y1={55+i*8} x2={55+i*3} y2={35+i*5} stroke="#00ddff" strokeWidth="1" opacity={0.5-i*0.15}/>
        ))}
      </svg>
    </div>
  );

  if (id==='ATHENA') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
        <ellipse cx="45" cy="50" rx="28" ry="32" fill="url(#ag)" opacity="0.9"/>
        <ellipse cx="45" cy="45" rx="20" ry="25" fill="#1e0c35" opacity="0.6"/>
        <path d="M20,25 Q45,5 70,25 Q60,15 45,18 Q30,15 20,25Z" fill="url(#ag)"/>
        <path d="M28,30 Q32,15 36,20" stroke="#c084fc" strokeWidth="2" fill="none"/>
        <path d="M54,20 Q58,15 62,30" stroke="#c084fc" strokeWidth="2" fill="none"/>
        <ellipse cx="35" cy="45" rx="9" ry="10" fill="#a855f7"/>
        <ellipse cx="55" cy="45" rx="9" ry="10" fill="#a855f7"/>
        <ellipse cx="35" cy="45" rx="5" ry="5" fill="#1e0c35"/>
        <ellipse cx="55" cy="45" rx="5" ry="5" fill="#1e0c35"/>
        <circle cx="33" cy="43" r="2" fill="#c084fc" opacity="0.9"/>
        <circle cx="53" cy="43" r="2" fill="#c084fc" opacity="0.9"/>
        <path d="M38,62 Q45,68 52,62" stroke="#c084fc" strokeWidth="2" fill="none"/>
        <line x1="45" y1="72" x2="45" y2="85" stroke="#7c3aed" strokeWidth="3"/>
        <path d="M35,82 L45,75 L55,82" stroke="#7c3aed" strokeWidth="2" fill="none"/>
      </svg>
    </div>
  );

  if (id==='POSEIDON') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient></defs>
        <line x1="45" y1="5" x2="45" y2="75" stroke="url(#pg)" strokeWidth="5" strokeLinecap="round"/>
        <line x1="45" y1="5" x2="25" y2="28" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round"/>
        <line x1="45" y1="5" x2="65" y2="28" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round"/>
        <line x1="45" y1="18" x2="32" y2="35" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round"/>
        <line x1="45" y1="18" x2="58" y2="35" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round"/>
        {[[35,65],[42,72],[52,68],[38,80],[55,75],[45,82]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="4" ry="6" fill="#22d3ee" opacity={0.6+i*0.05}/>
        ))}
        <path d="M15,78 Q25,70 35,78 Q45,86 55,78 Q65,70 75,78" stroke="#0ea5e9" strokeWidth="2.5" fill="none"/>
        <path d="M10,84 Q22,76 34,84 Q46,92 58,84 Q70,76 80,84" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.7"/>
      </svg>
    </div>
  );

  if (id==='ACE') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="acg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4c430"/><stop offset="100%" stopColor="#b45309"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#acg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#acg)" strokeWidth="2.5"/>
        <rect x="10" y="10" width="70" height="70" rx="6" fill="none" stroke="#f4c43055" strokeWidth="1"/>
        <text x="45" y="62" textAnchor="middle" fontSize="55" fontWeight="900" fill="url(#acg)" fontFamily="Outfit,sans-serif" letterSpacing="-2">A</text>
        <line x1="15" y1="45" x2="75" y2="45" stroke="#f4c43033" strokeWidth="1"/>
      </svg>
    </div>
  );

  if (id==='KING') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#5b21b6"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#kg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#kg)" strokeWidth="2.5"/>
        <path d="M12,12 L20,20 M70,12 L78,20 M12,78 L20,70 M70,78 L78,70" stroke="#a78bfa" strokeWidth="2" opacity="0.6"/>
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#kg)" fontFamily="Outfit,sans-serif">K</text>
      </svg>
    </div>
  );

  if (id==='QUEEN') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="qg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2dd4bf"/><stop offset="100%" stopColor="#0d9488"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#qg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#qg)" strokeWidth="2.5"/>
        {[[18,18],[72,18],[18,72],[72,72],[45,8]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="4" fill={['#f472b6','#a78bfa','#f4c430','#22d3ee','#ff2d78'][i]}/>
        ))}
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#qg)" fontFamily="Outfit,sans-serif">Q</text>
      </svg>
    </div>
  );

  if (id==='JACK') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="jg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#be185d"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#jg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#jg)" strokeWidth="2.5"/>
        <path d="M8,8 L82,8 L82,12 L8,12Z" fill="#f472b6" opacity="0.3"/>
        <path d="M8,78 L82,78 L82,82 L8,82Z" fill="#f472b6" opacity="0.3"/>
        <text x="45" y="62" textAnchor="middle" fontSize="52" fontWeight="900" fill="url(#jg)" fontFamily="Outfit,sans-serif">J</text>
      </svg>
    </div>
  );

  if (id==='TEN') return (
    <div style={styleWrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient></defs>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="url(#tg)" opacity="0.12"/>
        <rect x="5" y="5" width="80" height="80" rx="8" fill="none" stroke="url(#tg)" strokeWidth="2.5"/>
        <text x="45" y="62" textAnchor="middle" fontSize="46" fontWeight="900" fill="url(#tg)" fontFamily="Outfit,sans-serif">10</text>
      </svg>
    </div>
  );

  return <div style={styleWrap}><svg width={s} height={s} viewBox="0 0 90 90"><circle cx="45" cy="45" r="40" fill={sym.color}/></svg></div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTICLE SYSTEM
───────────────────────────────────────────────────────────────────────────── */
interface Particle { id:number; x:number; y:number; vx:number; vy:number; rot:number; vrot:number; color:string; size:number; life:number; maxLife:number; shape:string; }
function ParticleSystem({ active, tier, centerX, centerY }: { active:boolean; tier:string; centerX:number; centerY:number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const nextId = useRef(0);

  useEffect(()=>{
    if (!active) { setParticles([]); return; }
    const count = tier==='mega'?200:tier==='big'?120:tier==='medium'?60:30;
    const colors = tier==='mega'?['#f4c430','#ffdd00','#ff8c00','#ff2d78','#00d4c8']:
                   tier==='big'?['#f4c430','#ffdd00','#ff8c00','#fbbf24']:
                   tier==='medium'?['#00d4c8','#2dd4bf','#a78bfa']:['#fff','#f0e8ff','#c0c8d8'];
    const shapes = ['circle','square','star'];
    const newParticles: Particle[] = Array.from({length:count},(_,i)=>{
      const angle = (Math.random()*360)*Math.PI/180;
      const speed = 3+Math.random()*8;
      return {
        id: nextId.current++,
        x: centerX+( Math.random()-0.5)*60,
        y: centerY+( Math.random()-0.5)*60,
        vx: Math.cos(angle)*speed*(0.5+Math.random()),
        vy: Math.sin(angle)*speed-5-Math.random()*5,
        rot: Math.random()*360,
        vrot: (Math.random()-0.5)*15,
        color: colors[Math.floor(Math.random()*colors.length)],
        size: 6+Math.random()*10,
        life: 1,
        maxLife: 60+Math.floor(Math.random()*80),
        shape: shapes[Math.floor(Math.random()*shapes.length)],
      };
    });
    setParticles(newParticles);
    const tick = () => {
      setParticles(prev=>{
        if (prev.length===0) return prev;
        const next = prev.map(p=>({
          ...p,
          x: p.x+p.vx,
          y: p.y+p.vy,
          vy: p.vy+0.35,
          vx: p.vx*0.98,
          rot: p.rot+p.vrot,
          life: p.life-(1/p.maxLife),
        })).filter(p=>p.life>0);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return ()=>{ cancelAnimationFrame(rafRef.current); };
  },[active, tier, centerX, centerY]);

  if (!active && particles.length===0) return null;
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,overflow:'hidden'}}>
      {particles.map(p=>{
        const size = p.size*(0.2+p.life*0.8);
        return (
          <div key={p.id} style={{
            position:'absolute',
            left: p.x, top: p.y,
            width: size, height: size,
            opacity: p.life,
            transform: `rotate(${p.rot}deg) translate(-50%,-50%)`,
            background: p.shape==='circle'
              ? `radial-gradient(circle, ${p.color}, transparent)`
              : p.color,
            borderRadius: p.shape==='circle'?'50%':p.shape==='star'?'2px':'4px',
            boxShadow: `0 0 ${size*1.5}px ${p.color}88`,
          }}/>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REEL STRIP COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const SYMBOL_H = 100;
const VISIBLE = 3;
const STRIP_SIZE = 20;

function ReelStrip({ reelSymbols, result, isSpinning, stopDelay, onStopped, winningRows, reelIndex }:{
  reelSymbols: string[]; result: string[]; isSpinning: boolean; stopDelay: number;
  onStopped: ()=>void; winningRows: number[]; reelIndex: number;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const spinOffsetRef = useRef(0);

  // Build the display strip: random symbols + result at the end
  const displayStrip = useMemo(()=>{
    const pre = Array.from({length:STRIP_SIZE-VISIBLE},()=>reelSymbols[Math.floor(cryptoRand()*reelSymbols.length)]);
    return [...pre, ...result];
  },[result, reelSymbols]);

  useEffect(()=>{
    if (isSpinning) {
      setSpinning(true);
      setLanded(false);
      // Kick off fast scroll via CSS animation
      if (stripRef.current) {
        stripRef.current.style.transition = 'none';
        stripRef.current.style.transform = `translateY(0px)`;
      }
      // After stopDelay, land on result
      timerRef.current = setTimeout(()=>{
        const finalY = -((STRIP_SIZE-VISIBLE)*SYMBOL_H);
        if (stripRef.current) {
          stripRef.current.style.transition = `transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          stripRef.current.style.transform = `translateY(${finalY}px)`;
          // Bounce
          setTimeout(()=>{
            if(stripRef.current){
              stripRef.current.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)';
              stripRef.current.style.transform = `translateY(${finalY+8}px)`;
              setTimeout(()=>{
                if(stripRef.current){
                  stripRef.current.style.transition = 'transform 0.15s ease-out';
                  stripRef.current.style.transform = `translateY(${finalY}px)`;
                }
              },200);
            }
            setSpinning(false); setLanded(true); onStopped();
          },700);
        }
      }, stopDelay);
    } else {
      // Reset
      if (stripRef.current) {
        stripRef.current.style.transition='none';
        stripRef.current.style.transform='translateY(0px)';
      }
      setLanded(false);
    }
    return ()=>{ if(timerRef.current) clearTimeout(timerRef.current); };
  },[isSpinning]);

  return (
    <div style={{
      width: 100, height: VISIBLE*SYMBOL_H,
      overflow:'hidden', position:'relative',
      background: `linear-gradient(180deg, ${C.reelBg} 0%, #130a2a 50%, ${C.reelBg} 100%)`,
      borderRadius:8,
      boxShadow:'inset 0 0 30px #00000088, inset 0 2px 0 #7c3aed44, inset 0 -2px 0 #7c3aed44',
      animation: spinning ? 'columnGlow 0.3s ease-in-out infinite' : 'none',
    }}>
      {/* Top/bottom shadow overlays */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:30,background:'linear-gradient(180deg,#0a001088,transparent)',zIndex:10,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:30,background:'linear-gradient(0deg,#0a001088,transparent)',zIndex:10,pointerEvents:'none'}}/>

      <div ref={stripRef} style={{
        willChange:'transform',
        filter: spinning ? 'blur(2.5px) brightness(1.2)' : 'none',
        transition: spinning ? 'filter 0.1s' : 'filter 0.3s',
      }}>
        {displayStrip.map((symId,i)=>{
          const rowInResult = i - (STRIP_SIZE-VISIBLE);
          const isWinRow = landed && rowInResult>=0 && rowInResult<3 && winningRows.includes(rowInResult);
          return (
            <div key={i} style={{
              width:100, height:SYMBOL_H,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderBottom:`1px solid ${C.reelBorder}22`,
              background: isWinRow ? `radial-gradient(ellipse at center, ${SYMBOLS.find(s=>s.id===symId)?.glow}22, transparent 70%)` : 'transparent',
              transition:'background 0.3s',
            }}>
              <SymbolArt id={symId} size={88} glowing={isWinRow}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAYLINE OVERLAY
───────────────────────────────────────────────────────────────────────────── */
function PaylineOverlay({ winLines, active }: { winLines:number[]; active:boolean }) {
  if (!active || winLines.length===0) return null;
  const W=520, H=300, CW=100, SPACE=4, REEL_W=CW+SPACE;
  const colors=['#f4c430','#00d4c8','#ff2d78','#a78bfa','#00ff88','#ff8c00','#22d3ee','#f472b6','#c084fc','#fbbf24'];
  return (
    <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:20,width:'100%',height:'100%'}} viewBox={`0 0 ${W} ${H}`}>
      {winLines.slice(0,5).map((li,idx)=>{
        const line=PAYLINES[li];
        const pts = line.map((row,col)=>{
          const x = col*REEL_W+CW/2;
          const y = row*CW+CW/2;
          return `${x},${y}`;
        }).join(' ');
        const color=colors[idx%colors.length];
        return (
          <polyline key={li} points={pts} fill="none" stroke={color} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
            strokeDasharray="800" strokeDashoffset="800"
            style={{animation:`paylineTrace 0.6s ${idx*0.12}s ease-out forwards`}}
          />
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BACKGROUND STARS
───────────────────────────────────────────────────────────────────────────── */
function StarField() {
  const stars = useMemo(()=>Array.from({length:80},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:0.5+Math.random()*2.5,
    dur:8+Math.random()*20,
    delay:-Math.random()*20,
    sx:`${(Math.random()-0.5)*60}px`,
    so: 0.2+Math.random()*0.8,
  })),[]);
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:'absolute',
          left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size,
          borderRadius:'50%',
          background:'#fff',
          opacity:s.so,
          '--sx':s.sx,'--so':s.so,
          animation:`starDrift ${s.dur}s ${s.delay}s linear infinite`,
        } as React.CSSProperties}/>
      ))}
      <div style={{position:'absolute',left:'5%',top:'10%',width:4,bottom:'10%',background:'linear-gradient(180deg,transparent,#f4c43044,#7c3aed66,transparent)',borderRadius:4}}/>
      <div style={{position:'absolute',right:'5%',top:'10%',width:4,bottom:'10%',background:'linear-gradient(180deg,transparent,#f4c43044,#7c3aed66,transparent)',borderRadius:4}}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BIG WIN OVERLAY
───────────────────────────────────────────────────────────────────────────── */
function BigWinOverlay({ tier, amount, onClose }: { tier:string; amount:number; onClose:()=>void }) {
  const isMega = tier==='mega';
  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,zIndex:9000,
      background:isMega?'radial-gradient(ellipse at center,#2d0050dd,#0a001099)':'radial-gradient(ellipse at center,#1a0035cc,#0a001099)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      cursor:'pointer',backdropFilter:'blur(4px)',
    }}>
      <div style={{
        fontSize:isMega?'clamp(40px,8vw,90px)':'clamp(30px,6vw,70px)',
        fontWeight:900, fontFamily:'Outfit,sans-serif',
        background:isMega?'linear-gradient(135deg,#ff2d78,#f4c430,#00d4c8,#ff2d78)':'linear-gradient(135deg,#f4c430,#ffdd00,#f4c430)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
        backgroundSize:'200% 200%', animation:'bigWinText 0.8s cubic-bezier(0.34,1.56,0.64,1) both, logoShimmer 2s linear infinite',
        textShadow:'none', textAlign:'center',
        filter:`drop-shadow(0 0 ${isMega?40:20}px ${isMega?'#ff2d78':'#f4c430'})`,
      }}>
        {isMega?'⚡ MEGA WIN ⚡':'🔥 BIG WIN 🔥'}
      </div>
      <div style={{
        fontSize:'clamp(24px,5vw,60px)', fontWeight:900, fontFamily:'Outfit,sans-serif',
        color:'#f4c430', marginTop:16, animation:'winAmount 0.6s 0.4s both',
        textShadow:'0 0 30px #f4c430, 0 0 60px #ff8c00',
      }}>
        ${amount.toLocaleString()}
      </div>
      <div style={{color:C.textDim,marginTop:24,fontSize:14,fontFamily:'Outfit,sans-serif'}}>Tap to continue</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN GAME
───────────────────────────────────────────────────────────────────────────── */
const BET_OPTIONS = [0.20,0.50,1,2,5,10,20,50];
const REEL_SYMBOLS = SYMBOLS.map(s=>s.id);
const soundEngine = new SoundEngine();

export default function NeonPalacePage() {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(1);
  const [betIdx, setBetIdx] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['ACE','KING','QUEEN'],['ZEUS','POSEIDON','ATHENA'],['KING','ACE','JACK'],
    ['QUEEN','TEN','KING'],['JACK','ACE','POSEIDON'],
  ]);
  const [stoppedCount, setStoppedCount] = useState(0);
  const [winData, setWinData] = useState<{payout:number; winLines:number[]; winTier:string}|null>(null);
  const [showWin, setShowWin] = useState(false);
  const [particles, setParticles] = useState(false);
  const [bigWin, setBigWin] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [jackpot, setJackpot] = useState(47382.50);
  const [volume, setVolume] = useState(0.6);
  const [showVolume, setShowVolume] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [history, setHistory] = useState<{payout:number;tier:string;bet:number}[]>([]);
  const [winCount, setWinCount] = useState(0);
  const [reelSeeds, setReelSeeds] = useState<string[][][]>(Array.from({length:5},()=>[['ACE','KING','QUEEN']]));
  const [showPaytable, setShowPaytable] = useState(false);
  const [pendingResult, setPendingResult] = useState<string[][]|null>(null);
  const [apiMode, setApiMode] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const pendingServerWin = useRef<{payout:number;winLines:number[];winTier:string;freeSpins:number}|null>(null);
  const soundInit = useRef(false);
  const autoRef = useRef(false);
  const spinRef = useRef(false);
  const reelGridRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    tokenRef.current = token;
    userApi.getWallet(token)
      .then(w => { setBalance(parseFloat(w.balance)); setApiMode(true); })
      .catch(()=>{});
  },[]);

  // Jackpot ticker
  useEffect(()=>{
    const id = setInterval(()=>setJackpot(j=>parseFloat((j+0.01+Math.random()*0.05).toFixed(2))),300);
    return ()=>clearInterval(id);
  },[]);

  const initSound = useCallback(()=>{
    if (!soundInit.current) { soundEngine.init(); soundInit.current=true; }
  },[]);

  const handleSpin = useCallback(async ()=>{
    if (spinRef.current || balance < bet) return;
    initSound();
    soundEngine.playSpin();
    setBalance(b=>parseFloat((b-bet).toFixed(2)));
    setShowWin(false); setWinData(null); setParticles(false); setBigWin(false);
    pendingServerWin.current = null;

    // Start animation with local placeholder — reels update before landing if API responds in time
    setPendingResult(spinReels());
    setStoppedCount(0);
    setSpinning(true);
    spinRef.current = true;

    if (apiMode && tokenRef.current) {
      try {
        const res = await gameApi.spin(tokenRef.current, bet);
        setPendingResult(mapServerGrid(res.grid));
        pendingServerWin.current = {
          payout: res.totalPayout,
          winLines: res.paylineWins.map(w => w.paylineIndex),
          winTier: serverWinTier(res.totalPayout, bet),
          freeSpins: res.freeSpinsAwarded,
        };
      } catch {
        // Local result already set — demo fallback
      }
    }
  },[balance, bet, initSound, apiMode]);

  const handleReelStop = useCallback((reelIndex: number)=>{
    soundEngine.playReel(reelIndex);
    setStoppedCount(c=>{
      const next = c+1;
      if (next===5) {
        // All reels stopped — use server win data if available, otherwise local evaluation
        setTimeout(()=>{
          if (!pendingResult) return;
          const serverWin = pendingServerWin.current;
          const evaluation = serverWin
            ? { payout: serverWin.payout, winLines: serverWin.winLines, winTier: serverWin.winTier }
            : evaluateWin(pendingResult, bet);
          setWinData(evaluation);
          if (evaluation.payout>0) {
            setBalance(b=>parseFloat((b+evaluation.payout).toFixed(2)));
            setShowWin(true);
            setParticles(true);
            soundEngine.playWin(evaluation.winTier);
            if (evaluation.payout/bet>=50) setBigWin(true);
            if (evaluation.winTier==='scatter') {
              soundEngine.playScatter();
              setFreeSpins(f=>f+(serverWin?.freeSpins ?? 12));
            }
            setWinCount(n=>n+1);
            setTimeout(()=>setParticles(false),4000);
          }
          setHistory(h=>[{payout:evaluation.payout,tier:evaluation.winTier,bet},{...h[0]},{...h[1]},{...h[2]},{...h[3]},...h.slice(4)].filter(Boolean).slice(0,10) as any);
          setReelResults(pendingResult);
          setSpinning(false);
          spinRef.current=false;
          if (autoRef.current && (freeSpins>0||balance>bet)) {
            setTimeout(handleSpin, turbo?400:1200);
          }
        },200);
      }
      return next;
    });
  },[pendingResult, bet, balance, freeSpins, turbo, handleSpin]);

  useEffect(()=>{ soundEngine.setVolume(volume); },[volume]);
  useEffect(()=>{ autoRef.current=autoSpin; },[autoSpin]);

  // Free spin usage
  const effectiveSpin = useCallback(()=>{
    if (freeSpins>0) { setFreeSpins(f=>f-1); if(spinRef.current)return; initSound(); soundEngine.playSpin();
      const result=spinReels(); setPendingResult(result); setStoppedCount(0); setSpinning(true); spinRef.current=true;
      setShowWin(false);setWinData(null);setParticles(false);setBigWin(false); return;
    }
    handleSpin();
  },[freeSpins, handleSpin, initSound]);

  const getReelResult = (col:number) => pendingResult ? pendingResult[col] : reelResults[col];
  const getWinningRows = (col:number): number[] => {
    if (!winData || !showWin) return [];
    const rows = new Set<number>();
    winData.winLines.forEach(li=>{ rows.add(PAYLINES[li][col]); });
    return Array.from(rows);
  };

  const isFreeSpinBg = freeSpins>0;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:GLOBAL_CSS}}/>
      <StarField/>
      <ParticleSystem active={particles} tier={winData?.winTier||'small'}
        centerX={typeof window!=='undefined'?window.innerWidth/2:400}
        centerY={typeof window!=='undefined'?window.innerHeight/2:300}/>
      {bigWin && winData && <BigWinOverlay tier={winData.winTier} amount={winData.payout} onClose={()=>setBigWin(false)}/>}

      <div style={{
        minHeight:'100vh', position:'relative', zIndex:1,
        background: isFreeSpinBg
          ? 'linear-gradient(135deg,#1a0d00,#0d1a00,#001a1a,#1a0d00)'
          : `radial-gradient(ellipse at 50% 0%,#2a0060 0%,#0a0010 60%)`,
        backgroundSize: isFreeSpinBg?'400% 400%':'auto',
        animation: isFreeSpinBg?'freeSpinBg 3s ease infinite':'none',
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'12px 16px 24px', gap:12,
        fontFamily:'Outfit,sans-serif',
      }}>

        {/* ── HEADER */}
        <div style={{width:'100%',maxWidth:800,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
          {/* Logo */}
          <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
            <span style={{
              fontSize:'clamp(18px,3vw,28px)', fontWeight:900,
              background:'linear-gradient(90deg,#f4c430,#ffdd00,#ff8c00,#f4c430)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
              animation:'logoShimmer 3s linear infinite',
              letterSpacing:1,
            }}>NEON PALACE</span>
            <span style={{fontSize:'clamp(8px,1.5vw,11px)',color:C.textDim,letterSpacing:3,textTransform:'uppercase',fontWeight:600}}>Gods of Fortune</span>
          </div>
          {/* Balance + Controls */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{
              background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,
              padding:'6px 16px',textAlign:'center',
            }}>
              <div style={{fontSize:10,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:600}}>Balance</div>
              <div style={{fontSize:22,fontWeight:900,color:C.gold,lineHeight:1.1,textShadow:`0 0 10px ${C.gold}88`}}>${balance.toFixed(2)}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{initSound();setShowVolume(v=>!v);soundEngine.playButtonClick();}} style={{
                width:38,height:38,borderRadius:10,border:`1px solid ${C.cardBorder}`,
                background:C.card,color:C.text,cursor:'pointer',fontSize:16,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                  {volume>0&&<path d="M15.54,8.46a5,5,0,0,1,0,7.07"/>}
                  {volume>0.5&&<path d="M19.07,4.93a10,10,0,0,1,0,14.14"/>}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Volume Slider */}
        {showVolume&&(
          <div style={{
            position:'absolute',top:80,right:16,zIndex:100,
            background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,
            padding:'12px 16px',display:'flex',flexDirection:'column',gap:8,
            animation:'fadeInUp 0.2s ease',
          }}>
            <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:2}}>Volume</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e=>{const v=parseFloat(e.target.value);setVolume(v);soundEngine.setVolume(v);}}
              style={{width:120,accentColor:C.gold}}/>
          </div>
        )}

        {/* ── JACKPOT */}
        <div style={{
          width:'100%',maxWidth:800,
          background:`linear-gradient(135deg,${C.card},#2d0a50)`,
          border:`1px solid #7c3aed66`,borderRadius:14,
          padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',
          boxShadow:'0 0 30px #7c3aed33',
        }}>
          <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Progressive Jackpot</span>
          <span style={{
            fontSize:'clamp(20px,3.5vw,32px)',fontWeight:900,color:C.gold,
            textShadow:`0 0 20px ${C.gold}, 0 0 40px #ff8c00`,
            animation:'jackpotTick 2s ease-in-out infinite',
            fontVariantNumeric:'tabular-nums',
          }}>${jackpot.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          <div style={{display:'flex',gap:6}}>
            {[...Array(5)].map((_,i)=>(
              <div key={i} style={{width:8,height:8,borderRadius:'50%',
                background:i<3?C.gold:'#3a1a6e',
                boxShadow:i<3?`0 0 8px ${C.gold}`:'none',
              }}/>
            ))}
          </div>
        </div>

        {/* ── FREE SPINS BADGE */}
        {freeSpins>0&&(
          <div style={{
            background:'linear-gradient(135deg,#f4c430,#ff8c00)',
            borderRadius:20,padding:'6px 20px',
            fontSize:14,fontWeight:800,color:'#0a0010',
            boxShadow:`0 0 20px ${C.gold}aa`,
            animation:'wiggle 0.5s ease-in-out infinite',
          }}>
            ⚡ FREE SPINS: {freeSpins} REMAINING
          </div>
        )}

        {/* ── REEL GRID */}
        <div style={{width:'100%',maxWidth:800,position:'relative'}}>
          {/* Frame */}
          <div style={{
            background:`linear-gradient(180deg,#2a0060,#1a0040)`,
            border:`2px solid ${C.reelBorder}`,borderRadius:16,
            padding:'16px 12px',
            boxShadow:`0 0 50px #7c3aed44, inset 0 0 40px #00000088`,
            position:'relative',overflow:'hidden',
          }}>
            {/* Corner ornaments */}
            {['topLeft','topRight','bottomLeft','bottomRight'].map((pos,i)=>(<div key={i} style={{
              position:'absolute',
              top:i<2?8:'auto',bottom:i>=2?8:'auto',
              left:i%2===0?8:'auto',right:i%2===1?8:'auto',
              width:20,height:20,
              borderTop:i<2?`2px solid ${C.gold}`:'none',
              borderBottom:i>=2?`2px solid ${C.gold}`:'none',
              borderLeft:i%2===0?`2px solid ${C.gold}`:'none',
              borderRight:i%2===1?`2px solid ${C.gold}`:'none',
            }}/>))}

            {/* Reels container with payline overlay */}
            <div ref={reelGridRef} style={{display:'flex',gap:4,justifyContent:'center',position:'relative',height:300}}>
              <PaylineOverlay winLines={winData?.winLines||[]} active={showWin}/>
              {[0,1,2,3,4].map(col=>(
                <div key={col} style={{display:'flex',flexDirection:'column',gap:0,
                  border:`1px solid ${C.reelBorder}`,borderRadius:10,overflow:'hidden',
                  boxShadow:`0 0 15px #7c3aed22`,
                }}>
                  <ReelStrip
                    reelSymbols={REEL_SYMBOLS}
                    result={getReelResult(col)}
                    isSpinning={spinning}
                    stopDelay={(turbo?400:800)+col*(turbo?150:220)}
                    onStopped={()=>handleReelStop(col)}
                    winningRows={getWinningRows(col)}
                    reelIndex={col}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column labels */}
          <div style={{display:'flex',gap:4,justifyContent:'center',marginTop:6}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:100,textAlign:'center',fontSize:9,color:C.textDim,letterSpacing:2,textTransform:'uppercase'}}>Reel {i+1}</div>
            ))}
          </div>
        </div>

        {/* ── WIN DISPLAY */}
        {showWin && winData && winData.payout>0 && (
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
            <div style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:900,color:C.gold,
              textShadow:`0 0 20px ${C.gold}, 0 0 40px #ff8c00`,lineHeight:1.1,
            }}>
              +${winData.payout.toFixed(2)}
            </div>
            {bet>0&&<div style={{fontSize:11,color:C.teal,fontWeight:700,letterSpacing:1}}>×{(winData.payout/bet).toFixed(1)} MULTIPLIER</div>}
          </div>
        )}

        {/* ── CONTROL PANEL */}
        <div style={{
          width:'100%',maxWidth:800,
          background:`linear-gradient(180deg,${C.card},${C.darkPurple})`,
          border:`1px solid ${C.cardBorder}`,borderRadius:16,
          padding:'16px 20px',
          boxShadow:`0 -4px 30px #7c3aed22`,
        }}>
          {/* Bet Row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,gap:8,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:600}}>Bet</span>
              <button onClick={()=>{initSound();soundEngine.playButtonClick();setBetIdx(i=>Math.max(0,i-1));setBet(BET_OPTIONS[Math.max(0,betIdx-1)]);}} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1}}>−</button>
              <div style={{
                background:C.surface,border:`1px solid ${C.gold}66`,borderRadius:10,
                padding:'4px 16px',minWidth:80,textAlign:'center',
                color:C.gold,fontWeight:800,fontSize:18,
                textShadow:`0 0 8px ${C.gold}88`,
              }}>${bet.toFixed(2)}</div>
              <button onClick={()=>{initSound();soundEngine.playButtonClick();setBetIdx(i=>Math.min(BET_OPTIONS.length-1,i+1));setBet(BET_OPTIONS[Math.min(BET_OPTIONS.length-1,betIdx+1)]);}} disabled={spinning}
                style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.cardBorder}`,background:C.surface,color:C.text,cursor:'pointer',fontSize:18,fontWeight:700,opacity:spinning?.5:1}}>+</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{initSound();soundEngine.playButtonClick();setAutoSpin(a=>{const n=!a;autoRef.current=n;if(n&&!spinRef.current)handleSpin();return n;});}}
                style={{
                  padding:'6px 16px',borderRadius:10,border:`1px solid ${autoSpin?C.teal:C.cardBorder}`,
                  background:autoSpin?`${C.teal}22`:C.surface,color:autoSpin?C.teal:C.textDim,
                  cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,
                  textTransform:'uppercase',transition:'all 0.2s',
                }}>Auto</button>
              <button onClick={()=>{initSound();soundEngine.playButtonClick();setTurbo(t=>!t);}}
                style={{
                  padding:'6px 16px',borderRadius:10,border:`1px solid ${turbo?C.magenta:C.cardBorder}`,
                  background:turbo?`${C.magenta}22`:C.surface,color:turbo?C.magenta:C.textDim,
                  cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,
                  textTransform:'uppercase',transition:'all 0.2s',
                }}>Turbo</button>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={()=>{initSound();if(!spinning)effectiveSpin();}}
            disabled={spinning&&!autoSpin}
            style={{
              width:'100%', height:64, borderRadius:14,
              background: spinning
                ? `linear-gradient(135deg,#3a1a6e,#5b21b6)`
                : C.btnGrad,
              border:`2px solid ${spinning?C.purple:C.gold}`,
              color: spinning?C.textDim:'#0a0010',
              fontSize:'clamp(18px,3vw,24px)', fontWeight:900,
              cursor: spinning?'not-allowed':'pointer',
              letterSpacing:4, textTransform:'uppercase',
              animation: spinning?'none':'spinButtonPulse 2s ease-in-out infinite',
              transition:'background 0.3s, color 0.3s, border-color 0.3s',
              boxShadow: spinning?'none':`0 0 30px ${C.gold}88, 0 4px 20px #00000088`,
              position:'relative', overflow:'hidden',
            }}>
            {spinning?(
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite'}}>◈</span>
                SPINNING…
                <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite reverse'}}>◈</span>
              </span>
            ):(
              freeSpins>0?`FREE SPIN (${freeSpins})`:balance<bet?'INSUFFICIENT FUNDS':'SPIN'
            )}
          </button>
        </div>

        {/* ── BOTTOM INFO ROW */}
        <div style={{width:'100%',maxWidth:800,display:'flex',gap:10,flexWrap:'wrap'}}>
          {/* Paytable Toggle */}
          <button onClick={()=>{initSound();soundEngine.playButtonClick();setShowPaytable(p=>!p);}}
            style={{
              flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,
              background:showPaytable?`${C.purple}33`:C.card,
              border:`1px solid ${showPaytable?C.purple:C.cardBorder}`,
              color:showPaytable?C.text:C.textDim,
              cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
            }}>Paytable</button>
          <div style={{
            flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,
            background:C.card,border:`1px solid ${C.cardBorder}`,
            color:C.textDim,fontSize:11,fontWeight:600,textAlign:'center',
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          }}>
            <span style={{color:C.teal}}>◆</span>
            <span>{winCount} wins</span>
            <span style={{color:C.gold}}>◆</span>
            <span>20 lines</span>
          </div>
          {/* History */}
          <div style={{
            flex:2,minWidth:200,borderRadius:10,overflow:'hidden',
            background:C.card,border:`1px solid ${C.cardBorder}`,
          }}>
            <div style={{padding:'4px 10px',background:'#1a0830',borderBottom:`1px solid ${C.cardBorder}`,fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Last Spins</div>
            <div style={{display:'flex',gap:2,padding:'4px 6px',overflowX:'auto'}}>
              {history.slice(0,8).map((h,i)=>(
                <div key={i} style={{
                  flex:'0 0 auto',width:28,height:28,borderRadius:6,
                  background:h.payout>0?(h.tier==='mega'||h.tier==='big'?`${C.gold}33`:h.tier==='medium'?`${C.teal}22`:`#ffffff11`):'#ff2d7811',
                  border:`1px solid ${h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:'#ffffff44'):'#ff2d7844'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:9,fontWeight:700,
                  color:h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:C.textDim):'#ff2d78',
                  animation:'historySlide 0.3s ease both',
                }}>
                  {h.payout>0?`×${(h.payout/h.bet).toFixed(0)}`:'—'}
                </div>
              ))}
              {history.length===0&&<span style={{fontSize:11,color:C.textDim,padding:'4px 6px',opacity:0.5}}>No spins yet</span>}
            </div>
          </div>
        </div>

        {/* ── PAYTABLE */}
        {showPaytable&&(
          <div style={{
            width:'100%',maxWidth:800,
            background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:16,
            padding:'16px',animation:'fadeInUp 0.3s ease both',
          }}>
            <div style={{fontSize:13,fontWeight:800,color:C.gold,textTransform:'uppercase',letterSpacing:3,marginBottom:12,textAlign:'center',
              textShadow:`0 0 10px ${C.gold}88`,
            }}>Paytable — Gods of Fortune</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:6}}>
              {SYMBOLS.map(sym=>(
                <div key={sym.id} style={{
                  display:'flex',alignItems:'center',gap:8,
                  background:C.surface,borderRadius:10,padding:'6px 10px',
                  border:`1px solid ${sym.color}33`,
                }}>
                  <SymbolArt id={sym.id} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:sym.color}}>{sym.name}</div>
                    <div style={{fontSize:10,color:C.textDim}}>
                      {sym.payouts.map((p,i)=>p>0?`${i+1}×${p}`:null).filter(Boolean).join(' | ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:'8px 12px',background:'#0a0020',borderRadius:10,border:`1px solid ${C.teal}33`,textAlign:'center'}}>
              <span style={{fontSize:11,color:C.teal,fontWeight:700}}>3+ SCATTER = 12 FREE SPINS • WILD substitutes all symbols</span>
            </div>
          </div>
        )}

        {/* ── FOOTER */}
        <div style={{width:'100%',maxWidth:800,textAlign:'center',paddingTop:8}}>
          <div style={{fontSize:9,color:`${C.textDim}88`,letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>
            RTP 96.2% • Min Bet $0.20 • Max Bet $50.00 • Play Responsibly
          </div>
          <div style={{
            position:'absolute',inset:0,pointerEvents:'none',zIndex:0,
            background:'repeating-linear-gradient(0deg,transparent,transparent 3px,#ffffff03 3px,#ffffff03 4px)',
          }}/>
        </div>
      </div>
    </>
  );
}
