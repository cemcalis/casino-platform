'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0800',
  surface: '#1a1400',
  gold: '#d4a848',
  goldBright: '#f4c430',
  red: '#ff2d78',
  green: '#22c55e',
  orange: '#ff6b00',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#7a7090',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:#0a0800;font-family:'Poppins',sans-serif;color:#f0e8ff;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0a0800;}
::-webkit-scrollbar-thumb{background:#4a3a00;border-radius:3px;}

@keyframes reelSpin {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
}
@keyframes symbolPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes fruitBounce {
  0%,100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(-5deg); }
  75% { transform: translateY(-5px) rotate(5deg); }
}
@keyframes goldShimmer {
  0% { background-position: -400% center; }
  100% { background-position: 400% center; }
}
@keyframes twinkle {
  0%,100% { opacity:0.15; transform:scale(1); }
  50%      { opacity:0.8; transform:scale(1.5); }
}
`;

/* ─── SYMBOLS ─────────────────────────────────────────────────────────────────── */
const SYMBOLS = [
  { id: 'seven', name: 'Lucky 7', value: 1000, weight: 1, color: '#ff2d78' },
  { id: 'diamond', name: 'Diamond', value: 500, weight: 3, color: '#7c3aed' },
  { id: 'bell', name: 'Bell', value: 250, weight: 5, color: '#f4c430' },
  { id: 'watermelon', name: 'Watermelon', value: 150, weight: 7, color: '#22c55e' },
  { id: 'grape', name: 'Grape', value: 100, weight: 10, color: '#7c3aed' },
  { id: 'lemon', name: 'Lemon', value: 75, weight: 12, color: '#f4c430' },
  { id: 'cherry', name: 'Cherry', value: 50, weight: 15, color: '#ff2d78' },
  { id: 'orange', name: 'Orange', value: 25, weight: 20, color: '#ff6b00' },
  { id: 'plum', name: 'Plum', value: 20, weight: 20, color: '#7c3aed' },
];

/* ─── SYMBOL ART COMPONENTS ───────────────────────────────────────────────────── */
function SymbolArt({ symbol, size = 60 }: { symbol: typeof SYMBOLS[0]; size?: number }) {
  const art: Record<string, JSX.Element> = {
    seven: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.7, fontWeight: 900, color: '#ff2d78', textShadow: '0 0 10px rgba(255,45,120,0.5)' }}>7</div>
      </div>
    ),
    diamond: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.6, height: size * 0.6,
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 20px rgba(124,58,237,0.5)',
        }} />
      </div>
    ),
    bell: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.5, height: size * 0.6,
          background: 'linear-gradient(180deg,#f4c430,#d97706)',
          borderRadius: '50% 50% 30% 30%',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: size * 0.15, height: size * 0.2, background: '#f4c430', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)', width: size * 0.1, height: size * 0.15, background: '#b8860b', borderRadius: 2 }} />
        </div>
      </div>
    ),
    watermelon: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.7, height: size * 0.7,
          background: 'linear-gradient(135deg,#22c55e,#166534)',
          borderRadius: '50%',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: '#ff6b6b' }} />
          {[0,1,2].map(i => (
            <div key={i} style={{
              position: 'absolute', top: `${20 + i * 30}%`, left: '50%', transform: 'translateX(-50%)',
              width: size * 0.08, height: size * 0.08, borderRadius: '50%', background: '#1a1a1a',
            }} />
          ))}
        </div>
      </div>
    ),
    grape: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: size * 0.25, height: size * 0.25,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            borderRadius: '50%',
            left: `${30 + (i % 3) * 20}%`,
            top: `${20 + Math.floor(i / 3) * 30}%`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }} />
        ))}
      </div>
    ),
    lemon: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.5, height: size * 0.65,
          background: 'linear-gradient(135deg,#f4c430,#d97706)',
          borderRadius: '50% 50% 40% 40%',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: size * 0.08, height: size * 0.15, background: '#b8860b', borderRadius: 2 }} />
        </div>
      </div>
    ),
    cherry: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '20%', left: '35%', width: size * 0.25, height: size * 0.25, background: '#ff2d78', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', right: '35%', width: size * 0.25, height: size * 0.25, background: '#ff2d78', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: size * 0.08, height: size * 0.2, background: '#22c55e', borderRadius: 2 }} />
      </div>
    ),
    orange: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.6, height: size * 0.6,
          background: 'linear-gradient(135deg,#ff6b00,#cc4400)',
          borderRadius: '50%',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: size * 0.08, height: size * 0.12, background: '#b8860b', borderRadius: 2 }} />
        </div>
      </div>
    ),
    plum: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: size * 0.5, height: size * 0.55,
          background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          borderRadius: '50% 50% 45% 45%',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: size * 0.06, height: size * 0.1, background: '#4c1d95', borderRadius: 2 }} />
        </div>
      </div>
    ),
  };
  return art[symbol.id] || null;
}

/* ─── GAME STATE ─────────────────────────────────────────────────────────────── */
interface GameState {
  reels: string[][];
  spinning: boolean;
  balance: number;
  bet: number;
  win: number;
  winLines: number[][][];
}

const STARTING_BALANCE = 10_000;
const BALANCE_KEY = 'fruit_frenzy_balance';

function loadBalance(): number {
  if (typeof window === 'undefined') return STARTING_BALANCE;
  const stored = localStorage.getItem(BALANCE_KEY);
  if (!stored) return STARTING_BALANCE;
  const n = parseFloat(stored);
  return isNaN(n) || n <= 0 ? STARTING_BALANCE : n;
}

function saveBalance(b: number) {
  if (typeof window !== 'undefined') localStorage.setItem(BALANCE_KEY, String(b));
}

/* ─── RNG ─────────────────────────────────────────────────────────────────────── */
function getRandomSymbol(): string {
  const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const symbol of SYMBOLS) {
    random -= symbol.weight;
    if (random <= 0) return symbol.id;
  }
  return SYMBOLS[SYMBOLS.length - 1]!.id;
}

function spinReels(): string[][] {
  return [
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
  ];
}

/* ─── WIN CALCULATION ───────────────────────────────────────────────────────── */
const PAYLINES = [
  [[0,0], [1,1], [2,2], [3,1], [4,0]],
  [[0,2], [1,1], [2,0], [3,1], [4,2]],
  [[0,0], [1,0], [2,0], [3,0], [4,0]],
  [[0,1], [1,1], [2,1], [3,1], [4,1]],
  [[0,2], [1,2], [2,2], [3,2], [4,2]],
];

function calculateWin(reels: string[][]): { win: number; winLines: number[][][] } {
  let totalWin = 0;
  const winLines: number[][][] = [];

  for (const line of PAYLINES) {
    const symbols = line.map(([r, c]) => reels[r]![c]!);
    const first = symbols[0]!;
    
    let matchCount = 1;
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === first) matchCount++;
      else break;
    }

    if (matchCount >= 3) {
      const symbol = SYMBOLS.find(s => s.id === first);
      if (symbol) {
        const multiplier = matchCount === 3 ? 1 : matchCount === 4 ? 5 : 25;
        totalWin += symbol.value * multiplier;
        winLines.push(line);
      }
    }
  }

  return { win: totalWin, winLines };
}

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function FruitFrenzyPage() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(() => ({
    reels: [
      ['seven', 'diamond', 'bell'],
      ['watermelon', 'grape', 'lemon'],
      ['cherry', 'orange', 'plum'],
      ['seven', 'diamond', 'bell'],
      ['watermelon', 'grape', 'lemon'],
    ],
    spinning: false,
    balance: loadBalance(),
    bet: 10,
    win: 0,
    winLines: [],
  }));

  useEffect(() => {
    saveBalance(gs.balance);
  }, [gs.balance]);

  const handleSpin = useCallback(() => {
    if (gs.spinning || gs.bet > gs.balance) return;

    setGs(prev => ({
      ...prev,
      spinning: true,
      balance: prev.balance - prev.bet,
      win: 0,
      winLines: [],
    }));

    setTimeout(() => {
      const newReels = spinReels();
      const { win, winLines } = calculateWin(newReels);
      
      setGs(prev => ({
        ...prev,
        reels: newReels,
        spinning: false,
        balance: prev.balance + win,
        win,
        winLines,
      }));
    }, 2000);
  }, [gs.spinning, gs.bet, gs.balance]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif", color: C.text, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,8,0,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(244,196,48,0.2)',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff2d78,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>🍒</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: C.goldBright }}>FRUIT FRENZY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{gs.balance.toLocaleString()}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.3)',
            color: C.text, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>EXIT</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Slot Machine */}
        <div style={{
          padding: 40,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1a1400 0%, #2a2000 50%, #1a1400 100%)',
          border: '3px solid #f4c430',
          boxShadow: '0 0 60px rgba(244,196,48,0.3), inset 0 0 80px rgba(244,196,48,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fruit pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle 3px at 50% 50%, rgba(244,196,48,0.06) 0%, transparent 100%)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }} />

          {/* Reels */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, position: 'relative', zIndex: 1 }}>
            {gs.reels.map((reel, reelIdx) => (
              <div key={reelIdx} style={{
                flex: 1,
                height: 300,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid rgba(244,196,48,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                overflow: 'hidden',
              }}>
                {reel.map((symbolId, symbolIdx) => {
                  const symbol = SYMBOLS.find(s => s.id === symbolId)!;
                  const isWinning = gs.winLines.some(line => line.some(([r, c]) => r === reelIdx && c === symbolIdx));
                  return (
                    <div key={symbolIdx} style={{
                      width: 80, height: 80,
                      borderRadius: 8,
                      background: isWinning ? 'rgba(244,196,48,0.2)' : 'rgba(255,255,255,0.05)',
                      border: isWinning ? '2px solid #f4c430' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: gs.spinning ? 'reelSpin 0.5s ease-in-out infinite' : isWinning ? 'fruitBounce 0.5s ease-out' : 'none',
                    }}>
                      <SymbolArt symbol={symbol} size={50} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win Display */}
          {gs.win > 0 && (
            <div style={{
              textAlign: 'center', marginBottom: 24,
              padding: '16px 32px', borderRadius: 12,
              background: 'rgba(244,196,48,0.15)', border: '2px solid #f4c430',
              animation: 'symbolPop 0.4s ease-out',
            }}>
              <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>YOU WON</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.goldBright }}>{gs.win.toLocaleString()}</div>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 20, borderRadius: 16,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(244,196,48,0.2)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: C.textDim, fontWeight: 600 }}>BET:</span>
              {[10, 25, 50, 100].map(b => (
                <button
                  key={b}
                  onClick={() => !gs.spinning && setGs(prev => ({ ...prev, bet: b }))}
                  disabled={gs.spinning}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: gs.bet === b ? 'rgba(244,196,48,0.2)' : 'rgba(255,255,255,0.05)',
                    border: gs.bet === b ? '1px solid #f4c430' : '1px solid rgba(255,255,255,0.1)',
                    color: gs.bet === b ? '#f4c430' : C.textDim,
                    fontSize: 13, fontWeight: 700,
                    cursor: gs.spinning ? 'not-allowed' : 'pointer',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              onClick={handleSpin}
              disabled={gs.spinning || gs.bet > gs.balance}
              style={{
                padding: '16px 48px', borderRadius: 14,
                background: gs.spinning || gs.bet > gs.balance 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'linear-gradient(135deg,#f4c430,#d97706)',
                border: gs.spinning || gs.bet > gs.balance 
                  ? '1px solid rgba(255,255,255,0.1)' 
                  : '2px solid #f4c430',
                color: gs.spinning || gs.bet > gs.balance ? C.textDim : '#0a0800',
                fontSize: 18, fontWeight: 900,
                cursor: gs.spinning || gs.bet > gs.balance ? 'not-allowed' : 'pointer',
                boxShadow: gs.spinning || gs.bet > gs.balance ? 'none' : '0 4px 20px rgba(244,196,48,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {gs.spinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>
        </div>

        {/* Paytable */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 16,
          background: 'rgba(26,20,0,0.8)', border: '1px solid rgba(244,196,48,0.2)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.goldBright, marginBottom: 16 }}>PAYTABLE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {SYMBOLS.map(symbol => (
              <div key={symbol.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: 8, borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
              }}>
                <div style={{ width: 32, height: 32 }}>
                  <SymbolArt symbol={symbol} size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.textDim }}>{symbol.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.goldBright }}>{symbol.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
