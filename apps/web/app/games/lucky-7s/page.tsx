'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg: '#04080f',
  surface: '#070d1a',
  card: '#0b1222',
  navy: '#0a1628',
  gold: '#d4a848',
  goldBright: '#f4c430',
  neonRed: '#ff2233',
  neonRedDim: '#cc1122',
  cyan: '#00d4c8',
  yellow: '#ffe033',
  orange: '#ff8c00',
  text: '#f0eaf8',
  textDim: '#6a7a9a',
  border: '#1a2a44',
  green: '#00cc66',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #04080f; font-family: 'Outfit', sans-serif; min-height: 100vh; }

@keyframes neonFlicker {
  0%,19%,21%,23%,25%,54%,56%,100% { text-shadow: 0 0 10px #ff2233, 0 0 20px #ff2233, 0 0 40px #ff2233, 0 0 80px #ff1122; opacity: 1; }
  20%,24%,55% { text-shadow: none; opacity: 0.85; }
}
@keyframes neonPulse {
  0%,100% { box-shadow: 0 0 12px #ff223355, 0 0 24px #ff223322; }
  50%      { box-shadow: 0 0 24px #ff2233aa, 0 0 48px #ff223355; }
}
@keyframes goldPulse {
  0%,100% { box-shadow: 0 0 16px #d4a84866, 0 0 32px #f4c43033; }
  50%      { box-shadow: 0 0 32px #d4a848cc, 0 0 64px #f4c43077; }
}
@keyframes spinButtonIdle {
  0%,100% { box-shadow: 0 4px 32px #d4a84877, 0 0 64px #f4c43033, inset 0 1px 0 #ffe06655; }
  50%      { box-shadow: 0 4px 48px #d4a848bb, 0 0 96px #f4c43066, inset 0 1px 0 #ffe06699; }
}
@keyframes reelSpin {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-800px); }
}
@keyframes reelBounce {
  0%   { transform: translateY(0); }
  35%  { transform: translateY(-12px); }
  65%  { transform: translateY(5px); }
  80%  { transform: translateY(-4px); }
  90%  { transform: translateY(2px); }
  100% { transform: translateY(0); }
}
@keyframes winGlow {
  0%,100% { filter: drop-shadow(0 0 8px currentColor) brightness(1.2); }
  50%      { filter: drop-shadow(0 0 24px currentColor) brightness(1.8); }
}
@keyframes coinFall {
  0%   { transform: translateY(-80px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
@keyframes winAmountPop {
  0%   { transform: scale(0.3) rotate(-8deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes paylinePulse {
  0%,100% { background: #ff223322; border-color: #ff2233; }
  50%      { background: #ff223344; border-color: #ff4455; }
}
@keyframes scanline {
  0%   { background-position: 0 0; }
  100% { background-position: 0 100px; }
}
@keyframes bgFlicker {
  0%,100% { opacity: 0.03; }
  50%      { opacity: 0.06; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fadeInUp {
  from { opacity:0; transform: translateY(24px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes loadingDot {
  0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
  40%         { transform: scale(1); opacity: 1; }
}
@keyframes diagonalScroll {
  0%   { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}
`;

/* ─── SYMBOL DEFINITIONS ─────────────────────────────────────────────────────── */
interface SymbolDef {
  id: string;
  label: string;
  color: string;
  glow: string;
  payoutTriple: number;
  payoutAny?: number;
}

const SYMBOLS: SymbolDef[] = [
  { id: 'SEVEN',  label: '7',      color: C.neonRed,  glow: '#ff4455', payoutTriple: 1000 },
  { id: 'BAR',    label: 'BAR',    color: C.gold,     glow: C.goldBright, payoutTriple: 500 },
  { id: 'CHERRY', label: '🍒',     color: '#ff3344',  glow: '#ff6677', payoutTriple: 50 },
  { id: 'BELL',   label: '🔔',     color: C.yellow,   glow: '#ffee55', payoutTriple: 25 },
  { id: 'ORANGE', label: '🍊',     color: C.orange,   glow: '#ffaa33', payoutTriple: 15 },
  { id: 'LEMON',  label: '🍋',     color: C.yellow,   glow: '#ffdd44', payoutTriple: 10 },
];

const WEIGHTS = [3, 6, 10, 15, 20, 25]; // SEVEN rarest
const TOTAL_WEIGHT = WEIGHTS.reduce((a, b) => a + b, 0);

function weightedRandom(): SymbolDef {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i]!;
    if (r <= 0) return SYMBOLS[i]!;
  }
  return SYMBOLS[SYMBOLS.length - 1]!;
}

function spinReels(): SymbolDef[] {
  return [weightedRandom(), weightedRandom(), weightedRandom()];
}

function evaluateResult(reels: SymbolDef[]): { payout: number; winType: string; multiplier: number } {
  const [a, b, c] = reels;
  // Triple match
  if (a!.id === b!.id && b!.id === c!.id) {
    return { payout: a!.payoutTriple, winType: `TRIPLE ${a!.label}`, multiplier: a!.payoutTriple };
  }
  // Any 7 (mixed)
  const sevens = reels.filter(s => s.id === 'SEVEN').length;
  if (sevens === 2) return { payout: 200, winType: 'TWO 7s', multiplier: 200 };
  if (sevens === 1) return { payout: 20, winType: 'ONE 7', multiplier: 20 };
  // Two matching
  if (a!.id === b!.id) return { payout: a!.payoutTriple / 8, winType: `PAIR ${a!.label}`, multiplier: Math.round(a!.payoutTriple / 8) };
  if (b!.id === c!.id) return { payout: b!.payoutTriple / 8, winType: `PAIR ${b!.label}`, multiplier: Math.round(b!.payoutTriple / 8) };
  return { payout: 0, winType: '', multiplier: 0 };
}

const BET_OPTIONS = [1, 5, 10, 25, 50];

/* ─── COIN PARTICLE ─────────────────────────────────────────────────────────── */
interface CoinParticle { id: number; x: number; delay: number; dur: number; size: number; }

function CoinRain({ active }: { active: boolean }) {
  const [coins, setCoins] = useState<CoinParticle[]>([]);
  useEffect(() => {
    if (!active) { setCoins([]); return; }
    setCoins(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      dur: 1.5 + Math.random() * 1.5,
      size: 12 + Math.random() * 18,
    })));
    const t = setTimeout(() => setCoins([]), 4000);
    return () => clearTimeout(t);
  }, [active]);
  if (coins.length === 0) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
      {coins.map(c => (
        <div key={c.id} style={{
          position: 'absolute', top: -60, left: `${c.x}%`,
          width: c.size, height: c.size, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${C.goldBright}, ${C.gold}, #8a5e10)`,
          boxShadow: `0 0 ${c.size * 0.8}px ${C.gold}88`,
          animation: `coinFall ${c.dur}s ${c.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

/* ─── SVG SYMBOLS ────────────────────────────────────────────────────────────── */
function SevenSymbol({ size, glowing }: { size: number; glowing?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={glowing ? { animation: 'winGlow 0.6s ease-in-out infinite', color: C.neonRed } : {}}>
      <defs>
        <linearGradient id="sg7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6677" />
          <stop offset="50%" stopColor="#ff2233" />
          <stop offset="100%" stopColor="#990011" />
        </linearGradient>
        <filter id="neonFilter7">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="12" fill="#0a0015" stroke="#ff223355" strokeWidth="1.5" />
      <text x="50" y="76" textAnchor="middle" fontSize="68" fontWeight="900"
        fill="url(#sg7)" fontFamily="Outfit,sans-serif"
        filter={glowing ? 'url(#neonFilter7)' : undefined}
        style={{ textShadow: '0 0 20px #ff2233' }}>7</text>
      <rect x="8" y="8" width="84" height="12" rx="4" fill="#ff223318" />
    </svg>
  );
}

function BarSymbol({ size, glowing }: { size: number; glowing?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={glowing ? { animation: 'winGlow 0.6s ease-in-out infinite', color: C.gold } : {}}>
      <defs>
        <linearGradient id="sgbar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="40%" stopColor="#f4c430" />
          <stop offset="100%" stopColor="#8a5e10" />
        </linearGradient>
        <linearGradient id="sgbarbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1200" />
          <stop offset="100%" stopColor="#0a0800" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="90" height="90" rx="12" fill="url(#sgbarbg)" stroke="#d4a84855" strokeWidth="1.5" />
      <rect x="12" y="34" width="76" height="14" rx="7" fill="url(#sgbar)" />
      <rect x="12" y="52" width="76" height="14" rx="7" fill="url(#sgbar)" />
      <rect x="18" y="20" width="64" height="12" rx="6" fill="url(#sgbar)" />
      <rect x="18" y="70" width="64" height="10" rx="5" fill="url(#sgbar)" opacity="0.7" />
      <text x="50" y="47" textAnchor="middle" fontSize="10" fontWeight="900"
        fill="#0a0800" fontFamily="Outfit,sans-serif" letterSpacing="2">BAR</text>
      <text x="50" y="65" textAnchor="middle" fontSize="10" fontWeight="900"
        fill="#0a0800" fontFamily="Outfit,sans-serif" letterSpacing="2">BAR</text>
    </svg>
  );
}

function EmojiSymbol({ emoji, color, glow, size, glowing }: { emoji: string; color: string; glow: string; size: number; glowing?: boolean }) {
  return (
    <div style={{
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55,
      lineHeight: 1,
      filter: glowing ? `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 24px ${glow})` : undefined,
      animation: glowing ? 'winGlow 0.6s ease-in-out infinite' : undefined,
      color,
    }}>
      {emoji}
    </div>
  );
}

function SymbolDisplay({ sym, size = 120, glowing = false }: { sym: SymbolDef; size?: number; glowing?: boolean }) {
  if (sym.id === 'SEVEN') return <SevenSymbol size={size} glowing={glowing} />;
  if (sym.id === 'BAR') return <BarSymbol size={size} glowing={glowing} />;
  return <EmojiSymbol emoji={sym.label} color={sym.color} glow={sym.glow} size={size} glowing={glowing} />;
}

/* ─── REEL COMPONENT ─────────────────────────────────────────────────────────── */
interface ReelProps {
  finalSymbol: SymbolDef;
  isSpinning: boolean;
  stopDelay: number;
  onStopped: () => void;
  isWinning: boolean;
}

function Reel({ finalSymbol, isSpinning, stopDelay, onStopped, isWinning }: ReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState<SymbolDef>(finalSymbol);
  const [spinning, setSpinning] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStoppedRef = useRef(onStopped);
  onStoppedRef.current = onStopped;

  useEffect(() => {
    if (!isSpinning) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSpinning(false);
      setBouncing(false);
      setDisplaySymbol(finalSymbol);
      return;
    }

    setSpinning(true);
    setBouncing(false);
    // Cycle through random symbols while spinning
    intervalRef.current = setInterval(() => {
      setDisplaySymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!);
    }, 80);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplaySymbol(finalSymbol);
      setSpinning(false);
      setBouncing(true);
      setTimeout(() => {
        setBouncing(false);
        onStoppedRef.current();
      }, 400);
    }, stopDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, finalSymbol, stopDelay]);

  return (
    <div style={{
      width: 150, height: 150,
      background: `linear-gradient(180deg, ${C.navy} 0%, #060e1c 100%)`,
      borderRadius: 16,
      border: `2px solid ${isWinning ? C.neonRed : C.border}`,
      boxShadow: isWinning
        ? `0 0 20px ${C.neonRed}88, 0 0 40px ${C.neonRed}44, inset 0 0 20px ${C.neonRed}11`
        : `inset 0 2px 0 #ffffff0a, inset 0 0 30px #00000066, 0 4px 16px #00000088`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      animation: bouncing ? 'reelBounce 0.4s ease-out' : undefined,
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 5px)',
        borderRadius: 14,
      }} />
      {/* Top/bottom vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
        background: 'linear-gradient(180deg, rgba(4,8,15,0.6) 0%, transparent 30%, transparent 70%, rgba(4,8,15,0.6) 100%)',
        borderRadius: 14,
      }} />
      <div style={{
        filter: spinning ? 'blur(4px) brightness(1.3)' : 'none',
        transition: spinning ? 'none' : 'filter 0.1s',
        zIndex: 6,
      }}>
        <SymbolDisplay sym={displaySymbol} size={120} glowing={isWinning && !spinning} />
      </div>
    </div>
  );
}

/* ─── PAYTABLE ───────────────────────────────────────────────────────────────── */
function PaytableRow({ label, payout, color }: { label: string; payout: string; color: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 16px', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ color, fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>{label}</span>
      <span style={{ color: C.goldBright, fontSize: 15, fontWeight: 800 }}>{payout}</span>
    </div>
  );
}

/* ─── LOADING SCREEN ─────────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: 4, color: C.neonRed,
        animation: 'neonFlicker 3s infinite', marginBottom: 24,
        textShadow: `0 0 20px ${C.neonRed}, 0 0 40px ${C.neonRed}`,
      }}>LUCKY 7s</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%', background: C.gold,
            animation: `loadingDot 1s ${i * 0.15}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function Lucky7sPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(5);
  const [reels, setReels] = useState<SymbolDef[]>([SYMBOLS[2]!, SYMBOLS[4]!, SYMBOLS[5]!]);
  const [finalReels, setFinalReels] = useState<SymbolDef[]>([SYMBOLS[2]!, SYMBOLS[4]!, SYMBOLS[5]!]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [stoppedCount, setStoppedCount] = useState(0);
  const [winResult, setWinResult] = useState<{ payout: number; winType: string; multiplier: number } | null>(null);
  const [coinRain, setCoinRain] = useState(false);
  const [lastResults, setLastResults] = useState<Array<{ symbols: string[]; win: number }>>([]);
  const [showPaytable, setShowPaytable] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning || balance < bet) return;
    setBalance(prev => prev - bet);
    setWinResult(null);
    setCoinRain(false);
    const newReels = spinReels();
    setFinalReels(newReels);
    setStoppedCount(0);
    setIsSpinning(true);
  }, [isSpinning, balance, bet]);

  // Auto-spin logic
  useEffect(() => {
    autoRef.current = autoSpin;
  }, [autoSpin]);

  const handleReelStopped = useCallback(() => {
    setStoppedCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        // All reels stopped
        setIsSpinning(false);
        setReels(prev => prev); // trigger re-render
        setTimeout(() => {
          setFinalReels(fr => {
            const result = evaluateResult(fr);
            setWinResult(result);
            if (result.payout > 0) {
              const winAmount = bet * result.multiplier;
              setBalance(b => b + winAmount);
              if (result.payout >= 100) setCoinRain(true);
              setLastResults(l => [{ symbols: fr.map(s => s.label), win: winAmount }, ...l.slice(0, 9)]);
            } else {
              setLastResults(l => [{ symbols: fr.map(s => s.label), win: 0 }, ...l.slice(0, 9)]);
            }
            // Auto-spin
            if (autoRef.current) {
              setTimeout(handleSpin, 800);
            }
            return fr;
          });
        }, 50);
      }
      return next;
    });
  }, [bet, handleSpin]);

  const STOP_DELAYS = [900, 1300, 1700];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleSpin(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin]);

  const isWinning = winResult && winResult.payout > 0;
  const isBigWin = winResult && winResult.multiplier >= 100;

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <LoadingScreen />
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(180deg, #060c1a 0%, rgba(6,12,26,0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="/lobby" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: C.textDim, textDecoration: 'none', fontSize: 13,
            fontWeight: 600, letterSpacing: 1,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = C.cyan)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textDim)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            LOBBY
          </a>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: 3,
            background: `linear-gradient(90deg, ${C.goldBright}, #fff, ${C.gold})`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
          }}>NEON PALACE</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '6px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.gold}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" stroke={C.bg} strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
          <span style={{ color: C.goldBright, fontWeight: 800, fontSize: 15 }}>${balance.toFixed(2)}</span>
        </div>
      </header>

      {/* BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Diagonal vintage lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(26,42,68,0.18) 28px, rgba(26,42,68,0.18) 30px)',
          animation: 'diagonalScroll 8s linear infinite',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: `radial-gradient(ellipse, ${C.neonRed}06 0%, transparent 70%)`,
        }} />
      </div>

      {/* COIN RAIN */}
      <CoinRain active={coinRain} />

      {/* MAIN CONTENT */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* GAME TITLE */}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900, letterSpacing: 6,
            color: C.neonRed,
            textShadow: `0 0 10px ${C.neonRed}, 0 0 20px ${C.neonRed}, 0 0 40px ${C.neonRed}88`,
            animation: 'neonFlicker 4s infinite',
            marginBottom: 4,
          }}>LUCKY 7s</h1>
          <p style={{ color: C.textDim, fontSize: 13, letterSpacing: 4, fontWeight: 600 }}>CLASSIC SLOT • 3 REELS • 1 PAYLINE</p>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* LEFT: SLOT MACHINE */}
          <div style={{ flex: '1 1 480px', maxWidth: 560 }}>
            {/* MACHINE CABINET */}
            <div style={{
              background: `linear-gradient(180deg, #080e1e 0%, ${C.navy} 50%, #060c1a 100%)`,
              border: `2px solid ${C.border}`,
              borderRadius: 24,
              boxShadow: `0 0 60px ${C.neonRed}11, 0 8px 48px #00000088, inset 0 1px 0 #ffffff08`,
              padding: 28,
              animation: 'fadeInUp 0.6s 0.1s ease-out both',
            }}>

              {/* NEON TRIM */}
              <div style={{
                height: 4, borderRadius: 2, marginBottom: 20,
                background: `linear-gradient(90deg, transparent, ${C.neonRed}, transparent)`,
                boxShadow: `0 0 12px ${C.neonRed}`,
                animation: 'neonPulse 2s ease-in-out infinite',
              }} />

              {/* BALANCE & BET DISPLAY */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'BALANCE', value: `$${balance.toFixed(2)}`, color: C.cyan },
                  { label: 'BET', value: `$${bet}`, color: C.goldBright },
                  { label: 'WIN', value: winResult && winResult.payout > 0 ? `$${(bet * winResult.multiplier).toFixed(2)}` : '$0.00', color: C.neonRed },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    flex: 1, background: '#040810', border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '8px 12px', textAlign: 'center',
                  }}>
                    <div style={{ color: C.textDim, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <div style={{ color, fontSize: 16, fontWeight: 800 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* PAYLINE INDICATOR */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginBottom: 16,
              }}>
                <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, transparent, ${C.neonRed}66)` }} />
                <span style={{ color: C.neonRed, fontSize: 10, letterSpacing: 3, fontWeight: 700,
                  textShadow: `0 0 8px ${C.neonRed}` }}>▶ PAYLINE ◀</span>
                <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${C.neonRed}66, transparent)` }} />
              </div>

              {/* REELS */}
              <div style={{
                display: 'flex', gap: 12, justifyContent: 'center',
                padding: '8px 0',
                position: 'relative',
              }}>
                {/* Payline line overlay */}
                <div style={{
                  position: 'absolute', left: 0, right: 0,
                  top: '50%', transform: 'translateY(-50%)',
                  height: 2,
                  background: `linear-gradient(90deg, transparent 4%, ${C.neonRed} 50%, transparent 96%)`,
                  boxShadow: `0 0 8px ${C.neonRed}`,
                  opacity: 0.4, pointerEvents: 'none', zIndex: 10,
                }} />
                {[0, 1, 2].map(i => (
                  <Reel
                    key={i}
                    finalSymbol={finalReels[i]!}
                    isSpinning={isSpinning}
                    stopDelay={STOP_DELAYS[i]!}
                    onStopped={handleReelStopped}
                    isWinning={!isSpinning && !!isWinning}
                  />
                ))}
              </div>

              {/* WIN DISPLAY */}
              <div style={{ minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                {isWinning && !isSpinning && (
                  <div style={{
                    textAlign: 'center',
                    animation: 'winAmountPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>
                    <div style={{
                      fontSize: isBigWin ? 28 : 22,
                      fontWeight: 900,
                      color: isBigWin ? C.goldBright : C.neonRed,
                      textShadow: isBigWin
                        ? `0 0 16px ${C.goldBright}, 0 0 32px ${C.gold}`
                        : `0 0 12px ${C.neonRed}`,
                      letterSpacing: 2,
                    }}>
                      {winResult.winType} — +${(bet * winResult.multiplier).toFixed(2)}
                    </div>
                    {isBigWin && (
                      <div style={{ fontSize: 13, color: C.textDim, letterSpacing: 3, marginTop: 4 }}>
                        🎰 {winResult.multiplier}x MULTIPLIER 🎰
                      </div>
                    )}
                  </div>
                )}
                {!isWinning && !isSpinning && winResult && (
                  <div style={{ color: C.textDim, fontSize: 14, letterSpacing: 2 }}>TRY AGAIN — SPIN TO WIN!</div>
                )}
                {isSpinning && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: C.neonRed,
                        animation: `loadingDot 0.8s ${i * 0.12}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* BET SELECTOR */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, marginBottom: 8, textAlign: 'center', fontWeight: 700 }}>SELECT BET</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {BET_OPTIONS.map(b => (
                    <button
                      key={b}
                      onClick={() => { if (!isSpinning) setBet(b); }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        border: `1.5px solid ${bet === b ? C.gold : C.border}`,
                        background: bet === b ? `${C.gold}18` : C.card,
                        color: bet === b ? C.goldBright : C.textDim,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 13, fontWeight: 800, cursor: isSpinning ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: bet === b ? `0 0 12px ${C.gold}44` : 'none',
                      }}
                    >${b}</button>
                  ))}
                </div>
              </div>

              {/* SPIN BUTTON */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || balance < bet}
                style={{
                  width: '100%', marginTop: 16,
                  padding: '18px 0', borderRadius: 14,
                  border: 'none', cursor: isSpinning || balance < bet ? 'not-allowed' : 'pointer',
                  background: isSpinning || balance < bet
                    ? 'linear-gradient(135deg, #2a3040, #1a2030)'
                    : 'linear-gradient(135deg, #8a5e10 0%, #f4c430 30%, #ffe066 50%, #d4a030 70%, #8a5e10 100%)',
                  backgroundSize: '200% auto',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 18, fontWeight: 900, letterSpacing: 4,
                  color: isSpinning || balance < bet ? C.textDim : '#0a0800',
                  animation: !isSpinning && balance >= bet ? 'spinButtonIdle 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isSpinning ? '⏳ SPINNING...' : '🎰 SPIN'}
              </button>

              {/* AUTO SPIN */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => setAutoSpin(a => !a)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10,
                    border: `1.5px solid ${autoSpin ? C.cyan : C.border}`,
                    background: autoSpin ? `${C.cyan}18` : C.card,
                    color: autoSpin ? C.cyan : C.textDim,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 2,
                  }}
                >{autoSpin ? '⏹ STOP AUTO' : '▶▶ AUTO SPIN'}</button>
                <button
                  onClick={() => setShowPaytable(p => !p)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 10,
                    border: `1.5px solid ${showPaytable ? C.gold : C.border}`,
                    background: showPaytable ? `${C.gold}18` : C.card,
                    color: showPaytable ? C.goldBright : C.textDim,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 2,
                  }}
                >📊 PAYTABLE</button>
              </div>

              <div style={{ marginTop: 10, height: 2,
                background: `linear-gradient(90deg, transparent, ${C.gold}44, transparent)` }} />

              {/* SPACEBAR HINT */}
              <div style={{ textAlign: 'center', marginTop: 8, color: C.textDim, fontSize: 11, letterSpacing: 1 }}>
                Press <kbd style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>SPACE</kbd> to spin
              </div>
            </div>

            {/* LAST RESULTS */}
            {lastResults.length > 0 && (
              <div style={{
                marginTop: 16, background: C.card,
                border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px',
                animation: 'fadeInUp 0.4s ease-out',
              }}>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>RECENT SPINS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {lastResults.slice(0, 5).map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: 12, padding: '4px 0',
                      borderBottom: i < lastResults.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <span style={{ color: C.textDim }}>{r.symbols.join(' ')}</span>
                      <span style={{ color: r.win > 0 ? C.goldBright : C.textDim, fontWeight: 700 }}>
                        {r.win > 0 ? `+$${r.win.toFixed(2)}` : 'LOSS'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PAYTABLE & INFO */}
          <div style={{ flex: '0 0 240px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* PAYTABLE */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
              overflow: 'hidden', animation: 'fadeInUp 0.6s 0.2s ease-out both',
              display: showPaytable ? 'block' : 'block',
            }}>
              <div style={{
                padding: '12px 16px',
                background: `linear-gradient(90deg, ${C.neonRed}22, transparent)`,
                borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: C.neonRed }}>
                  PAYTABLE
                </div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>Multiplier × Bet</div>
              </div>
              <PaytableRow label="7 7 7" payout="1000×" color={C.neonRed} />
              <PaytableRow label="BAR BAR BAR" payout="500×" color={C.gold} />
              <PaytableRow label="7 7 any" payout="200×" color={C.neonRed} />
              <PaytableRow label="🍒 🍒 🍒" payout="50×" color="#ff3344" />
              <PaytableRow label="🔔 🔔 🔔" payout="25×" color={C.yellow} />
              <PaytableRow label="🍊 🍊 🍊" payout="15×" color={C.orange} />
              <PaytableRow label="🍋 🍋 🍋" payout="10×" color={C.yellow} />
              <PaytableRow label="Any pair" payout="Varies" color={C.textDim} />
              <PaytableRow label="Any one 7" payout="20×" color={C.neonRed} />
            </div>

            {/* SYMBOLS LEGEND */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
              overflow: 'hidden', animation: 'fadeInUp 0.6s 0.3s ease-out both',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: C.gold }}>SYMBOLS</div>
              </div>
              {SYMBOLS.map(sym => (
                <div key={sym.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 14px', borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: sym.id === 'SEVEN' || sym.id === 'BAR' ? 12 : 20, width: 28, textAlign: 'center' }}>
                    {sym.id === 'SEVEN' ? <span style={{ color: C.neonRed, fontWeight: 900, fontSize: 16, textShadow: `0 0 8px ${C.neonRed}` }}>7</span>
                      : sym.id === 'BAR' ? <span style={{ color: C.gold, fontWeight: 900, fontSize: 12 }}>BAR</span>
                        : sym.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: sym.color, fontSize: 11, fontWeight: 700 }}>{sym.id}</div>
                    <div style={{ color: C.textDim, fontSize: 10 }}>Triple = {sym.payoutTriple}×</div>
                  </div>
                </div>
              ))}
            </div>

            {/* GAME INFO */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
              padding: 16, animation: 'fadeInUp 0.6s 0.4s ease-out both',
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: C.cyan, marginBottom: 12 }}>GAME INFO</div>
              {[
                ['Type', 'Classic Slot'],
                ['Reels', '3 × 1'],
                ['Paylines', '1'],
                ['Min Bet', '$1'],
                ['Max Bet', '$50'],
                ['Max Win', '1000×'],
                ['RTP', '96.5%'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: C.textDim }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESPONSIBLE GAMING FOOTER */}
        <div style={{
          marginTop: 40, padding: 20,
          border: `1px solid ${C.border}`, borderRadius: 14,
          background: '#040810',
          textAlign: 'center',
        }}>
          <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>⚠ RESPONSIBLE GAMING</div>
          <p style={{ color: C.textDim, fontSize: 11, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            This game is intended for entertainment purposes only. Please gamble responsibly.
            Set deposit limits and never wager more than you can afford to lose.
            If gambling is affecting your life, seek help at <strong style={{ color: C.cyan }}>BeGambleAware.org</strong>.
            You must be 18+ to play. 🔞
          </p>
        </div>
      </main>
    </>
  );
}
