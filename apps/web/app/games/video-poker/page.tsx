'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  magenta: '#ff2d78',
  green: '#22c55e',
  text: '#f0eaf8',
  textDim: '#7a7090',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;background:#06000e;font-family:'Outfit',sans-serif;color:#f0eaf8;overflow-x:hidden;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#06000e;}
::-webkit-scrollbar-thumb{background:#260840;border-radius:3px;}

@keyframes cardDeal {
  0%   { opacity:0; transform: translateY(-40px) scale(0.8); }
  60%  { opacity:1; transform: translateY(4px) scale(1.02); }
  100% { opacity:1; transform: translateY(0) scale(1); }
}
@keyframes cardHold {
  0%,100% { box-shadow: 0 0 0 2px #f4c430, 0 0 20px rgba(244,196,48,0.4); }
  50%      { box-shadow: 0 0 0 3px #f4c430, 0 0 30px rgba(244,196,48,0.6); }
}
@keyframes winFlash {
  0%,100% { background: rgba(34,197,94,0.1); }
  50%      { background: rgba(34,197,94,0.25); }
}
@keyframes payoutPop {
  0%   { opacity:0; transform: scale(0.5); }
  60%  { transform: scale(1.15); }
  100% { opacity:1; transform: scale(1); }
}
@keyframes twinkle {
  0%,100% { opacity:0.15; transform:scale(1); }
  50%      { opacity:0.8; transform:scale(1.5); }
}
`;

/* ─── TYPES ──────────────────────────────────────────────────────────────────── */
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type HandRank = 'high' | 'pair' | 'two-pair' | 'three-kind' | 'straight' | 'flush' | 'full-house' | 'four-kind' | 'straight-flush' | 'royal-flush';
type Phase = 'betting' | 'dealt' | 'draw' | 'result';

interface Card {
  rank: Rank;
  suit: Suit;
  held: boolean;
  dealIdx?: number;
}

interface PaytableEntry {
  rank: HandRank;
  name: string;
  multiplier: number;
}

/* ─── PAYTABLE (Jacks or Better 9/6) ─────────────────────────────────────────── */
const PAYTABLE: PaytableEntry[] = [
  { rank: 'royal-flush', name: 'Royal Flush', multiplier: 250 },
  { rank: 'straight-flush', name: 'Straight Flush', multiplier: 50 },
  { rank: 'four-kind', name: 'Four of a Kind', multiplier: 25 },
  { rank: 'full-house', name: 'Full House', multiplier: 9 },
  { rank: 'flush', name: 'Flush', multiplier: 6 },
  { rank: 'straight', name: 'Straight', multiplier: 4 },
  { rank: 'three-kind', name: 'Three of a Kind', multiplier: 3 },
  { rank: 'two-pair', name: 'Two Pair', multiplier: 2 },
  { rank: 'pair', name: 'Jacks or Better', multiplier: 1 },
];

/* ─── DECK LOGIC ─────────────────────────────────────────────────────────────── */
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, held: false });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i]!;
    deck[i] = deck[j]!;
    deck[j] = tmp;
  }
  return deck;
}

function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
}

/* ─── HAND EVALUATION ───────────────────────────────────────────────────────── */
function evaluateHand(cards: Card[]): { rank: HandRank; name: string } {
  const sorted = sortCards(cards);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = ranks.every((r, i) => i === 0 || RANK_VALUES[r] === RANK_VALUES[ranks[i-1]!] - 1);
  // Special case: A-2-3-4-5 straight (wheel)
  const isWheel = ranks.join(',') === 'A,5,4,3,2';
  
  const rankCounts = ranks.reduce((acc, r) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<Rank, number>);
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts);
  
  // Royal Flush
  if (isFlush && isStraight && ranks[0] === 'A' && ranks[4] === '10') {
    return { rank: 'royal-flush', name: 'Royal Flush' };
  }
  
  // Straight Flush
  if (isFlush && (isStraight || isWheel)) {
    return { rank: 'straight-flush', name: 'Straight Flush' };
  }
  
  // Four of a Kind
  if (counts[0] === 4) {
    return { rank: 'four-kind', name: 'Four of a Kind' };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: 'full-house', name: 'Full House' };
  }
  
  // Flush
  if (isFlush) {
    return { rank: 'flush', name: 'Flush' };
  }
  
  // Straight
  if (isStraight || isWheel) {
    return { rank: 'straight', name: 'Straight' };
  }
  
  // Three of a Kind
  if (counts[0] === 3) {
    return { rank: 'three-kind', name: 'Three of a Kind' };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: 'two-pair', name: 'Two Pair' };
  }
  
  // Jacks or Better (pair of J, Q, K, or A)
  if (counts[0] === 2) {
    const pairRank = uniqueRanks.find(r => rankCounts[r as Rank] === 2)!;
    if (['J', 'Q', 'K', 'A'].includes(pairRank)) {
      return { rank: 'pair', name: 'Jacks or Better' };
    }
  }
  
  return { rank: 'high', name: 'High Card' };
}

/* ─── INITIAL STATE ──────────────────────────────────────────────────────────── */
const STARTING_BALANCE = 10_000;
const BALANCE_KEY = 'vp_demo_balance';

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

/* ─── CARD COMPONENT ─────────────────────────────────────────────────────────── */
const RED_SUITS: Suit[] = ['♥', '♦'];

function PokerCard({ card, onClick, held, animIdx = 0 }: {
  card: Card; onClick?: () => void; held: boolean; animIdx?: number;
}) {
  const isRed = RED_SUITS.includes(card.suit);
  const delay = animIdx * 0.1;

  return (
    <div
      onClick={onClick}
      style={{
        width: 90, height: 125,
        borderRadius: 10,
        background: '#ffffff',
        border: held ? '3px solid #f4c430' : '2px solid #e0d0f0',
        boxShadow: held
          ? '0 0 0 4px rgba(244,196,48,0.3), 0 8px 32px rgba(244,196,48,0.4)'
          : '0 6px 24px rgba(0,0,0,0.6)',
        position: 'relative',
        color: isRed ? '#cc1122' : '#111122',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        animation: held ? 'cardHold 1.5s ease-in-out infinite' : `cardDeal 0.4s ${delay}s cubic-bezier(0.22,0.61,0.36,1) both`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        transition: 'transform 0.2s',
      }}
    >
      {/* Top-left rank + suit */}
      <div style={{
        position: 'absolute', top: 6, left: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 1,
      }}>
        <span style={{ fontSize: card.rank === '10' ? 14 : 16, fontWeight: 900, letterSpacing: '-1px' }}>{card.rank}</span>
        <span style={{ fontSize: 13, marginTop: 1 }}>{card.suit}</span>
      </div>
      {/* Bottom-right rank + suit (rotated) */}
      <div style={{
        position: 'absolute', bottom: 6, right: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 1,
        transform: 'rotate(180deg)',
      }}>
        <span style={{ fontSize: card.rank === '10' ? 14 : 16, fontWeight: 900, letterSpacing: '-1px' }}>{card.rank}</span>
        <span style={{ fontSize: 13, marginTop: 1 }}>{card.suit}</span>
      </div>
      {/* Center suit */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: 36,
        opacity: 0.85,
        userSelect: 'none',
      }}>{card.suit}</div>
      
      {/* HOLD badge */}
      {held && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          padding: '3px 12px', borderRadius: 12,
          background: '#f4c430', color: '#0a0010',
          fontSize: 10, fontWeight: 900, letterSpacing: '1px',
          boxShadow: '0 4px 12px rgba(244,196,48,0.5)',
        }}>HELD</div>
      )}
    </div>
  );
}

/* ─── PAYTABLE COMPONENT ───────────────────────────────────────────────────────── */
function Paytable({ currentRank }: { currentRank: HandRank | null }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
      padding: 16,
      borderRadius: 14,
      background: 'rgba(19,0,32,0.8)',
      border: '1px solid rgba(124,58,237,0.2)',
    }}>
      {PAYTABLE.map(entry => (
        <div
          key={entry.rank}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            background: currentRank === entry.rank ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
            border: currentRank === entry.rank ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            animation: currentRank === entry.rank ? 'winFlash 1s ease-in-out infinite' : 'none',
          }}
        >
          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, marginBottom: 2 }}>{entry.name}</div>
          <div style={{
            fontSize: 14,
            fontWeight: 800,
            color: currentRank === entry.rank ? C.green : C.goldBright,
          }}>{entry.multiplier}x</div>
        </div>
      ))}
    </div>
  );
}

/* ─── BET CONTROLS ───────────────────────────────────────────────────────────── */
function BetControls({ bet, onBetChange, balance }: {
  bet: number; onBetChange: (bet: number) => void; balance: number;
}) {
  const bets = [1, 5, 10, 25, 50, 100];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {bets.map(b => (
        <button
          key={b}
          onClick={() => onBetChange(b)}
          disabled={b > balance}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: bet === b ? 'rgba(244,196,48,0.15)' : 'rgba(255,255,255,0.05)',
            border: bet === b ? '1px solid #f4c430' : '1px solid rgba(255,255,255,0.1)',
            color: bet === b ? '#f4c430' : C.textDim,
            fontSize: 13, fontWeight: 700,
            cursor: b > balance ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {b}
        </button>
      ))}
    </div>
  );
}

/* ─── ACTION BUTTON ─────────────────────────────────────────────────────────── */
function ActionBtn({ label, onClick, disabled, variant = 'gold' }: {
  label: string; onClick: () => void; disabled?: boolean; variant?: 'gold' | 'green' | 'red';
}) {
  const grad: Record<string, string> = {
    gold: 'linear-gradient(135deg,#8a5e10 0%,#f4c430 30%,#ffe066 50%,#d4a030 70%,#8a5e10 100%)',
    green: `linear-gradient(135deg,#0f4020,${C.green} 50%,#1a6030)`,
    red: `linear-gradient(135deg,#4a0020,${C.magenta} 50%,#6a0030)`,
  };
  const textColor: Record<string, string> = {
    gold: '#0a0010', green: '#fff', red: '#fff',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '14px 48px',
        borderRadius: 14,
        background: disabled ? 'rgba(255,255,255,0.06)' : grad[variant],
        border: `1px solid ${disabled ? '#260840' : variant === 'gold' ? '#f4c43077' : variant === 'green' ? `${C.green}66` : `${C.magenta}66`}`,
        color: disabled ? C.textDim : textColor[variant],
        fontSize: 15, fontWeight: 900,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '1.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
        backgroundSize: '200% auto',
      }}
    >{label}</button>
  );
}

/* ─── STAR BACKGROUND ────────────────────────────────────────────────────────── */
function Stars() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${(i * 19 + 5) % 100}%`,
    top: `${(i * 13 + 8) % 100}%`,
    size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
    delay: `${(i * 0.41) % 4}s`,
    dur: `${2.5 + (i % 6) * 0.6}s`,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: '50%', background: '#fff',
          animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function VideoPokerPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(() => loadBalance());
  const [bet, setBet] = useState(5);
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>('betting');
  const [handResult, setHandResult] = useState<{ rank: HandRank; name: string } | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    saveBalance(balance);
  }, [balance]);

  const handleDeal = useCallback(() => {
    if (bet > balance) return;
    
    const newDeck = buildDeck();
    const dealt = newDeck.splice(0, 5).map((c, i) => ({ ...c, held: false, dealIdx: i }));
    
    setDeck(newDeck);
    setHand(dealt);
    setPhase('dealt');
    setHandResult(null);
    setLastWin(0);
    setShowResult(false);
    setBalance(b => b - bet);
  }, [bet, balance]);

  const toggleHold = useCallback((idx: number) => {
    if (phase !== 'dealt') return;
    setHand(prev => {
      const newHand = [...prev];
      newHand[idx] = { ...newHand[idx]!, held: !newHand[idx]!.held };
      return newHand;
    });
  }, [phase]);

  const handleDraw = useCallback(() => {
    if (phase !== 'dealt') return;
    
    const heldCards = hand.filter(c => c.held);
    const cardsToDraw = 5 - heldCards.length;
    const newCards = deck.splice(0, cardsToDraw).map((c, i) => ({ ...c, held: false, dealIdx: i }));
    
    const finalHand = [...heldCards, ...newCards];
    const result = evaluateHand(finalHand);
    const payout = PAYTABLE.find(p => p.rank === result.rank)?.multiplier || 0;
    const winAmount = payout * bet;
    
    setHand(finalHand);
    setHandResult(result);
    setLastWin(winAmount);
    setPhase('result');
    setShowResult(true);
    setBalance(b => b + winAmount);
  }, [phase, hand, deck, bet]);

  const handleNewGame = useCallback(() => {
    setPhase('betting');
    setHand([]);
    setHandResult(null);
    setLastWin(0);
    setShowResult(false);
  }, []);

  const canDeal = phase === 'betting' && bet <= balance;
  const canDraw = phase === 'dealt' && hand.some(c => c.held);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Stars />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,0,14,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.2)',
        padding: '16px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>♠</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: C.goldBright }}>VIDEO POKER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{balance.toLocaleString()}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            color: C.text, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>EXIT</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Paytable */}
        <Paytable currentRank={handResult?.rank || null} />

        {/* Game Area */}
        <div style={{
          marginTop: 32,
          padding: 40,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0a2010 0%, #0f2d18 50%, #0a2010 100%)',
          border: '2px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 60px rgba(34,197,94,0.15), inset 0 0 80px rgba(34,197,94,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Felt texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(ellipse 2px 2px at 50% 50%, rgba(34,197,94,0.1) 0%, transparent 100%)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
          }} />

          {/* Cards */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16,
            minHeight: 125, position: 'relative', zIndex: 1,
          }}>
            {hand.length === 0 ? (
              // Empty slots
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  width: 90, height: 125, borderRadius: 10,
                  background: 'rgba(0,0,0,0.3)', border: '2px dashed rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.textDim, fontSize: 12, fontWeight: 600,
                }} />
              ))
            ) : (
              hand.map((card, i) => (
                <PokerCard
                  key={i}
                  card={card}
                  held={card.held}
                  onClick={() => toggleHold(i)}
                  animIdx={card.dealIdx}
                />
              ))
            )}
          </div>

          {/* Result Overlay */}
          {showResult && handResult && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              zIndex: 10,
              padding: '24px 48px', borderRadius: 18,
              background: 'rgba(6,0,14,0.95)',
              border: `2px solid ${lastWin > 0 ? C.green : C.magenta}`,
              color: lastWin > 0 ? C.green : C.magenta,
              fontSize: 28, fontWeight: 900,
              boxShadow: `0 0 60px ${lastWin > 0 ? C.green : C.magenta}55`,
              animation: 'payoutPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: C.textDim }}>
                {lastWin > 0 ? 'YOU WIN' : 'NO WIN'}
              </div>
              <div>{handResult.name}</div>
              {lastWin > 0 && (
                <div style={{ fontSize: 20, marginTop: 8, color: C.goldBright }}>
                  +{lastWin.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          marginTop: 32,
          padding: 24,
          borderRadius: 16,
          background: 'rgba(19,0,32,0.8)',
          border: '1px solid rgba(124,58,237,0.2)',
          display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
        }}>
          {phase === 'betting' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: C.textDim, fontWeight: 600 }}>BET AMOUNT:</span>
                <BetControls bet={bet} onBetChange={setBet} balance={balance} />
              </div>
              <ActionBtn label="DEAL" onClick={handleDeal} disabled={!canDeal} />
            </>
          )}

          {phase === 'dealt' && (
            <>
              <div style={{ fontSize: 14, color: C.textDim, fontWeight: 600 }}>
                Click cards to HOLD, then DRAW
              </div>
              <ActionBtn label="DRAW" onClick={handleDraw} disabled={!canDraw} variant="green" />
            </>
          )}

          {phase === 'result' && (
            <ActionBtn label="NEW GAME" onClick={handleNewGame} variant="gold" />
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12,
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>How to Play</h3>
          <ul style={{ fontSize: 12, color: C.textDim, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Select your bet amount and click DEAL to receive 5 cards</li>
            <li>Click cards you want to keep (they will show HELD)</li>
            <li>Click DRAW to replace unheld cards</li>
            <li>Winning hands pay according to the paytable</li>
            <li>Jacks or Better (pair of J, Q, K, or A) is the minimum winning hand</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
