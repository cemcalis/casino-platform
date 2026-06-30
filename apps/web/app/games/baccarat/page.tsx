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
  feltDark: '#0a2010',
  feltMid: '#0f2d18',
  feltBright: '#133820',
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
  0%   { opacity:0; transform: translateY(-60px) scale(0.7); }
  60%  { opacity:1; transform: translateY(6px) scale(1.02); }
  100% { opacity:1; transform: translateY(0) scale(1); }
}
@keyframes cardFlip {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}
@keyframes winPulse {
  0%,100% { box-shadow: 0 0 20px rgba(34,197,94,0.3); }
  50%      { box-shadow: 0 0 40px rgba(34,197,94,0.6); }
}
@keyframes resultPop {
  0%   { opacity:0; transform: scale(0.5); }
  60%  { transform: scale(1.15); }
  100% { opacity:1; transform: scale(1); }
}
@keyframes twinkle {
  0%,100% { opacity:0.15; transform:scale(1); }
  50%      { opacity:0.8; transform:scale(1.5); }
}
@keyframes chipBounce {
  0%,100% { transform: scale(1) translateY(0); }
  35%      { transform: scale(1.18) translateY(-6px); }
  65%      { transform: scale(0.95) translateY(2px); }
}
`;

/* ─── TYPES ──────────────────────────────────────────────────────────────────── */
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type BetType = 'player' | 'banker' | 'tie';
type Phase = 'betting' | 'dealing' | 'result';

interface Card {
  rank: Rank;
  suit: Suit;
  faceDown?: boolean;
  dealIdx?: number;
}

interface GameState {
  phase: Phase;
  deck: Card[];
  playerHand: Card[];
  bankerHand: Card[];
  bet: number;
  betType: BetType | null;
  balance: number;
  result: { winner: BetType | 'tie'; payout: number } | null;
  history: { winner: BetType; amount: number }[];
}

/* ─── DECK LOGIC ─────────────────────────────────────────────────────────────── */
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const NUM_DECKS = 8;

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < NUM_DECKS; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ rank, suit });
      }
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

function cardValue(rank: Rank): number {
  if (rank === 'A') return 1;
  if (['J', 'Q', 'K'].includes(rank)) return 0;
  return parseInt(rank, 10);
}

function getHandValue(cards: Card[]): number {
  const visible = cards.filter(c => !c.faceDown);
  let total = 0;
  for (const c of visible) {
    total += cardValue(c.rank);
  }
  return total % 10;
}

/* ─── INITIAL STATE ──────────────────────────────────────────────────────────── */
const STARTING_BALANCE = 10_000;
const BALANCE_KEY = 'baccarat_demo_balance';

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

function BaccaratCard({ card, animIdx = 0, flipping = false }: {
  card: Card; animIdx?: number; flipping?: boolean;
}) {
  const isRed = RED_SUITS.includes(card.suit);
  const delay = animIdx * 0.15;

  if (card.faceDown) {
    return (
      <div style={{
        width: 70, height: 100,
        borderRadius: 8,
        background: 'linear-gradient(135deg,#1a0035 0%,#0a001e 50%,#1a0035 100%)',
        border: '2px solid #3d1060',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        position: 'relative',
        overflow: 'hidden',
        animation: flipping ? 'cardFlip 0.4s ease-in-out' : `cardDeal 0.4s ${delay}s cubic-bezier(0.22,0.61,0.36,1) both`,
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 4,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(124,58,237,0.15) 0px, rgba(124,58,237,0.15) 2px, transparent 2px, transparent 8px)',
          borderRadius: 4,
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 18, color: 'rgba(124,58,237,0.5)', fontWeight: 900,
        }}>♠</div>
      </div>
    );
  }

  return (
    <div style={{
      width: 70, height: 100,
      borderRadius: 8,
      background: '#ffffff',
      border: '2px solid #e0d0f0',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      position: 'relative',
      color: isRed ? '#cc1122' : '#111122',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 800,
      animation: flipping ? 'cardFlip 0.4s ease-in-out' : `cardDeal 0.4s ${delay}s cubic-bezier(0.22,0.61,0.36,1) both`,
      flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 12, fontWeight: 900 }}>{card.rank}</div>
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 10 }}>{card.suit}</div>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: 28, opacity: 0.85,
      }}>{card.suit}</div>
      <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 12, fontWeight: 900, transform: 'rotate(180deg)' }}>{card.rank}</div>
    </div>
  );
}

/* ─── BET BUTTON ───────────────────────────────────────────────────────────── */
function BetButton({ type, selected, onClick, payout }: {
  type: BetType; selected: boolean; onClick: () => void; payout: string;
}) {
  const colors = {
    player: { bg: 'linear-gradient(135deg,#1a3a6e,#2955a8)', border: '#4488dd', text: '#cce0ff' },
    banker: { bg: 'linear-gradient(135deg,#3a1a6e,#6030b8)', border: '#9966ee', text: '#e8d8ff' },
    tie: { bg: 'linear-gradient(135deg,#6e2a1a,#b04020)', border: '#e06040', text: '#ffe0d8' },
  };
  const cfg = colors[type];

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '20px 16px',
        borderRadius: 14,
        background: selected ? cfg.bg : 'rgba(255,255,255,0.05)',
        border: `2px solid ${selected ? cfg.border : 'rgba(255,255,255,0.1)'}`,
        color: selected ? cfg.text : C.textDim,
        fontSize: 14, fontWeight: 800,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        boxShadow: selected ? `0 0 0 3px ${cfg.border}44, 0 8px 24px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
        animation: selected ? 'chipBounce 0.4s ease' : 'none',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <span style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>{type}</span>
      <span style={{ fontSize: 11, opacity: 0.8 }}>PAYS {payout}</span>
    </button>
  );
}

/* ─── CHIP SELECTOR ─────────────────────────────────────────────────────────── */
function ChipSelector({ value, onChange, balance }: {
  value: number; onChange: (v: number) => void; balance: number;
}) {
  const chips = [10, 25, 50, 100, 500, 1000];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {chips.map(chip => (
        <button
          key={chip}
          onClick={() => onChange(chip)}
          disabled={chip > balance}
          style={{
            width: 50, height: 50, borderRadius: '50%',
            background: value === chip ? 'rgba(244,196,48,0.2)' : 'rgba(255,255,255,0.05)',
            border: `2px solid ${value === chip ? '#f4c430' : 'rgba(255,255,255,0.1)'}`,
            color: value === chip ? '#f4c430' : C.textDim,
            fontSize: 12, fontWeight: 800,
            cursor: chip > balance ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

/* ─── HAND DISPLAY ─────────────────────────────────────────────────────────── */
function HandDisplay({ cards, label, value, isWinner }: {
  cards: Card[]; label: string; value: number; isWinner?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '20px 24px',
      borderRadius: 16,
      background: isWinner ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
      border: isWinner ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
      animation: isWinner ? 'winPulse 1.5s ease-in-out infinite' : 'none',
    }}>
      <div style={{ fontSize: 12, color: C.textDim, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, minHeight: 100, alignItems: 'center' }}>
        {cards.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              width: 70, height: 100, borderRadius: 8,
              background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)',
            }} />
          ))
        ) : (
          cards.map((card, i) => (
            <BaccaratCard key={i} card={card} animIdx={card.dealIdx} />
          ))
        )}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 900, color: isWinner ? C.green : C.goldBright,
        textShadow: isWinner ? '0 0 20px rgba(34,197,94,0.5)' : 'none',
      }}>
        {value}
      </div>
    </div>
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
export default function BaccaratPage() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(() => ({
    phase: 'betting',
    deck: buildDeck(),
    playerHand: [],
    bankerHand: [],
    bet: 100,
    betType: null,
    balance: loadBalance(),
    result: null,
    history: [],
  }));
  const [selectedChip, setSelectedChip] = useState(100);

  useEffect(() => {
    saveBalance(gs.balance);
  }, [gs.balance]);

  const handleBet = useCallback((type: BetType) => {
    if (gs.phase !== 'betting') return;
    if (gs.bet > gs.balance) return;
    
    setGs(prev => ({ ...prev, betType: type }));
  }, [gs.phase, gs.bet, gs.balance]);

  const handleDeal = useCallback(() => {
    if (gs.phase !== 'betting' || !gs.betType || gs.bet > gs.balance) return;
    
    let deck = gs.deck.length < 20 ? buildDeck() : [...gs.deck];
    
    const draw = (): Card => {
      const c = deck.shift()!;
      return c;
    };

    // Initial deal: Player, Banker, Player, Banker
    const p1 = { ...draw(), dealIdx: 0 };
    const b1 = { ...draw(), dealIdx: 1 };
    const p2 = { ...draw(), dealIdx: 2 };
    const b2 = { ...draw(), dealIdx: 3 };

    let playerHand: Card[] = [p1, p2];
    let bankerHand: Card[] = [b1, b2];

    const playerVal = getHandValue(playerHand);
    const bankerVal = getHandValue(bankerHand);

    // Third card rules
    let p3: Card | null = null;
    let b3: Card | null = null;

    // Player draws if 0-5
    if (playerVal <= 5) {
      p3 = { ...draw(), dealIdx: 4 };
      playerHand.push(p3);
    }

    const finalPlayerVal = getHandValue(playerHand);

    // Banker third card rules based on player's third card
    if (bankerVal <= 2) {
      b3 = { ...draw(), dealIdx: 5 };
    } else if (bankerVal === 3 && p3 && cardValue(p3.rank) !== 8) {
      b3 = { ...draw(), dealIdx: 5 };
    } else if (bankerVal === 4 && p3 && cardValue(p3.rank) >= 2 && cardValue(p3.rank) <= 7) {
      b3 = { ...draw(), dealIdx: 5 };
    } else if (bankerVal === 5 && p3 && cardValue(p3.rank) >= 4 && cardValue(p3.rank) <= 7) {
      b3 = { ...draw(), dealIdx: 5 };
    } else if (bankerVal === 6 && p3 && (cardValue(p3.rank) === 6 || cardValue(p3.rank) === 7)) {
      b3 = { ...draw(), dealIdx: 5 };
    }

    if (b3) {
      bankerHand.push(b3);
    }

    const finalBankerVal = getHandValue(bankerHand);

    // Determine winner
    let winner: BetType | 'tie';
    let payout = 0;

    if (finalPlayerVal > finalBankerVal) {
      winner = 'player';
      payout = gs.betType === 'player' ? gs.bet * 2 : 0;
    } else if (finalBankerVal > finalPlayerVal) {
      winner = 'banker';
      payout = gs.betType === 'banker' ? Math.floor(gs.bet * 1.95) : 0; // 5% commission
    } else {
      winner = 'tie';
      payout = gs.betType === 'tie' ? gs.bet * 9 : gs.bet; // Return bet on tie
    }

    setGs(prev => ({
      ...prev,
      deck,
      playerHand,
      bankerHand,
      balance: prev.balance - gs.bet + payout,
      phase: 'result',
      result: { winner, payout },
      history: [{ winner, amount: payout - gs.bet }, ...prev.history].slice(0, 10),
    }));
  }, [gs.phase, gs.betType, gs.bet, gs.balance, gs.deck]);

  const handleNewGame = useCallback(() => {
    setGs(prev => ({
      ...prev,
      phase: 'betting',
      deck: buildDeck(),
      playerHand: [],
      bankerHand: [],
      betType: null,
      result: null,
    }));
  }, []);

  const playerVal = getHandValue(gs.playerHand);
  const bankerVal = getHandValue(gs.bankerHand);

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
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '2px', color: C.goldBright }}>BACCARAT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{gs.balance.toLocaleString()}</div>
          </div>
          <button onClick={() => router.push('/')} style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            color: C.text, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>EXIT</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Game Table */}
        <div style={{
          padding: 40,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0a2010 0%, #0f2d18 50%, #0a2010 100%)',
          border: '2px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 80px rgba(34,197,94,0.15), inset 0 0 100px rgba(34,197,94,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Felt texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(ellipse 2px 2px at 50% 50%, rgba(34,197,94,0.08) 0%, transparent 100%)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }} />

          {/* Hands */}
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 24, position: 'relative', zIndex: 1 }}>
            <HandDisplay
              cards={gs.playerHand}
              label="PLAYER"
              value={playerVal}
              isWinner={gs.result?.winner === 'player'}
            />
            <HandDisplay
              cards={gs.bankerHand}
              label="BANKER"
              value={bankerVal}
              isWinner={gs.result?.winner === 'banker'}
            />
          </div>

          {/* Result Overlay */}
          {gs.phase === 'result' && gs.result && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              zIndex: 10,
              padding: '24px 48px', borderRadius: 18,
              background: 'rgba(6,0,14,0.95)',
              border: `2px solid ${gs.result.payout > 0 ? C.green : C.magenta}`,
              color: gs.result.payout > 0 ? C.green : C.magenta,
              fontSize: 32, fontWeight: 900,
              boxShadow: `0 0 60px ${gs.result.payout > 0 ? C.green : C.magenta}55`,
              animation: 'resultPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: C.textDim }}>
                {gs.result.winner.toUpperCase()} WINS
              </div>
              {gs.result.payout > 0 && (
                <div style={{ fontSize: 24, marginTop: 8, color: C.goldBright }}>
                  +{gs.result.payout.toLocaleString()}
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
        }}>
          {gs.phase === 'betting' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
                  SELECT BET AMOUNT
                </div>
                <ChipSelector value={selectedChip} onChange={setSelectedChip} balance={gs.balance} />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <span style={{ fontSize: 14, color: C.textDim }}>Current Bet: </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.goldBright }}>{selectedChip}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <BetButton type="player" selected={gs.betType === 'player'} onClick={() => handleBet('player')} payout="1:1" />
                <BetButton type="banker" selected={gs.betType === 'banker'} onClick={() => handleBet('banker')} payout="0.95:1" />
                <BetButton type="tie" selected={gs.betType === 'tie'} onClick={() => handleBet('tie')} payout="8:1" />
              </div>

              <button
                onClick={() => setGs(prev => ({ ...prev, bet: selectedChip }))}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: 'linear-gradient(135deg,#f4c430,#d97706)',
                  color: '#0a0010', fontSize: 15, fontWeight: 900,
                  border: 'none', cursor: 'pointer',
                  opacity: !gs.betType || selectedChip > gs.balance ? 0.5 : 1,
                  pointerEvents: !gs.betType || selectedChip > gs.balance ? 'none' : 'auto',
                }}
              >
                DEAL
              </button>
            </>
          )}

          {gs.phase === 'result' && (
            <button
              onClick={handleNewGame}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color: '#fff', fontSize: 15, fontWeight: 900,
                border: 'none', cursor: 'pointer',
              }}
            >
              NEW ROUND
            </button>
          )}
        </div>

        {/* History */}
        {gs.history.length > 0 && (
          <div style={{
            marginTop: 24, padding: 16, borderRadius: 12,
            background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
          }}>
            <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, marginBottom: 12 }}>RECENT RESULTS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {gs.history.slice(0, 10).map((h, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: h.winner === 'player' ? 'rgba(34,197,94,0.2)' : h.winner === 'banker' ? 'rgba(124,58,237,0.2)' : 'rgba(244,196,48,0.2)',
                  border: `1px solid ${h.winner === 'player' ? '#22c55e' : h.winner === 'banker' ? '#7c3aed' : '#f4c430'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                  color: h.winner === 'player' ? '#22c55e' : h.winner === 'banker' ? '#7c3aed' : '#f4c430',
                }}>
                  {h.winner[0]!.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12,
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Baccarat Rules</h3>
          <ul style={{ fontSize: 12, color: C.textDim, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Bet on Player (1:1), Banker (0.95:1 with 5% commission), or Tie (8:1)</li>
            <li>Goal is to predict which hand will have a value closest to 9</li>
            <li>Card values: A=1, 2-9=face value, 10/J/Q/K=0</li>
            <li>Hand values are the sum of cards modulo 10 (e.g., 7+8=15 → 5)</li>
            <li>Player draws on 0-5, stands on 6-7</li>
            <li>Banker draws based on complex rules depending on player&apos;s third card</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
