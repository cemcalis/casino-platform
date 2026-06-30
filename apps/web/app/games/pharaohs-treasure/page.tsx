'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#0a0800',
  surface: '#1a1400',
  gold: '#d4a848',
  goldBright: '#f4c430',
  sand: '#c4a574',
  blue: '#1e90ff',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#7a7090',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:#0a0800;font-family:'Outfit',sans-serif;color:#f0e8ff;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0a0800;}
::-webkit-scrollbar-thumb{background:#3d2a00;border-radius:3px;}

@keyframes reelSpin {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100%); }
}
@keyframes symbolPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes winLine {
  0% { opacity: 0; transform: scaleX(0); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 1; transform: scaleX(1); }
}
@keyframes goldShimmer {
  0% { background-position: -400% center; }
  100% { background-position: 400% center; }
}
@keyframes twinkle {
  0%,100% { opacity:0.15; transform:scale(1); }
  50%      { opacity:0.8; transform:scale(1.5); }
}
@keyframes cascade {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes jackpotPulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 20px rgba(244,196,48,0.5); }
  50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(244,196,48,0.8); }
}
@keyframes clusterGlow {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}
`;

/* ─── SYMBOLS ─────────────────────────────────────────────────────────────────── */
const SYMBOLS = [
  { id: 'pharaoh', name: 'Pharaoh', value: 1000, weight: 1, color: '#f4c430', isWild: true, isScatter: false, isExpanding: true },
  { id: 'ankh', name: 'Ankh', value: 500, weight: 3, color: '#00d4c8', isWild: false, isScatter: true, isExpanding: false },
  { id: 'scarab', name: 'Scarab', value: 250, weight: 5, color: '#22c55e', isWild: false, isScatter: false, isExpanding: false },
  { id: 'eye', name: 'Eye of Horus', value: 150, weight: 7, color: '#7c3aed', isWild: false, isScatter: false, isExpanding: false },
  { id: 'cat', name: 'Bastet', value: 100, weight: 10, color: '#ff2d78', isWild: false, isScatter: false, isExpanding: false },
  { id: 'scroll', name: 'Scroll', value: 75, weight: 12, color: '#c4a574', isWild: false, isScatter: false, isExpanding: false },
  { id: 'vase', name: 'Vase', value: 50, weight: 15, color: '#1e90ff', isWild: false, isScatter: false, isExpanding: false },
  { id: 'a', name: 'A', value: 25, weight: 20, color: '#f4c430', isWild: false, isScatter: false, isExpanding: false },
  { id: 'k', name: 'K', value: 20, weight: 20, color: '#f4c430', isWild: false, isScatter: false, isExpanding: false },
  { id: 'q', name: 'Q', value: 15, weight: 20, color: '#f4c430', isWild: false, isScatter: false, isExpanding: false },
  { id: 'j', name: 'J', value: 10, weight: 20, color: '#f4c430', isWild: false, isScatter: false, isExpanding: false },
  { id: '10', name: '10', value: 5, weight: 25, color: '#c4a574', isWild: false, isScatter: false, isExpanding: false },
];

/* ─── SYMBOL ART COMPONENTS ───────────────────────────────────────────────────── */
function SymbolArt({ symbol, size = 60 }: { symbol: typeof SYMBOLS[0]; size?: number }) {
  const art: Record<string, JSX.Element> = {
    pharaoh: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.9, background: 'linear-gradient(180deg,#f4c430,#d97706)', borderRadius: '40% 40% 30% 30%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: size * 0.3, height: size * 0.35, background: '#f4c430', borderRadius: '50%', boxShadow: '0 0 10px rgba(244,196,48,0.5)' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '10%', right: '10%', height: size * 0.15, background: '#b8860b', borderRadius: 2 }} />
        </div>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: size * 0.4, height: size * 0.5, background: 'linear-gradient(180deg,#f4c430,#d97706)', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      </div>
    ),
    ankh: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.25, height: size * 0.7, background: '#00d4c8', borderRadius: size * 0.125, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: size * 0.5, height: size * 0.5, borderRadius: '50%', border: `${size * 0.08}px solid #00d4c8` }} />
        </div>
      </div>
    ),
    scarab: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.8, height: size * 0.5, background: '#22c55e', borderRadius: '50%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: size * 0.3, height: size * 0.4, background: '#22c55e', borderRadius: '50% 50% 0 0' }} />
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ position: 'absolute', bottom: '-10%', left: `${10 + i * 16}%`, width: size * 0.08, height: size * 0.15, background: '#166534', borderRadius: 2 }} />
          ))}
        </div>
      </div>
    ),
    eye: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.4, background: '#7c3aed', borderRadius: '50%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: size * 0.15, height: size * 0.4, background: '#7c3aed', borderRadius: 4 }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', width: size * 0.25, height: size * 0.25, background: '#7c3aed', borderRadius: '50%' }} />
        </div>
      </div>
    ),
    cat: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.6, height: size * 0.7, background: '#ff2d78', borderRadius: '50% 50% 40% 40%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15%', left: '15%', width: size * 0.15, height: size * 0.15, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '15%', right: '15%', width: size * 0.15, height: size * 0.15, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: size * 0.1, height: size * 0.2, background: '#ff2d78', borderRadius: '50%' }} />
        </div>
      </div>
    ),
    scroll: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.7, height: size * 0.8, background: '#c4a574', borderRadius: size * 0.1, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', height: '8%', background: '#8b7355', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: '25%', left: '10%', right: '10%', height: '8%', background: '#8b7355', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: '40%', left: '10%', right: '10%', height: '8%', background: '#8b7355', borderRadius: 2 }} />
        </div>
      </div>
    ),
    vase: (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.5, height: size * 0.7, background: 'linear-gradient(180deg,#1e90ff,#0066cc)', borderRadius: '20% 20% 40% 40%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: size * 0.3, height: size * 0.2, background: '#1e90ff', borderRadius: '50%' }} />
        </div>
      </div>
    ),
    a: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Cinzel, serif' }}>A</div>,
    k: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Cinzel, serif' }}>K</div>,
    q: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Cinzel, serif' }}>Q</div>,
    j: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.7, fontWeight: 900, color: '#f4c430', fontFamily: 'Cinzel, serif' }}>J</div>,
    10: <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 900, color: '#c4a574', fontFamily: 'Cinzel, serif' }}>10</div>,
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
  clusters: Array<{cells: [number, number][], symbol: string, size: number}>;
  cascading: boolean;
  cascadeCount: number;
  jackpot: number;
  bonusActive: boolean;
  bonusSpins: number;
  expandingWilds: Array<{row: number, col: number}>;
  multiplier: number;
  maxWin: number;
}

const STARTING_BALANCE = 10_000;
const BALANCE_KEY = 'pharaohs_treasure_balance';

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
  [[0,0], [1,1], [2,2], [3,1], [4,0]], // Diagonal
  [[0,2], [1,1], [2,0], [3,1], [4,2]], // Diagonal reverse
  [[0,0], [1,0], [2,0], [3,0], [4,0]], // Top row
  [[0,1], [1,1], [2,1], [3,1], [4,1]], // Middle row
  [[0,2], [1,2], [2,2], [3,2], [4,2]], // Bottom row
];

// Cluster pays - find connected groups of same symbol
function findClusters(reels: string[][]): { clusters: Array<{cells: [number, number][], symbol: string, size: number}> } {
  const visited = new Set<string>();
  const clusters: Array<{cells: [number, number][], symbol: string, size: number}> = [];
  const rows = reels.length;
  const cols = reels[0]!.length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      
      const symbol = reels[r]![c]!;
      const symbolData = SYMBOLS.find(s => s.id === symbol);
      if (symbolData?.isScatter) continue; // Skip scatter symbols in cluster calculation

      // BFS to find connected cluster
      const queue: [number, number][] = [[r, c]];
      const cells: [number, number][] = [];
      
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        const ckey = `${cr},${cc}`;
        if (visited.has(ckey)) continue;
        
        visited.add(ckey);
        cells.push([cr, cc]);
        
        // Check 8 neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = cr + dr, nc = cc + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (reels[nr]![nc] === symbol && !visited.has(`${nr},${nc}`)) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }

      if (cells.length >= 5) {
        clusters.push({ cells, symbol, size: cells.length });
      }
    }
  }

  return { clusters };
}

function calculateWin(reels: string[][]): { win: number; winLines: number[][][]; clusters: Array<{cells: [number, number][], symbol: string, size: number}> } {
  let totalWin = 0;
  const winLines: number[][][] = [];

  // Payline wins
  for (const line of PAYLINES) {
    const symbols = line.map(([r, c]) => reels[r]![c]!);
    const first = symbols[0]!;
    
    // Check for 3+ matching symbols (wilds substitute)
    let matchCount = 1;
    const firstSymbol = SYMBOLS.find(s => s.id === first);
    
    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = SYMBOLS.find(s => s.id === symbols[i]);
      const firstIsWild = firstSymbol?.isWild;
      const currentIsWild = currentSymbol?.isWild;
      
      if (symbols[i] === first || firstIsWild || currentIsWild) matchCount++;
      else break;
    }

    if (matchCount >= 3) {
      const symbol = SYMBOLS.find(s => s.id === (firstSymbol?.isWild ? symbols[1] : first));
      if (symbol) {
        const multiplier = matchCount === 3 ? 1 : matchCount === 4 ? 5 : 25;
        totalWin += symbol.value * multiplier;
        winLines.push(line);
      }
    }
  }

  // Cluster pays
  const { clusters } = findClusters(reels);
  for (const cluster of clusters) {
    const symbol = SYMBOLS.find(s => s.id === cluster.symbol);
    if (symbol) {
      const clusterMultiplier = cluster.size >= 5 ? 2 : cluster.size >= 7 ? 5 : cluster.size >= 10 ? 10 : 1;
      totalWin += symbol.value * cluster.size * clusterMultiplier;
    }
  }

  return { win: totalWin, winLines, clusters };
}

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function PharaohsTreasurePage() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(() => ({
    reels: [
      ['pharaoh', 'ankh', 'scarab'],
      ['eye', 'cat', 'scroll'],
      ['vase', 'a', 'k'],
      ['q', 'j', '10'],
      ['pharaoh', 'ankh', 'scarab'],
    ],
    spinning: false,
    balance: loadBalance(),
    bet: 10,
    win: 0,
    winLines: [],
    clusters: [],
    cascading: false,
    cascadeCount: 0,
    jackpot: 50000,
    bonusActive: false,
    bonusSpins: 0,
    expandingWilds: [],
    multiplier: 1,
    maxWin: 10000,
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
      clusters: [],
      cascading: false,
      cascadeCount: 0,
      expandingWilds: [],
      multiplier: 1,
    }));

    setTimeout(() => {
      let newReels = spinReels();
      
      // Check for expanding wilds (Pharaoh symbol)
      const expandingWilds: Array<{row: number, col: number}> = [];
      for (let r = 0; r < newReels.length; r++) {
        for (let c = 0; c < newReels[r]!.length; c++) {
          if (newReels[r]![c] === 'pharaoh') {
            // Expand wild to fill entire column
            for (let i = 0; i < newReels.length; i++) {
              if (newReels[i]![c] !== 'pharaoh') {
                newReels[i]![c] = 'pharaoh';
                expandingWilds.push({row: i, col: c});
              }
            }
          }
        }
      }

      const { win, winLines, clusters } = calculateWin(newReels);
      
      // Calculate multiplier based on cascade count and cluster size
      let multiplier = 1;
      if (clusters.length > 0) {
        const maxClusterSize = Math.max(...clusters.map(c => c.size));
        multiplier = maxClusterSize >= 10 ? 5 : maxClusterSize >= 7 ? 3 : maxClusterSize >= 5 ? 2 : 1;
      }
      
      // Check for jackpot (1 in 10000 chance)
      const jackpotWin = Math.random() < 0.0001 ? gs.jackpot : 0;
      
      // Check for bonus round (3+ scatter symbols)
      const scatterCount = newReels.flat().filter(s => s === 'ankh').length;
      const bonusTriggered = scatterCount >= 3;
      
      // Apply max win cap
      const finalWin = Math.min(win * multiplier + jackpotWin, gs.maxWin * gs.bet);
      
      setGs(prev => ({
        ...prev,
        reels: newReels,
        spinning: false,
        balance: prev.balance + finalWin,
        win: finalWin,
        winLines,
        clusters,
        expandingWilds,
        multiplier,
        jackpot: jackpotWin > 0 ? 50000 + Math.random() * 100000 : prev.jackpot + prev.bet * 0.01,
        bonusActive: bonusTriggered || prev.bonusActive,
        bonusSpins: bonusTriggered ? 10 : prev.bonusSpins,
      }));

      // Trigger cascades if there are clusters
      if (clusters.length > 0) {
        setTimeout(() => {
          setGs(prev => ({ ...prev, cascading: true }));
          // Remove cluster symbols and cascade
          const reelsCopy = newReels.map(row => [...row]);
          clusters.forEach(cluster => {
            cluster.cells.forEach(([r, c]) => {
              reelsCopy[r]![c] = '';
            });
          });
          
          // Cascade symbols down
          for (let c = 0; c < reelsCopy[0]!.length; c++) {
            let emptyRow = reelsCopy.length - 1;
            for (let r = reelsCopy.length - 1; r >= 0; r--) {
              if (reelsCopy[r]![c] !== '') {
                if (r !== emptyRow) {
                  reelsCopy[emptyRow]![c] = reelsCopy[r]![c];
                  reelsCopy[r]![c] = '';
                }
                emptyRow--;
              }
            }
            // Fill empty spaces with new symbols
            for (let r = emptyRow; r >= 0; r--) {
              reelsCopy[r]![c] = getRandomSymbol();
            }
          }

          const { win: cascadeWin, winLines: cascadeLines, clusters: cascadeClusters } = calculateWin(reelsCopy);
          const cascadeMultiplier = multiplier + 1; // Increase multiplier on cascade
          const finalCascadeWin = Math.min(cascadeWin * cascadeMultiplier, gs.maxWin * gs.bet);
          
          setGs(prev => ({
            ...prev,
            reels: reelsCopy,
            cascading: false,
            cascadeCount: prev.cascadeCount + 1,
            multiplier: cascadeMultiplier,
            balance: prev.balance + finalCascadeWin,
            win: prev.win + finalCascadeWin,
            winLines: [...prev.winLines, ...cascadeLines],
            clusters: cascadeClusters,
          }));
        }, 1000);
      }
    }, 2000);
  }, [gs.spinning, gs.bet, gs.balance, gs.jackpot, gs.maxWin]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,8,0,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,168,72,0.2)',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#d4a848,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#0a0800' }}>𓂀</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: C.goldBright, fontFamily: 'Cinzel, serif' }}>PHARAOH&apos;S TREASURE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Jackpot Display */}
          <div style={{
            background: 'linear-gradient(135deg, #f4c430, #ff8c00)',
            padding: '8px 16px', borderRadius: 10,
            border: '2px solid #d4a848',
            boxShadow: '0 0 20px rgba(244,196,48,0.4)',
            animation: 'jackpotPulse 2s infinite',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#0a0800', letterSpacing: '1px' }}>JACKPOT</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0a0800' }}>
              {Math.floor(gs.jackpot).toLocaleString()}
            </div>
          </div>

          {/* Bonus Spins Indicator */}
          {gs.bonusActive && (
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              padding: '8px 16px', borderRadius: 10,
              border: '2px solid #7c3aed',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>BONUS SPINS</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                {gs.bonusSpins}
              </div>
            </div>
          )}

          {/* Cascade Indicator */}
          {gs.cascadeCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              padding: '8px 16px', borderRadius: 10,
              border: '2px solid #22c55e',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#0a0800', letterSpacing: '1px' }}>CASCADE</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0a0800' }}>
                x{gs.cascadeCount}
              </div>
            </div>
          )}

          {/* Multiplier Indicator */}
          {gs.multiplier > 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #ff2d78, #ff6b9d)',
              padding: '8px 16px', borderRadius: 10,
              border: '2px solid #ff2d78',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>MULTIPLIER</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                x{gs.multiplier}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{gs.balance.toLocaleString()}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(212,168,72,0.1)', border: '1px solid rgba(212,168,72,0.3)',
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
          border: '3px solid #d4a848',
          boxShadow: '0 0 60px rgba(212,168,72,0.3), inset 0 0 80px rgba(212,168,72,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Egyptian pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(212,168,72,0.03) 0px, rgba(212,168,72,0.03) 2px, transparent 2px, transparent 20px)',
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
                border: '2px solid rgba(212,168,72,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                overflow: 'hidden',
              }}>
                {reel.map((symbolId, symbolIdx) => {
                  const symbol = SYMBOLS.find(s => s.id === symbolId)!;
                  const isWinning = gs.winLines.some(line => line.some(([r, c]) => r === reelIdx && c === symbolIdx));
                  const isCluster = gs.clusters.some(cluster => cluster.cells.some(([r, c]) => r === reelIdx && c === symbolIdx));
                  const isCascading = gs.cascading;
                  return (
                    <div key={symbolIdx} style={{
                      width: 80, height: 80,
                      borderRadius: 8,
                      background: isCluster ? 'rgba(34,197,94,0.2)' : isWinning ? 'rgba(212,168,72,0.2)' : 'rgba(255,255,255,0.05)',
                      border: isCluster ? '2px solid #22c55e' : isWinning ? '2px solid #f4c430' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: gs.spinning ? 'reelSpin 0.5s ease-in-out infinite' : isCascading ? 'cascade 0.5s ease-out' : isCluster ? 'clusterGlow 1s ease-in-out infinite' : isWinning ? 'symbolPop 0.4s ease-out' : 'none',
                      boxShadow: isCluster ? '0 0 15px rgba(34,197,94,0.5)' : isWinning ? '0 0 15px rgba(244,196,48,0.5)' : 'none',
                    }}>
                      <SymbolArt symbol={symbol} size={50} />
                      {symbol.isWild && (
                        <div style={{
                          position: 'absolute', top: 4, right: 4,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#f4c430', color: '#0a0800',
                          fontSize: 10, fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>W</div>
                      )}
                      {symbol.isScatter && (
                        <div style={{
                          position: 'absolute', top: 4, right: 4,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#00d4c8', color: '#0a0800',
                          fontSize: 10, fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>S</div>
                      )}
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
              background: 'rgba(212,168,72,0.15)', border: '2px solid #f4c430',
              animation: 'symbolPop 0.4s ease-out',
            }}>
              <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>YOU WON</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.goldBright, fontFamily: 'Cinzel, serif' }}>{gs.win.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#7c6fa0', fontWeight: 600, marginTop: 2 }}>
                Max Win Cap: {gs.maxWin.toLocaleString()}x Bet
              </div>
              {(gs.clusters.length > 0 || gs.multiplier > 1) && (
                <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 4 }}>
                  {gs.clusters.length > 0 && `${gs.clusters.length} Cluster${gs.clusters.length > 1 ? 's' : ''} • `}
                  {gs.cascadeCount > 0 && `${gs.cascadeCount} Cascade${gs.cascadeCount > 1 ? 's' : ''} • `}
                  {gs.multiplier > 1 && `x${gs.multiplier} Multiplier`}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 20, borderRadius: 16,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,168,72,0.2)',
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
                    background: gs.bet === b ? 'rgba(212,168,72,0.2)' : 'rgba(255,255,255,0.05)',
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
                fontFamily: 'Cinzel, serif',
                boxShadow: gs.spinning || gs.bet > gs.balance ? 'none' : '0 4px 20px rgba(212,168,72,0.4)',
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
          background: 'rgba(26,20,0,0.8)', border: '1px solid rgba(212,168,72,0.2)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.goldBright, marginBottom: 16, fontFamily: 'Cinzel, serif' }}>PAYTABLE</h3>
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
