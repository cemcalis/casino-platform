'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';
import { getPQSymbolImage, getPQAsset } from '../../../config/pyramid-quest-assets';
import { getSharedAsset } from '../../../config/shared-assets';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0500', surface: '#150c00', card: '#1c1200', cardBorder: '#3a2600',
  gold: '#d4af37', goldBright: '#f4c430', bronze: '#8a5e10',
  text: '#f5ecd8', textDim: '#8a7a5c',
  reelBg: '#08050a', reelBorder: '#2a1c08',
  btnGrad: 'linear-gradient(135deg,#1a4d3f 0%,#2d9e7a 30%,#4ecca3 50%,#1a4d3f 70%,#0d2b22 100%)',
  green: '#2dd4bf', red: '#c0392b',
  teal: '#1abc9c', purple: '#6d28d9',
  darkBg: '#050300',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0500; font-family: 'Outfit', sans-serif; }

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
@keyframes jackpotPulse {
  0%,100% { text-shadow: 0 0 12px currentColor, 0 0 24px currentColor; }
  50%     { text-shadow: 0 0 24px currentColor, 0 0 48px currentColor; }
}
@keyframes spinButtonPulse {
  0%,100% { box-shadow: 0 0 18px #d4af3788, 0 0 36px #f4c43044, inset 0 1px 0 #ffe06644; }
  50%     { box-shadow: 0 0 36px #d4af37cc, 0 0 64px #f4c43088, inset 0 1px 0 #ffe06699; }
}
@keyframes paylineTrace {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}
@keyframes emberDrift {
  0%   { transform: translateY(0) translateX(0); opacity: var(--so); }
  100% { transform: translateY(-120vh) translateX(var(--sx)); opacity: 0; }
}
@keyframes scatterPulse {
  0%,100% { filter: drop-shadow(0 0 8px #1abc9c) drop-shadow(0 0 16px #f4c430); }
  50%      { filter: drop-shadow(0 0 22px #1abc9c) drop-shadow(0 0 44px #f4c430) brightness(1.4); }
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
@keyframes rayDrift {
  0%,100% { opacity:0.18; transform: rotate(0deg); }
  50%      { opacity:0.32; transform: rotate(1.5deg); }
}
@keyframes coinFlip {
  0%   { transform: rotateY(0deg) scale(1); }
  50%  { transform: rotateY(900deg) scale(1.15); }
  100% { transform: rotateY(1800deg) scale(1); }
}
/* Responsive reel scaling */
@media (max-width: 576px) {
  .pq-reel-outer { transform: scale(0.82); transform-origin: center top; margin-bottom: -56px; }
}
@media (max-width: 420px) {
  .pq-reel-outer { transform: scale(0.67); transform-origin: center top; margin-bottom: -102px; }
}
`;

/* ─── SYMBOL DEFINITIONS (payout table unchanged from base slot runtime) ────── */
interface SymbolDef {
  id: string; name: string; weight: number;
  payouts: number[]; color: string; glow: string; tier: number;
}
const SYMBOLS: SymbolDef[] = [
  { id:'WILD',      name:'Ankh of Ra',     weight:2,  payouts:[0,0,3,7.5,30],   color:'#f4c430', glow:'#ffe066', tier:5 },
  { id:'SCATTER',   name:'Golden Scarab',  weight:3,  payouts:[0,0,12,55,275],  color:'#1abc9c', glow:'#4ecca3', tier:5 },
  { id:'ANUBIS',    name:'Anubis',         weight:6,  payouts:[0,0,1.5,4.5,15], color:'#c8921a', glow:'#f4c430', tier:4 },
  { id:'HORUS',     name:'Horus',          weight:8,  payouts:[0,0,0.9,3,9],    color:'#5b8bd4', glow:'#93c5fd', tier:4 },
  { id:'BASTET',    name:'Bastet',         weight:8,  payouts:[0,0,1.2,3.6,12], color:'#34d399', glow:'#6ee7b7', tier:4 },
  { id:'THOTH',     name:'Thoth',          weight:12, payouts:[0,0,0.6,2.1,6],  color:'#1abc9c', glow:'#5eead4', tier:3 },
  { id:'PHARAOH',   name:'Pharaoh Mask',   weight:12, payouts:[0,0,0.6,1.8,4.5],color:'#6d28d9', glow:'#c4b5fd', tier:3 },
  { id:'SPHINX',    name:'Sphinx',         weight:14, payouts:[0,0,0.3,1.2,3],  color:'#a8895c', glow:'#d4b896', tier:2 },
  { id:'CARTOUCHE', name:'Cartouche',      weight:15, payouts:[0,0,0.3,0.9,2.4],color:'#c0392b', glow:'#e57368', tier:2 },
  { id:'CROOK',     name:'Crook & Flail',  weight:20, payouts:[0,0,0.15,0.6,1.5],color:'#94a3b8', glow:'#cbd5e1', tier:1 },
];
const TOTAL_WEIGHT = SYMBOLS.reduce((s, x) => s + x.weight, 0);
const REEL_SYMBOLS = SYMBOLS.map(s => s.id);

/* ─── RNG (client preview only — server is source of truth for real spins) ─── */
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
  high_1:'ANUBIS', high_2:'BASTET', high_3:'HORUS',
  med_1:'THOTH', med_2:'PHARAOH',
  low_1:'SPHINX', low_2:'CARTOUCHE', low_3:'CROOK',
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
  volume = 0.6;
  muted = false;
  private audioCache: Record<string, HTMLAudioElement> = {};
  private bgm: HTMLAudioElement | null = null;

  private getSample(path: string | null): HTMLAudioElement | null {
    if (!path) return null;
    if (this.audioCache[path]) return this.audioCache[path];
    const audio = new Audio(path);
    audio.volume = this.volume;
    this.audioCache[path] = audio;
    return audio;
  }

  init() { this.playBGM(); }

  setVolume(v: number) {
    this.volume = v;
    Object.values(this.audioCache).forEach(a => a.volume = v);
    if (this.bgm) this.bgm.volume = v * 0.4;
  }

  setMuted(m: boolean) { this.muted = m; }

  private play(path: string | null, volumeMod = 1) {
    if (this.muted) return;
    const s = this.getSample(path);
    if (!s) return;
    try {
      const clone = s.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume * volumeMod;
      clone.play().catch(() => {});
    } catch { /* audio unavailable — presentation continues silently */ }
  }

  playBGM() {
    if (this.muted) return;
    const path = getPQAsset('background_music');
    if (!path) return;
    try {
      this.bgm = new Audio(path);
      this.bgm.loop = true;
      this.bgm.volume = this.volume * 0.4;
      this.bgm.play().catch(() => {});
    } catch { /* autoplay blocked or file missing — non-fatal */ }
  }

  playButtonClick() { this.play(getSharedAsset('button_click_sfx')); }
  playSpin() { this.play(getPQAsset('spin_start_sfx')); }
  playReel(idx: number) { this.play(getPQAsset('reel_stop_sfx'), 0.8 + idx * 0.05); }
  playWin(_tier: string) { this.play(getPQAsset('win_sfx')); }
  playJackpot() { this.play(getPQAsset('jackpot_sfx')); }
}

/* ─── SYMBOL ART ─────────────────────────────────────────────────────────────── */
function SymbolArt({ id, size = 90, glowing = false, imageSrc }: { id: string; size?: number; glowing?: boolean; imageSrc?: string | null }) {
  const sym = SYMBOLS.find(s => s.id === id) ?? SYMBOLS[0]!;
  const gStyle: React.CSSProperties = glowing ? { animation: (id === 'SCATTER' ? 'scatterPulse' : 'symbolGlow') + ' 0.9s ease-in-out infinite', color: sym.color } : {};
  const s = size;
  const wrap: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: s, height: s, borderRadius: '50%', overflow: 'hidden', ...gStyle };

  if (imageSrc) {
    return (
      <div style={wrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={sym.name} width={s} height={s} style={{ objectFit: 'cover', width: s, height: s }}/>
      </div>
    );
  }

  // Generic fallback if an image path is ever missing — keeps the reel from breaking.
  return (
    <div style={wrap}>
      <svg width={s} height={s} viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="40" fill={sym.color} opacity="0.85"/>
        <text x="45" y="52" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0a0500" fontFamily="Cinzel,serif">{sym.name[0]}</text>
      </svg>
    </div>
  );
}

/* ─── PARTICLES (coin burst / glow embers) ───────────────────────────────────── */
interface Particle { id:number; x:number; y:number; vx:number; vy:number; rot:number; vrot:number; color:string; size:number; life:number; maxLife:number; shape:string; }
function ParticleSystem({ active, tier, centerX, centerY }: { active:boolean; tier:string; centerX:number; centerY:number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const count = tier==='mega'?180:tier==='big'?100:tier==='medium'?50:25;
    const colors = tier==='mega'?['#f4c430','#ffe066','#c8921a','#1abc9c','#c0392b']:tier==='big'?['#f4c430','#ffe066','#c8921a','#fbbf24']:tier==='medium'?['#1abc9c','#6ee7b7','#c4b5fd']:['#f5ecd8','#d4af37','#8a7a5c'];
    const shapes = ['coin','circle','glow'];
    setParticles(Array.from({length:count},() => {
      const angle = (Math.random()*360)*Math.PI/180;
      const speed = 3+Math.random()*8;
      return { id:nextId.current++, x:centerX+(Math.random()-0.5)*60, y:centerY+(Math.random()-0.5)*60, vx:Math.cos(angle)*speed*(0.5+Math.random()), vy:Math.sin(angle)*speed-5-Math.random()*5, rot:Math.random()*360, vrot:(Math.random()-0.5)*15, color:colors[Math.floor(Math.random()*colors.length)]!, size:6+Math.random()*10, life:1, maxLife:60+Math.floor(Math.random()*80), shape:shapes[Math.floor(Math.random()*shapes.length)]! };
    }));
    const tick = () => {
      setParticles(prev => {
        if (prev.length === 0) return prev;
        return prev.map(p => ({ ...p, x:p.x+p.vx, y:p.y+p.vy, vy:p.vy+0.35, vx:p.vx*0.98, rot:p.rot+p.vrot, life:p.life-(1/p.maxLife) })).filter(p => p.life > 0);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [active, tier, centerX, centerY]);

  if (!active && particles.length === 0) return null;
  const coinImg = getPQAsset('coin_cluster');
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,overflow:'hidden'}}>
      {particles.map(p => {
        const sz = p.size*(0.2+p.life*0.8)*(p.shape==='coin'?2.4:1);
        const isCoin = p.shape === 'coin' && coinImg;
        return (
          <div key={p.id} style={{
            position:'absolute', left:p.x, top:p.y, width:sz, height:sz, opacity:p.life,
            transform:`rotate(${p.rot}deg) translate(-50%,-50%) ${isCoin ? `scaleX(${Math.cos(p.rot*0.09)})` : ''}`,
            background: isCoin ? `url(${coinImg}) center/cover` : (p.shape === 'glow' ? `radial-gradient(circle,${p.color},transparent)` : p.color),
            borderRadius: isCoin ? '6px' : '50%',
            boxShadow: isCoin ? `0 0 ${sz*0.6}px #f4c43099` : `0 0 ${sz*1.5}px ${p.color}88`,
          }}/>
        );
      })}
    </div>
  );
}

/* ─── REEL STRIP (TOP-TO-BOTTOM) ─────────────────────────────────────────────── */
const BUF      = 3;
const PRE_LEN  = 40;
const SYMBOL_H = 100;
const VISIBLE  = 3;
const FINAL_Y  = -(BUF * SYMBOL_H);
const LOOP_PT  = -(BUF + VISIBLE) * SYMBOL_H;
const LOOP_PERIOD = PRE_LEN * SYMBOL_H - SYMBOL_H;
const SNAP_Y   = -(BUF + VISIBLE + 1) * SYMBOL_H;
const SPIN_START = -((BUF + PRE_LEN - 1) * SYMBOL_H);

function ReelStrip({ reelSymbols, result, isSpinning, stopDelay, onStopped, winningRows, anticipation }: {
  reelSymbols: string[]; result: string[]; isSpinning: boolean; stopDelay: number;
  onStopped: () => void; winningRows: number[]; anticipation: boolean;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);
  const posRef    = useRef(FINAL_Y);
  const phaseRef  = useRef<'idle'|'spinning'|'landing'>('idle');
  const rafRef    = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const onStopped$ = useRef(onStopped);
  onStopped$.current = onStopped;

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
        applyPos(FINAL_Y, 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.32s ease-out', 'none');

        setTimeout(() => {
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
      background:`linear-gradient(180deg,${C.reelBg} 0%,#120a02 50%,${C.reelBg} 100%)`,
      borderRadius:8,
      boxShadow: anticipation
        ? `inset 0 0 24px #00000099, 0 0 18px ${C.gold}aa, inset 0 0 16px ${C.gold}44`
        : 'inset 0 0 24px #00000099, inset 0 2px 0 #d4af3722, inset 0 -2px 0 #d4af3722',
      transition:'box-shadow 0.3s',
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:30,background:'linear-gradient(180deg,#0a0500cc,transparent)',zIndex:10,pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:30,background:'linear-gradient(0deg,#0a0500cc,transparent)',zIndex:10,pointerEvents:'none'}}/>

      <div ref={stripRef} style={{willChange:'transform', transform:`translateY(${FINAL_Y}px)`}}>
        {strip.map((symId, i) => {
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
              <SymbolArt id={symId} size={88} glowing={isWin} imageSrc={getPQSymbolImage(symId)}/>
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
  const colors = ['#f4c430','#1abc9c','#c0392b','#6d28d9','#34d399','#ff8c00','#93c5fd','#f9a8d4'];
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

/* ─── AMBIENT BACKGROUND: embers + golden light rays ─────────────────────────── */
function EmberField() {
  const embers = useMemo(() => Array.from({length:50},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:0.6+Math.random()*2.2, dur:11+Math.random()*20, delay:-Math.random()*20,
    sx:`${(Math.random()-0.5)*40}px`, so:0.15+Math.random()*0.6,
  })), []);
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {/* Dark vignette */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 30%,transparent 40%,#05030066 85%,#050300cc 100%)'}}/>
      {/* Golden light rays */}
      <div style={{position:'absolute',top:'-20%',left:'50%',width:'160%',height:'140%',transform:'translateX(-50%)',background:'repeating-conic-gradient(from 0deg at 50% 0%, transparent 0deg, #f4c43012 4deg, transparent 8deg)',animation:'rayDrift 8s ease-in-out infinite',mixBlendMode:'screen'}}/>
      {embers.map(s => (
        <div key={s.id} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,borderRadius:'50%',background:'#f4c430',boxShadow:'0 0 4px #f4c430',opacity:s.so,'--sx':s.sx,'--so':s.so,animation:`emberDrift ${s.dur}s ${s.delay}s linear infinite`} as React.CSSProperties}/>
      ))}
    </div>
  );
}

/* ─── BIG WIN OVERLAY (uses FX pack banners) ─────────────────────────────────── */
const WIN_TIER_CFG: Record<string,{label:string;banner:string|null;glow:string;bg:string}> = {
  medium:  { label:'WIN',       banner:getPQAsset('win_banner'),       glow:'#f4c430', bg:'radial-gradient(ellipse at center,#1c1200dd,#0a050099)' },
  big:     { label:'BIG WIN',   banner:getPQAsset('big_win_banner'),   glow:'#f4c430', bg:'radial-gradient(ellipse at center,#1c1200cc,#0a050099)' },
  epic:    { label:'EPIC WIN',  banner:getPQAsset('epic_win_banner'),  glow:'#6d28d9', bg:'radial-gradient(ellipse at center,#1a0022dd,#0a050099)' },
  mega:    { label:'MEGA WIN',  banner:getPQAsset('mega_win_banner'),  glow:'#c0392b', bg:'radial-gradient(ellipse at center,#220a00dd,#0a050099)' },
  jackpot: { label:'JACKPOT!',  banner:getPQAsset('jackpot_banner'),   glow:'#ffe066', bg:'radial-gradient(ellipse at center,#241800ee,#0a050099)' },
};
function BigWinOverlay({ tier, amount, onClose }: { tier:string; amount:number; onClose:()=>void }) {
  const cfg = WIN_TIER_CFG[tier] ?? WIN_TIER_CFG['big']!;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9000,background:cfg.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',backdropFilter:'blur(6px)'}}>
      {cfg.banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cfg.banner} alt={cfg.label} style={{maxWidth:'min(560px,86vw)',filter:`drop-shadow(0 0 32px ${cfg.glow})`,animation:'bigWinText 0.8s cubic-bezier(0.34,1.56,0.64,1) both'}}/>
      ) : (
        <div style={{fontSize:'clamp(36px,7vw,82px)',fontWeight:900,fontFamily:'Cinzel,serif',color:cfg.glow,textAlign:'center',filter:`drop-shadow(0 0 28px ${cfg.glow})`}}>{cfg.label}</div>
      )}
      <div style={{fontSize:'clamp(24px,5vw,60px)',fontWeight:900,fontFamily:'Outfit,sans-serif',color:C.goldBright,marginTop:16,animation:'winAmount 0.6s 0.4s both',textShadow:`0 0 28px ${C.goldBright}, 0 0 56px ${cfg.glow}`}}>
        +{amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
      </div>
      <div style={{color:C.textDim,marginTop:24,fontSize:14,fontFamily:'Outfit,sans-serif',letterSpacing:2}}>TAP TO CONTINUE</div>
    </div>
  );
}

/* ─── FREE SPINS INTRO SCREEN ─────────────────────────────────────────────────── */
function FreeSpinsIntro({ count, onClose }: { count:number; onClose:()=>void }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9100,background:'radial-gradient(ellipse at center,#1c1200ee,#0a0500dd)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)'}}>
      <div style={{fontSize:12,letterSpacing:6,color:C.teal,fontWeight:800,textTransform:'uppercase',marginBottom:8}}>The Scarabs Have Aligned</div>
      <div style={{fontSize:'clamp(32px,6vw,64px)',fontWeight:900,fontFamily:'Cinzel,serif',color:C.goldBright,textShadow:`0 0 24px ${C.gold}`,animation:'bigWinText 0.7s cubic-bezier(0.34,1.56,0.64,1) both'}}>FREE SPINS</div>
      <div style={{fontSize:'clamp(48px,9vw,110px)',fontWeight:900,color:C.text,margin:'8px 0',textShadow:`0 0 20px ${C.gold}88`}}>{count}</div>
      <button onClick={onClose} style={{marginTop:20,padding:'14px 44px',borderRadius:14,background:C.btnGrad,border:`2px solid ${C.teal}`,color:'#04140f',fontWeight:900,fontSize:16,letterSpacing:3,textTransform:'uppercase',cursor:'pointer'}}>Enter the Tomb</button>
    </div>
  );
}

/* ─── GAMBLE PANEL (presentation-only — never mutates real balance) ─────────── */
function GamblePanel({ onClose }: { onClose:()=>void }) {
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'red'|'green'|null>(null);
  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    setTimeout(() => {
      setResult(cryptoRand() > 0.5 ? 'green' : 'red');
      setFlipping(false);
    }, 900);
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:9200,background:'rgba(5,3,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{width:'min(420px,90vw)',background:'linear-gradient(180deg,#1c1200,#0a0500)',border:`2px solid ${C.gold}55`,borderRadius:20,padding:28,textAlign:'center',boxShadow:`0 0 60px ${C.gold}22`}}>
        <div style={{fontSize:11,letterSpacing:3,color:C.textDim,textTransform:'uppercase',marginBottom:4}}>Gamble Feature</div>
        <div style={{fontSize:20,fontWeight:900,color:C.goldBright,fontFamily:'Cinzel,serif',marginBottom:16}}>Double or Nothing</div>
        <div style={{fontSize:11,color:C.textDim,marginBottom:20,lineHeight:1.5}}>Demo preview only — your real balance is settled server-side and is never changed by this screen.</div>
        <div style={{width:100,height:100,margin:'0 auto 20px',borderRadius:'50%',position:'relative',perspective:600}}>
          <div style={{
            width:'100%',height:'100%',borderRadius:'50%',
            background: result === 'green' ? `radial-gradient(circle,${C.green},#0d5c4c)` : result === 'red' ? `radial-gradient(circle,${C.red},#5c1810)` : `radial-gradient(circle,${C.gold},#5c4108)`,
            border:'3px solid #f5ecd8', display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:900, fontSize:14, color:'#fff', textTransform:'uppercase', letterSpacing:1,
            animation: flipping ? 'coinFlip 0.9s ease-in-out' : 'none',
            boxShadow:`0 0 30px ${result === 'green' ? C.green : result === 'red' ? C.red : C.gold}66`,
          }}>
            {flipping ? '' : result ? result : 'PICK'}
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:16}}>
          <button onClick={flip} disabled={flipping} style={{flex:1,padding:'12px 0',borderRadius:12,background:C.green,border:'none',color:'#04140f',fontWeight:800,cursor:flipping?'not-allowed':'pointer',opacity:flipping?0.6:1,letterSpacing:1,textTransform:'uppercase'}}>Green</button>
          <button onClick={flip} disabled={flipping} style={{flex:1,padding:'12px 0',borderRadius:12,background:C.red,border:'none',color:'#fff',fontWeight:800,cursor:flipping?'not-allowed':'pointer',opacity:flipping?0.6:1,letterSpacing:1,textTransform:'uppercase'}}>Red</button>
        </div>
        <button onClick={onClose} style={{padding:'10px 28px',borderRadius:12,background:'transparent',border:`1px solid ${C.cardBorder}`,color:C.textDim,cursor:'pointer',fontSize:12,letterSpacing:2,textTransform:'uppercase'}}>Collect &amp; Close</button>
      </div>
    </div>
  );
}

/* ─── SETTINGS POPUP ──────────────────────────────────────────────────────────── */
function SettingsPopup({ volume, onVolume, muted, onMute, turbo, onTurbo, onClose }: {
  volume:number; onVolume:(v:number)=>void; muted:boolean; onMute:(m:boolean)=>void; turbo:boolean; onTurbo:(t:boolean)=>void; onClose:()=>void;
}) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:9200,background:'rgba(5,3,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{width:'min(360px,90vw)',background:'linear-gradient(180deg,#1c1200,#0a0500)',border:`2px solid ${C.gold}55`,borderRadius:20,padding:24}}>
        <div style={{fontSize:16,fontWeight:900,color:C.goldBright,fontFamily:'Cinzel,serif',textAlign:'center',marginBottom:18}}>Settings</div>
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.textDim,textTransform:'uppercase',letterSpacing:2,marginBottom:6}}>
            <span>Volume</span><span>{Math.round(volume*100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => onVolume(parseFloat(e.target.value))} style={{width:'100%',accentColor:C.goldBright}}/>
        </div>
        <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderTop:`1px solid ${C.cardBorder}`,cursor:'pointer'}}>
          <span style={{fontSize:13,color:C.text}}>Mute All Sound</span>
          <input type="checkbox" checked={muted} onChange={e => onMute(e.target.checked)} style={{accentColor:C.goldBright,width:18,height:18}}/>
        </label>
        <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderTop:`1px solid ${C.cardBorder}`,cursor:'pointer'}}>
          <span style={{fontSize:13,color:C.text}}>Turbo Spin</span>
          <input type="checkbox" checked={turbo} onChange={e => onTurbo(e.target.checked)} style={{accentColor:C.goldBright,width:18,height:18}}/>
        </label>
        <button onClick={onClose} style={{marginTop:16,width:'100%',padding:'12px 0',borderRadius:12,background:C.btnGrad,border:`2px solid ${C.teal}`,color:'#04140f',fontWeight:800,cursor:'pointer',letterSpacing:2,textTransform:'uppercase'}}>Done</button>
      </div>
    </div>
  );
}

/* ─── PROGRESSIVE JACKPOT DISPLAY ─────────────────────────────────────────────── */
interface JackpotTier { key:string; label:string; value:number; color:string; step:[number,number]; }
function ProgressiveJackpotDisplay({ tiers }: { tiers: JackpotTier[] }) {
  return (
    <div style={{width:'100%',maxWidth:800,display:'flex',gap:6,flexWrap:'wrap'}}>
      {tiers.map(t => (
        <div key={t.key} style={{
          flex:'1 1 150px', minWidth:130,
          background:'linear-gradient(135deg,#1c1200,#0e0a00)',
          border:`1px solid ${t.color}55`, borderRadius:12, padding:'8px 14px', textAlign:'center',
          boxShadow:`0 0 16px ${t.color}18`,
        }}>
          <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>{t.label}</div>
          <div style={{fontSize:'clamp(14px,2.2vw,20px)',fontWeight:900,color:t.color,animation:'jackpotPulse 2.2s ease-in-out infinite',fontVariantNumeric:'tabular-nums'}}>
            ${t.value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────── */
const BET_OPTIONS = [1,2,5,10,25,50,100,500];
const soundEngine = new SoundEngine();

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function PyramidQuestPage() {
  const [balance, setBalance]         = useState(1000);
  const [bet, setBet]                 = useState(1);
  const [betIdx, setBetIdx]           = useState(0);
  const [spinning, setSpinning]       = useState(false);
  const [reelResults, setReelResults] = useState<string[][]>([
    ['THOTH','PHARAOH','SPHINX'],['ANUBIS','BASTET','HORUS'],['PHARAOH','THOTH','CARTOUCHE'],
    ['SPHINX','CROOK','PHARAOH'],['CARTOUCHE','THOTH','BASTET'],
  ]);
  const [winData, setWinData]         = useState<{payout:number;winLines:number[];winTier:string}|null>(null);
  const [showWin, setShowWin]         = useState(false);
  const [displayPayout, setDisplayPayout] = useState(0);
  const [particles, setParticles]     = useState(false);
  const [bigWin, setBigWin]           = useState(false);
  const [freeSpins, setFreeSpins]     = useState(0);
  const [showFreeSpinsIntro, setShowFreeSpinsIntro] = useState(false);
  const [jackpots, setJackpots]       = useState<JackpotTier[]>([
    { key:'mini',  label:'Mini',  value:1284.20,   color:C.teal,   step:[0.01,0.05] },
    { key:'minor', label:'Minor', value:8420.75,   color:'#93c5fd',step:[0.05,0.2] },
    { key:'major', label:'Major', value:47382.50,  color:C.gold,   step:[0.2,0.8] },
    { key:'grand', label:'Grand', value:250000.00, color:'#c0392b',step:[1,4] },
  ]);
  const [volume, setVolume]           = useState(0.6);
  const [muted, setMuted]             = useState(false);
  const [autoSpin, setAutoSpin]       = useState(false);
  const [turbo, setTurbo]             = useState(false);
  const [history, setHistory]         = useState<{payout:number;tier:string;bet:number}[]>([]);
  const [winCount, setWinCount]       = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGamble, setShowGamble]   = useState(false);
  const [anticipation, setAnticipation] = useState(false);
  const [pendingResult, setPendingResult] = useState<string[][]|null>(null);
  const [apiMode, setApiMode]         = useState(false);

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
  useEffect(() => { soundEngine.setMuted(muted); },     [muted]);

  // Progressive jackpot ticker — frontend animation only, does not affect server payouts
  useEffect(() => {
    const id = setInterval(() => {
      setJackpots(prev => prev.map(t => ({ ...t, value: parseFloat((t.value + t.step[0] + Math.random() * (t.step[1]-t.step[0])).toFixed(2)) })));
    }, 350);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    tokenRef.current = token;
    userApi.getWallet(token)
      .then(w => { setBalance(parseFloat(w.balance)); setApiMode(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    gameApi.getJackpot()
      .then(r => setJackpots(prev => prev.map((t,i) => i === 2 ? { ...t, value: parseFloat(r.amount) } : t)))
      .catch(() => {});
  }, []);

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

  const handleReelStop = useCallback((col: number) => {
    soundEngine.playReel(col);
    stoppedCountRef.current++;
    if (stoppedCountRef.current === 4) {
      // Anticipation glow on the final reel when 2+ scatters have already landed
      const result = pendingResultRef.current;
      if (result) {
        const scatSoFar = result.slice(0, 4).flat().filter(s => s === 'SCATTER').length;
        if (scatSoFar >= 2) setAnticipation(true);
      }
    }
    if (stoppedCountRef.current < 5) return;
    setAnticipation(false);

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
        soundEngine.playJackpot();
        const awarded = serverWin?.freeSpins ?? 8;
        setFreeSpins(f => f + awarded);
        setShowFreeSpinsIntro(true);
      }
      setWinCount(n => n + 1);
      setTimeout(() => setParticles(false), 4000);
    }

    setHistory(h => [{ payout: evaluation.payout, tier: evaluation.winTier, bet: betNow }, ...h].slice(0, 10));
    setSpinning(false);
    spinRef.current = false;

    const tok = tokenRef.current;
    if (tok) userApi.getWallet(tok).then(w => setBalance(parseFloat(w.balance))).catch(() => {});
  }, []);

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
    setAnticipation(false);
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
        const jackpotPay = res.jackpotAmount ?? jackpots[2]!.value;
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
          gameApi.getJackpot().then(r => setJackpots(prev => prev.map((t,i) => i === 2 ? { ...t, value: parseFloat(r.amount) } : t))).catch(() => {});
        }
      } catch { /* keep local result */ }
    }
  }, [initSound, apiMode, jackpots]);

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
      <EmberField/>
      <ParticleSystem active={particles} tier={winData?.winTier ?? 'small'}
        centerX={typeof window !== 'undefined' ? window.innerWidth/2 : 400}
        centerY={typeof window !== 'undefined' ? window.innerHeight/2 : 300}/>
      {isBigWin && winData && (
        <BigWinOverlay tier={winData.winTier} amount={winData.payout} onClose={() => setBigWin(false)}/>
      )}
      {showFreeSpinsIntro && (
        <FreeSpinsIntro count={freeSpins} onClose={() => setShowFreeSpinsIntro(false)}/>
      )}
      {showGamble && <GamblePanel onClose={() => setShowGamble(false)}/>}
      {showSettings && (
        <SettingsPopup volume={volume} onVolume={setVolume} muted={muted} onMute={setMuted} turbo={turbo} onTurbo={setTurbo} onClose={() => setShowSettings(false)}/>
      )}

      <div style={{
        minHeight:'100vh', position:'relative', zIndex:1,
        background: isFreeSpinBg
          ? 'linear-gradient(135deg,#241800,#0d1500,#001a14,#241800)'
          : (getPQAsset('background')
              ? `url(${getPQAsset('background')}) center/cover no-repeat`
              : 'radial-gradient(ellipse at 50% 0%,#1c1200 0%,#0a0500 65%)'),
        backgroundSize: isFreeSpinBg ? '400% 400%' : 'cover',
        animation: isFreeSpinBg ? 'freeSpinBg 3s ease infinite' : (isBigWin ? 'screenShake 0.6s ease-out' : 'none'),
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'12px 16px 24px', gap:12,
        fontFamily:'Outfit,sans-serif',
      }}>

        {/* HEADER */}
        <div style={{width:'100%',maxWidth:800,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
          <div style={{lineHeight:1}}>
            {getPQAsset('logo') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getPQAsset('logo')!} alt="Pyramid Quest" style={{height:56,display:'block'}}/>
            ) : (
              <>
                <span style={{fontSize:'clamp(18px,3vw,28px)',fontWeight:900,fontFamily:'Cinzel,serif',background:'linear-gradient(90deg,#8a5e10,#f4c430,#ffe066,#d4af37,#8a5e10)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'logoShimmer 3s linear infinite',letterSpacing:1,display:'block'}}>PYRAMID QUEST</span>
                <span style={{fontSize:'clamp(8px,1.5vw,10px)',color:C.textDim,letterSpacing:4,textTransform:'uppercase',fontWeight:700}}>Premium Slots</span>
              </>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{background:'linear-gradient(135deg,#1c1200,#241800)',border:`1px solid ${C.gold}44`,borderRadius:10,padding:'6px 18px',textAlign:'center',boxShadow:`0 0 16px ${C.gold}20`}}>
              <div style={{fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:3,fontWeight:700}}>Balance</div>
              <div style={{fontSize:22,fontWeight:900,color:C.goldBright,lineHeight:1.1,textShadow:`0 0 12px ${C.gold}88`}}>${balance.toFixed(2)}</div>
            </div>
            <button onClick={() => { initSound(); soundEngine.playButtonClick(); setShowGamble(true); }}
              title="Gamble"
              style={{width:88,height:38,borderRadius:10,border:`1px solid ${C.cardBorder}`,background:`url(${getPQAsset('gamble_button')}) center/contain no-repeat, ${C.card}`,cursor:'pointer'}}/>
            <button onClick={() => { initSound(); soundEngine.playButtonClick(); setShowSettings(true); }}
              title="Settings"
              style={{width:38,height:38,borderRadius:10,border:`1px solid ${C.cardBorder}`,background:C.card,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:6}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPQAsset('settings_icon')!} alt="Settings" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
            </button>
          </div>
        </div>

        {/* PROGRESSIVE JACKPOT DISPLAY */}
        <ProgressiveJackpotDisplay tiers={jackpots}/>

        {freeSpins > 0 && (
          <div style={{background:C.btnGrad,borderRadius:20,padding:'6px 20px',fontSize:14,fontWeight:800,color:'#04140f',boxShadow:`0 0 18px ${C.teal}aa`,animation:'wiggle 0.5s ease-in-out infinite'}}>
            FREE SPINS: {freeSpins} REMAINING
          </div>
        )}

        {/* REEL CABINET */}
        <div className="pq-reel-outer" style={{width:'100%',maxWidth:800,position:'relative'}}>
          <div style={{
            background:'linear-gradient(180deg,#1c1200 0%,#0a0500 100%)',
            border:`2px solid ${C.gold}66`,
            borderRadius:18,
            padding:'18px 14px 14px',
            boxShadow:`0 0 40px #00000088, 0 0 0 1px ${C.gold}22, inset 0 0 30px #00000099`,
            position:'relative',
            overflow:'hidden',
          }}>
            {([
              [8,8,true,false,true,false],
              [8,8,true,false,false,true],
              [8,8,false,true,true,false],
              [8,8,false,true,false,true],
            ] as [number,number,boolean,boolean,boolean,boolean][]).map(([t,r,isTop,isBot,isLeft,isRight],i) => (
              <div key={i} style={{position:'absolute',top:isTop?t:'auto',bottom:isBot?t:'auto',left:isLeft?r:'auto',right:isRight?r:'auto',width:22,height:22,borderTop:isTop?`2px solid ${C.gold}`:'none',borderBottom:isBot?`2px solid ${C.gold}`:'none',borderLeft:isLeft?`2px solid ${C.gold}`:'none',borderRight:isRight?`2px solid ${C.gold}`:'none',borderRadius:isTop&&isLeft?'4px 0 0 0':isTop&&isRight?'0 4px 0 0':isBot&&isLeft?'0 0 0 4px':'0 0 4px 0'}}/>
            ))}

            <div style={{textAlign:'center',marginBottom:12,letterSpacing:6,fontSize:10,fontWeight:800,color:C.gold,textTransform:'uppercase',textShadow:`0 0 8px ${C.gold}88`,opacity:0.7,fontFamily:'Cinzel,serif'}}>
              ◆ PYRAMID QUEST ◆
            </div>

            <div style={{
              border:`2px solid ${C.gold}`,
              borderRadius:12,
              padding:3,
              boxShadow:`0 0 16px ${C.gold}33, inset 0 0 16px #00000066, 0 0 0 1px ${C.bronze}33`,
              background:'#08050a',
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
                      anticipation={anticipation && col === 4}
                    />
                  </div>
                ))}
              </div>
            </div>

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
            background:'linear-gradient(135deg,#1c1200,#241800)',
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
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>${bet.toFixed(2)}</div>
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
        <div style={{width:'100%',maxWidth:800,background:'linear-gradient(180deg,#1c1200,#0a0500)',border:`1px solid ${C.cardBorder}`,borderRadius:16,padding:'16px 20px',boxShadow:'0 -2px 20px #00000066'}}>
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
                  background: autoSpin?`${C.teal}20`:C.surface,
                  color:autoSpin?C.teal:C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'
                }}>
                {autoSpin?'Stop Auto':'Auto'}
              </button>
              <button onClick={() => { initSound(); soundEngine.playButtonClick(); setTurbo(t => !t); }}
                style={{
                  padding:'6px 16px',borderRadius:10,
                  border:`1px solid ${turbo?C.red:C.cardBorder}`,
                  background: turbo?`${C.red}20`:C.surface,
                  color:turbo?'#e57368':C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'
                }}>Turbo</button>
            </div>
          </div>

          {/* Spin button — default / hover / pressed / disabled / spinning states */}
          {(() => {
            const idle = !spinning && freeSpins === 0 && balance >= bet;
            const label = spinning ? null : freeSpins > 0 ? `FREE SPIN (${freeSpins})` : balance < bet ? 'INSUFFICIENT FUNDS' : null;
            return (
              <div style={{display:'flex',justifyContent:'center'}}>
                <button
                  onClick={() => { initSound(); if (!spinRef.current) effectiveSpin(); }}
                  onMouseDown={e => { if (!spinning) e.currentTarget.style.transform = 'scale(0.96)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  disabled={spinning}
                  style={{
                    width:'min(260px,70%)',height:78,borderRadius:16,
                    background: idle
                      ? `url(${getPQAsset('spin_button')}) center/contain no-repeat, ${C.btnGrad}`
                      : spinning ? 'linear-gradient(135deg,#1c1200,#0a0500)' : C.btnGrad,
                    border: spinning ? `2px solid ${C.cardBorder}` : `2px solid ${C.gold}`,
                    color: spinning ? C.textDim : '#04140f',
                    fontSize:'clamp(14px,2.4vw,18px)',fontWeight:900,
                    cursor: spinning ? 'not-allowed' : 'pointer',
                    letterSpacing:3,textTransform:'uppercase',
                    animation: spinning ? 'none' : 'spinButtonPulse 2.2s ease-in-out infinite',
                    transition:'background 0.3s, color 0.3s, border-color 0.3s, transform 0.12s',
                    boxShadow: spinning ? 'none' : `0 0 24px ${C.gold}66, 0 4px 16px #00000088, inset 0 1px 0 #ffe06666`,
                  }}>
                  {spinning ? (
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
                      <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite'}}>◈</span>
                      SPINNING
                      <span style={{display:'inline-block',animation:'coinSpin 0.5s linear infinite reverse'}}>◈</span>
                    </span>
                  ) : label}
                </button>
              </div>
            );
          })()}
        </div>

        {/* BOTTOM INFO */}
        <div style={{width:'100%',maxWidth:800,display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => { initSound(); soundEngine.playButtonClick(); setShowPaytable(p => !p); }}
            style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:showPaytable?`${C.gold}18`:C.card,border:`1px solid ${showPaytable?C.gold:C.cardBorder}`,color:showPaytable?C.goldBright:C.textDim,cursor:'pointer',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',transition:'all 0.2s'}}>Paytable</button>
          <div style={{flex:1,minWidth:120,padding:'8px 12px',borderRadius:10,background:C.card,border:`1px solid ${C.cardBorder}`,color:C.textDim,fontSize:11,fontWeight:600,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span style={{color:C.teal}}>◆</span><span>{winCount} wins</span><span style={{color:C.gold}}>◆</span><span>20 lines</span>
          </div>
          <div style={{flex:2,minWidth:200,borderRadius:10,overflow:'hidden',background:C.card,border:`1px solid ${C.cardBorder}`}}>
            <div style={{padding:'4px 10px',background:'#1c1200',borderBottom:`1px solid ${C.cardBorder}`,fontSize:9,color:C.textDim,textTransform:'uppercase',letterSpacing:2,fontWeight:700}}>Last Spins</div>
            <div style={{display:'flex',gap:2,padding:'4px 6px',overflowX:'auto'}}>
              {history.slice(0,8).map((h,i)=>(
                <div key={i} style={{flex:'0 0 auto',width:28,height:28,borderRadius:6,background:h.payout>0?(h.tier==='mega'||h.tier==='big'?`${C.gold}30`:h.tier==='medium'?`${C.teal}20`:'#ffffff0e'):'#c0392b11',border:`1px solid ${h.payout>0?(h.tier==='mega'||h.tier==='big'?C.gold:h.tier==='medium'?C.teal:'#ffffff33'):'#c0392b44'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:h.payout>0?(h.tier==='mega'||h.tier==='big'?C.goldBright:h.tier==='medium'?C.teal:C.textDim):'#e57368',animation:'historySlide 0.3s ease both'}}>
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
            <div style={{fontSize:12,fontWeight:800,color:C.goldBright,textTransform:'uppercase',letterSpacing:3,marginBottom:12,textAlign:'center',textShadow:`0 0 8px ${C.gold}66`,fontFamily:'Cinzel,serif'}}>Paytable — Pyramid Quest</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:6}}>
              {SYMBOLS.map(sym=>(
                <div key={sym.id} style={{display:'flex',alignItems:'center',gap:8,background:C.surface,borderRadius:10,padding:'6px 10px',border:`1px solid ${sym.color}28`}}>
                  <SymbolArt id={sym.id} size={40} imageSrc={getPQSymbolImage(sym.id)}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:sym.color}}>{sym.name}</div>
                    <div style={{fontSize:10,color:C.textDim}}>{sym.payouts.map((p,i)=>p>0?`${i+1}×${p}`:null).filter(Boolean).join(' | ')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:'8px 12px',background:'#08050a',borderRadius:10,border:`1px solid ${C.teal}28`,textAlign:'center'}}>
              <span style={{fontSize:11,color:C.teal,fontWeight:700}}>3+ SCATTER = 8 FREE SPINS • Ankh of Ra substitutes all symbols</span>
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
