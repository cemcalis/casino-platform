'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0008',
  surface: '#1a0010',
  gold: '#d4a848',
  goldBright: '#f4c430',
  red: '#ff2d78',
  jade: '#00d4c8',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#7a7090',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:#0a0008;font-family:'Outfit',sans-serif;color:#f0e8ff;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0a0008;}
::-webkit-scrollbar-thumb{background:#4a0020;border-radius:3px;}

@keyframes reelSpin {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
}
@keyframes symbolPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes dragonGlow {
  0%,100% { box-shadow: 0 0 20px rgba(255,45,120,0.3); }
  50% { box-shadow: 0 0 40px rgba(255,45,120,0.6); }
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
  { id: 'dragon', name: 'Dragon', value: 1000, weight: 1, color: '#ff2d78' },
  { id: 'phoenix', name: 'Phoenix', value: 500, weight: 3, color: '#f4c430' },
  { id: 'tiger', name: 'Tiger', value: 250, weight: 5, color: '#ff6b00' },
  { id: 'koi', name: 'Koi', value: 150, weight: 7, color: '#00d4c8' },
  { id: 'lantern', name: 'Lantern', value: 100, weight: 10, color: '#ff2d78' },
  { id: 'coin', name: 'Coin', value: 75, weight: 12, color: '#f4c430' },
  { id: 'fan', name: 'Fan', value: 50, weight: 15, color: '#7c3aed' },
  { id: 'a', name: 'A', value: 25, weight: 20, color: '#f4c430' },
  { id: 'k', name: 'K', value: 20, weight: 20, color: '#f4c430' },
  { id: 'q', name: 'Q', value: 15, weight: 20, color: '#f4c430' },
  { id: 'j', name: 'J', value: 10, weight: 20, color: '#f4c430' },
  { id: '10', name: '10', value: 5, weight: 25, color: '#ff2d78' },
];

/* ─── SYMBOL ART COMPONENTS ───────────────────────────────────────────────────── */
function SymbolArt({ symbol, size = 60 }: { symbol: typeof SYMBOLS[0]; size?: number }) {
  const art: Record<string, JSX.Element> = {
    dragon: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.8, height: size * 0.5, background: 'linear-gradient(90deg,#ff2d78,#ff6b00)', borderRadius: '50% 50% 30% 30%', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-20%', top: '20%', width: size * 0.4, height: size * 0.15, background: '#ff2d78', borderRadius: 8, transform: 'rotate(-30deg)' }} />
          <div style={{ position: 'absolute', right: '-20%', top: '20%', width: size * 0.4, height: size * 0.15, background: '#ff2d78', borderRadius: 8, transform: 'rotate(30deg)' }} />
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: size * 0.2, height: size * 0.3, background: '#ff2d78', borderRadius: '50%' }} />
        </div>
      </div>
    ),
    phoenix: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.7, background: 'linear-gradient(135deg,#f4c430,#ff6b00)', borderRadius: '50%', position: 'relative' }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: size * 0.35, height: size * 0.08, background: '#ff6b00',
              transformOrigin: 'left center', transform: `translate(-50%,-50%) rotate(${i * 45}deg)`,
              borderRadius: 2,
            }} />
          ))}
        </div>
      </div>
    ),
    tiger: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.6, background: '#ff6b00', borderRadius: '40% 40% 30% 30%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: size * 0.15, height: size * 0.15, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '20%', right: '20%', width: size * 0.15, height: size * 0.15, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: size * 0.2, height: size * 0.1, background: '#cc4400', borderRadius: 4 }} />
        </div>
      </div>
    ),
    koi: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.8, height: size * 0.4, background: '#00d4c8', borderRadius: '50% 50% 40% 40%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '30%', width: size * 0.15, height: size * 0.25, background: '#ff6b00', borderRadius: '50%', transform: 'rotate(-30deg)' }} />
          <div style={{ position: 'absolute', top: '-20%', right: '30%', width: size * 0.15, height: size * 0.25, background: '#ff6b00', borderRadius: '50%', transform: 'rotate(30deg)' }} />
        </div>
      </div>
    ),
    lantern: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.5, height: size * 0.7, background: 'linear-gradient(180deg,#ff2d78,#cc1144)', borderRadius: '30% 30% 50% 50%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: size * 0.1, height: size * 0.3, background: '#ff2d78' }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: size * 0.3, height: size * 0.2, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
        </div>
      </div>
    ),
    coin: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', background: 'radial-gradient(circle,#f4c430,#d97706)', border: '3px solid #b8860b', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: size * 0.4, fontWeight: 900, color: '#8b6914', fontFamily: 'Noto Serif SC, serif' }}>福</div>
        </div>
      </div>
    ),
    fan: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.7, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)', position: 'relative' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: size * 0.35, height: size * 0.02, background: 'rgba(255,255,255,0.3)',
              transformOrigin: 'left center', transform: `translate(-50%,-50%) rotate(${i * 36}deg)`,
            }} />
          ))}
        </div>
      </div>
    ),
    a: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Noto Serif SC, serif' }}>A</div>,
    k: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Noto Serif SC, serif' }}>K</div>,
    q: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Noto Serif SC, serif' }}>Q</div>,
    j: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Noto Serif SC, serif' }}>J</div>,
    10: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 900, color: '#ff2d78', fontFamily: 'Noto Serif SC, serif' }}>10</div>,
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
const BALANCE_KEY = 'dragon_fortune_balance';

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
export default function DragonFortunePage() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(() => ({
    reels: [
      ['dragon', 'phoenix', 'tiger'],
      ['koi', 'lantern', 'coin'],
      ['fan', 'a', 'k'],
      ['q', 'j', '10'],
      ['dragon', 'phoenix', 'tiger'],
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
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,0,8,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,45,120,0.2)',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff2d78,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>龍</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: C.goldBright, fontFamily: 'Noto Serif SC, serif' }}>DRAGON FORTUNE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{gs.balance.toLocaleString()}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)',
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
          background: 'linear-gradient(135deg, #1a0010 0%, #2a0020 50%, #1a0010 100%)',
          border: '3px solid #ff2d78',
          boxShadow: '0 0 60px rgba(255,45,120,0.3), inset 0 0 80px rgba(255,45,120,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Asian pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle 2px at 50% 50%, rgba(255,45,120,0.08) 0%, transparent 100%)',
            backgroundSize: '20px 20px',
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
                border: '2px solid rgba(255,45,120,0.3)',
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
                      background: isWinning ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)',
                      border: isWinning ? '2px solid #ff2d78' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: gs.spinning ? 'reelSpin 0.5s ease-in-out infinite' : isWinning ? 'symbolPop 0.4s ease-out' : 'none',
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
              background: 'rgba(255,45,120,0.15)', border: '2px solid #ff2d78',
              animation: 'symbolPop 0.4s ease-out',
            }}>
              <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>YOU WON</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.goldBright, fontFamily: 'Noto Serif SC, serif' }}>{gs.win.toLocaleString()}</div>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 20, borderRadius: 16,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,45,120,0.2)',
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
                    background: gs.bet === b ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)',
                    border: gs.bet === b ? '1px solid #ff2d78' : '1px solid rgba(255,255,255,0.1)',
                    color: gs.bet === b ? '#ff2d78' : C.textDim,
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
                  : 'linear-gradient(135deg,#ff2d78,#cc1144)',
                border: gs.spinning || gs.bet > gs.balance 
                  ? '1px solid rgba(255,255,255,0.1)' 
                  : '2px solid #ff2d78',
                color: gs.spinning || gs.bet > gs.balance ? C.textDim : '#fff',
                fontSize: 18, fontWeight: 900,
                cursor: gs.spinning || gs.bet > gs.balance ? 'not-allowed' : 'pointer',
                fontFamily: 'Noto Serif SC, serif',
                boxShadow: gs.spinning || gs.bet > gs.balance ? 'none' : '0 4px 20px rgba(255,45,120,0.4)',
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
          background: 'rgba(26,0,16,0.8)', border: '1px solid rgba(255,45,120,0.2)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.goldBright, marginBottom: 16, fontFamily: 'Noto Serif SC, serif' }}>PAYTABLE</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {SYMBOLS.slice(0, 7).map(symbol => (
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
