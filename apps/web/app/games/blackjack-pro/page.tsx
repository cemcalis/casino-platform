'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────────── */
const C = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
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
  0%   { opacity:0; transform: translate(120px,-80px) rotate(8deg) scale(0.6); }
  60%  { opacity:1; transform: translate(-4px,3px) rotate(-1deg) scale(1.02); }
  100% { opacity:1; transform: translate(0,0) rotate(0deg) scale(1); }
}
@keyframes cardFlipFwd {
  0%   { transform: scaleX(1); }
  50%  { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}
@keyframes toastIn {
  0%   { opacity:0; transform: translateY(40px) scale(0.85); }
  15%  { opacity:1; transform: translateY(0) scale(1.04); }
  25%  { transform: scale(1); }
  75%  { opacity:1; transform: translateY(0) scale(1); }
  100% { opacity:0; transform: translateY(-20px) scale(0.95); }
}
@keyframes chipBounce {
  0%,100% { transform: scale(1) translateY(0); }
  35%      { transform: scale(1.18) translateY(-6px); }
  65%      { transform: scale(0.95) translateY(2px); }
}
@keyframes tablePulse {
  0%,100% { box-shadow: inset 0 0 60px rgba(34,197,94,0.04), 0 0 80px rgba(34,197,94,0.06); }
  50%      { box-shadow: inset 0 0 80px rgba(34,197,94,0.10), 0 0 100px rgba(34,197,94,0.12); }
}
@keyframes twinkle {
  0%,100% { opacity:0.15; transform:scale(1); }
  50%      { opacity:0.8; transform:scale(1.5); }
}
@keyframes fadeSlideIn {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400% center; }
  100% { background-position: 400% center; }
}
@keyframes dealerThink {
  0%,100% { opacity:0.4; }
  50%      { opacity:1; }
}
@keyframes resultPop {
  0%   { opacity:0; transform:scale(0.5) rotate(-5deg); }
  60%  { transform:scale(1.12) rotate(1deg); }
  100% { opacity:1; transform:scale(1) rotate(0deg); }
}
@keyframes orbFloat {
  0%,100% { transform:translateY(0) scale(1); }
  50%      { transform:translateY(-14px) scale(1.03); }
}
`;

/* ─── TYPES ──────────────────────────────────────────────────────────────────── */
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Phase = 'betting' | 'playing' | 'dealer' | 'result';
type RoundResult = 'win' | 'loss' | 'push' | 'blackjack' | 'bust';

interface Card {
  rank: Rank;
  suit: Suit;
  faceDown?: boolean;
  dealIdx?: number; // for deal animation ordering
}

interface HistoryEntry {
  result: RoundResult;
  net: number;
  bet: number;
}

interface GameState {
  phase: Phase;
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  bet: number;
  balance: number;
  lastResult: RoundResult | null;
  history: HistoryEntry[];
  sessionStats: { wins: number; losses: number; pushes: number; net: number };
  toast: { msg: string; positive: boolean } | null;
}

/* ─── DECK LOGIC ─────────────────────────────────────────────────────────────── */
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const NUM_DECKS = 6;

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
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function getHandValue(cards: Card[]): number {
  const visible = cards.filter(c => !c.faceDown);
  let total = 0;
  let aces = 0;
  for (const c of visible) {
    const v = cardValue(c.rank);
    total += v;
    if (c.rank === 'A') aces++;
  }
  // Soft → hard: drop ace from 11 to 1 while bust
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isSoftHand(cards: Card[]): boolean {
  const visible = cards.filter(c => !c.faceDown);
  let total = 0;
  let aces = 0;
  for (const c of visible) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  // If we have an ace counted as 11 (not yet reduced), it's a soft hand
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return aces > 0 && total <= 21;
}

function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const vals = cards.map(c => c.rank);
  return (
    (vals.includes('A') && vals.some(r => ['10','J','Q','K'].includes(r)))
  );
}

/* ─── INITIAL STATE ──────────────────────────────────────────────────────────── */
const STARTING_BALANCE = 10_000;
const BALANCE_KEY = 'bj_demo_balance';

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

function makeInitial(balance: number): GameState {
  return {
    phase: 'betting',
    deck: buildDeck(),
    playerHand: [],
    dealerHand: [],
    bet: 0,
    balance,
    lastResult: null,
    history: [],
    sessionStats: { wins: 0, losses: 0, pushes: 0, net: 0 },
    toast: null,
  };
}

/* ─── CARD COMPONENT ─────────────────────────────────────────────────────────── */
const RED_SUITS: Suit[] = ['♥', '♦'];

function PlayingCard({ card, animIdx = 0, flipping = false }: {
  card: Card; animIdx?: number; flipping?: boolean;
}) {
  const isRed = RED_SUITS.includes(card.suit);
  const delay = animIdx * 0.13;

  if (card.faceDown) {
    return (
      <div style={{
        width: 80, height: 110,
        borderRadius: 10,
        background: 'linear-gradient(135deg,#1a0035 0%,#0a001e 50%,#1a0035 100%)',
        border: '2px solid #3d1060',
        boxShadow: '0 6px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        animation: flipping ? 'cardFlipFwd 0.5s ease-in-out' : `cardDeal 0.45s ${delay}s cubic-bezier(0.22,0.61,0.36,1) both`,
        flexShrink: 0,
      }}>
        {/* Back pattern */}
        <div style={{
          position: 'absolute', inset: 6,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(124,58,237,0.18) 0px, rgba(124,58,237,0.18) 2px, transparent 2px, transparent 10px)',
          borderRadius: 6,
          border: '1px solid rgba(124,58,237,0.3)',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.2) 0%, transparent 70%)',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 22, color: 'rgba(124,58,237,0.6)',
          fontWeight: 900,
        }}>♠</div>
      </div>
    );
  }

  return (
    <div style={{
      width: 80, height: 110,
      borderRadius: 10,
      background: '#ffffff',
      border: '2px solid #e0d0f0',
      boxShadow: '0 6px 24px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
      position: 'relative',
      color: isRed ? '#cc1122' : '#111122',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 800,
      animation: flipping
        ? 'cardFlipFwd 0.5s ease-in-out'
        : `cardDeal 0.45s ${delay}s cubic-bezier(0.22,0.61,0.36,1) both`,
      flexShrink: 0,
    }}>
      {/* Top-left rank + suit */}
      <div style={{
        position: 'absolute', top: 5, left: 7,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 1,
      }}>
        <span style={{ fontSize: card.rank === '10' ? 13 : 15, fontWeight: 900, letterSpacing: '-1px' }}>{card.rank}</span>
        <span style={{ fontSize: 12, marginTop: 1 }}>{card.suit}</span>
      </div>
      {/* Bottom-right rank + suit (rotated) */}
      <div style={{
        position: 'absolute', bottom: 5, right: 7,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        lineHeight: 1,
        transform: 'rotate(180deg)',
      }}>
        <span style={{ fontSize: card.rank === '10' ? 13 : 15, fontWeight: 900, letterSpacing: '-1px' }}>{card.rank}</span>
        <span style={{ fontSize: 12, marginTop: 1 }}>{card.suit}</span>
      </div>
      {/* Center suit */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        fontSize: card.rank === '10' ? 32 : 36,
        opacity: 0.85,
        userSelect: 'none',
      }}>{card.suit}</div>
    </div>
  );
}

/* ─── HAND VALUE BADGE ───────────────────────────────────────────────────────── */
function HandBadge({ cards, label, isDealer = false }: { cards: Card[]; label: string; isDealer?: boolean }) {
  const val = getHandValue(cards);
  const soft = isSoftHand(cards) && val < 21;
  const bust = val > 21;
  const bj = isBlackjack(cards) && !isDealer;
  const visibleCount = cards.filter(c => !c.faceDown).length;
  if (visibleCount === 0) return null;

  let color = C.text;
  let bg = 'rgba(19,0,32,0.85)';
  let border = C.cardBorder;
  if (bust) { color = C.magenta; border = C.magenta; }
  else if (bj) { color = C.goldBright; border = C.goldBright; bg = 'rgba(40,30,0,0.9)'; }
  else if (val === 21) { color = C.green; border = C.green; }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      <div style={{
        padding: '3px 10px', borderRadius: 20,
        background: bg, border: `1px solid ${border}`,
        fontSize: 13, fontWeight: 800, color,
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {soft && <span style={{ fontSize: 10, color: C.cyan, fontWeight: 700 }}>SOFT</span>}
        <span>{bust ? 'BUST' : bj ? 'BLACKJACK!' : String(val)}</span>
      </div>
    </div>
  );
}

/* ─── CHIP ───────────────────────────────────────────────────────────────────── */
const CHIP_COLORS: Record<number, { bg: string; ring: string; text: string }> = {
  50:   { bg: 'linear-gradient(135deg,#1a3a6e,#2955a8)', ring: '#4488dd', text: '#cce0ff' },
  100:  { bg: 'linear-gradient(135deg,#3a1a6e,#6030b8)', ring: '#9966ee', text: '#e8d8ff' },
  200:  { bg: 'linear-gradient(135deg,#6e2a1a,#b04020)', ring: '#e06040', text: '#ffe0d8' },
  500:  { bg: 'linear-gradient(135deg,#1a5e2a,#28963e)', ring: '#44cc66', text: '#d0ffe0' },
};

function Chip({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) {
  const cfg = CHIP_COLORS[value]!;
  return (
    <button
      onClick={onClick}
      style={{
        width: 60, height: 60, borderRadius: '50%',
        background: cfg.bg,
        border: `3px solid ${selected ? C.goldBright : cfg.ring}`,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: cfg.text,
        fontSize: 13, fontWeight: 900,
        boxShadow: selected
          ? `0 0 0 3px ${C.goldBright}, 0 0 18px ${C.goldBright}88, 0 4px 12px rgba(0,0,0,0.6)`
          : `0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
        animation: selected ? 'chipBounce 0.4s ease' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Chip dashes around edge */}
      <div style={{
        position: 'absolute', inset: 5, borderRadius: '50%',
        border: `2px dashed ${cfg.ring}55`,
      }}/>
      <span style={{ position: 'relative', zIndex: 1, letterSpacing: '-0.5px' }}>{value}</span>
    </button>
  );
}

/* ─── ACTION BUTTON ─────────────────────────────────────────────────────────── */
function ActionBtn({ label, onClick, disabled, variant = 'default', small = false }: {
  label: string; onClick: () => void; disabled?: boolean; variant?: 'gold' | 'green' | 'red' | 'default'; small?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const grad: Record<string, string> = {
    gold:  'linear-gradient(135deg,#8a5e10 0%,#f4c430 30%,#ffe066 50%,#d4a030 70%,#8a5e10 100%)',
    green: `linear-gradient(135deg,#0f4020,${C.green} 50%,#1a6030)`,
    red:   `linear-gradient(135deg,#4a0020,${C.magenta} 50%,#6a0030)`,
    default: `linear-gradient(135deg,#1a0035,#3a1065 50%,#260840)`,
  };
  const textColor: Record<string, string> = {
    gold: '#0a0010', green: '#fff', red: '#fff', default: C.text,
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: small ? '8px 18px' : '13px 28px',
        borderRadius: 12,
        background: disabled ? 'rgba(255,255,255,0.06)' : grad[variant],
        border: `1px solid ${disabled ? '#260840' : variant === 'gold' ? '#f4c43077' : variant === 'green' ? `${C.green}66` : variant === 'red' ? `${C.magenta}66` : '#3d1070'}`,
        color: disabled ? C.textDim : textColor[variant],
        fontSize: small ? 12 : 14,
        fontWeight: 800,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '1.5px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : hover ? `0 0 24px ${variant === 'gold' ? '#f4c43066' : variant === 'green' ? `${C.green}55` : variant === 'red' ? `${C.magenta}55` : '#7c3aed44'}` : '0 4px 16px rgba(0,0,0,0.5)',
        transition: 'all 0.2s',
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        backgroundSize: '200% auto',
      }}
    >{label}</button>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────────── */
function Toast({ msg, positive }: { msg: string; positive: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9000,
      padding: '16px 36px', borderRadius: 16,
      background: positive
        ? 'linear-gradient(135deg,rgba(10,40,20,0.97),rgba(20,80,40,0.97))'
        : 'linear-gradient(135deg,rgba(40,10,20,0.97),rgba(80,20,40,0.97))',
      border: `2px solid ${positive ? C.green : C.magenta}`,
      color: positive ? C.green : C.magenta,
      fontSize: 22, fontWeight: 900,
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: 1,
      boxShadow: `0 8px 48px ${positive ? C.green : C.magenta}66`,
      animation: 'toastIn 2.8s ease forwards',
      whiteSpace: 'nowrap',
      textShadow: `0 0 16px ${positive ? C.green : C.magenta}`,
    }}>{msg}</div>
  );
}

/* ─── RESULT BADGE ───────────────────────────────────────────────────────────── */
const RESULT_CFG: Record<RoundResult, { label: string; color: string; bg: string }> = {
  blackjack: { label: 'BLACKJACK!', color: C.goldBright, bg: 'rgba(40,30,0,0.95)' },
  win:       { label: 'YOU WIN!',   color: C.green,      bg: 'rgba(5,30,15,0.95)' },
  push:      { label: 'PUSH',       color: C.cyan,       bg: 'rgba(0,20,20,0.95)' },
  loss:      { label: 'DEALER WINS', color: C.magenta,   bg: 'rgba(30,5,15,0.95)' },
  bust:      { label: 'BUST!',      color: C.magenta,    bg: 'rgba(30,5,15,0.95)' },
};

function ResultBadge({ result }: { result: RoundResult }) {
  const cfg = RESULT_CFG[result];
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      zIndex: 50,
      padding: '18px 48px', borderRadius: 18,
      background: cfg.bg,
      border: `2px solid ${cfg.color}`,
      color: cfg.color,
      fontSize: 28, fontWeight: 900,
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: 2,
      boxShadow: `0 0 60px ${cfg.color}55, 0 12px 40px rgba(0,0,0,0.8)`,
      animation: 'resultPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>{cfg.label}</div>
  );
}

/* ─── HISTORY ENTRY ─────────────────────────────────────────────────────────── */
function HistoryRow({ entry, idx }: { entry: HistoryEntry; idx: number }) {
  const isWin  = entry.result === 'win' || entry.result === 'blackjack';
  const isPush = entry.result === 'push';
  const label  = entry.result === 'blackjack' ? 'BJ' : entry.result === 'win' ? 'W' : entry.result === 'push' ? 'P' : 'L';
  const color  = isWin ? C.green : isPush ? C.cyan : C.magenta;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.05)`,
      animation: `fadeSlideIn 0.3s ${idx * 0.04}s both`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `${color}22`, border: `1px solid ${color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color, flexShrink: 0,
      }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.textDim }}>Bet {entry.bet.toLocaleString()}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color, flexShrink: 0 }}>
        {entry.net >= 0 ? '+' : ''}{entry.net.toLocaleString()}
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
      <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,197,94,0.07) 0%,transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)', animation: 'orbFloat 13s ease-in-out 3s infinite' }}/>
    </div>
  );
}

/* ─── DEALER THINKING DOTS ───────────────────────────────────────────────────── */
function DealerThinking() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: C.gold,
          animation: `dealerThink 0.9s ${i * 0.25}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── MAIN GAME ──────────────────────────────────────────────────────────────── */
export default function BlackjackProPage() {
  const router = useRouter();
  const [gs, setGs] = useState<GameState>(() => makeInitial(STARTING_BALANCE));
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [betInput, setBetInput] = useState('');
  const [flippingHole, setFlippingHole] = useState(false);
  const [isDealerThinking, setIsDealerThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dealerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted balance on mount
  useEffect(() => {
    const bal = loadBalance();
    setGs(prev => ({ ...prev, balance: bal }));
  }, []);

  // Persist balance whenever it changes
  useEffect(() => {
    saveBalance(gs.balance);
  }, [gs.balance]);

  // Cleanup dealer timer on unmount
  useEffect(() => {
    return () => { if (dealerTimerRef.current) clearTimeout(dealerTimerRef.current); };
  }, []);

  /* ── DEAL ─────────────────────────────────────────────────────────── */
  const handleDeal = useCallback(() => {
    setGs(prev => {
      if (prev.phase !== 'betting') return prev;
      if (prev.bet < 10 || prev.bet > 10_000) return prev;
      if (prev.bet > prev.balance) return prev;

      let deck = prev.deck.length < 52 ? buildDeck() : [...prev.deck];

      const draw = (): Card => {
        const c = deck.shift()!;
        return c;
      };

      const p1 = draw();
      const d1 = draw();
      const p2 = draw();
      const d2 = { ...draw(), faceDown: true };

      const playerHand: Card[] = [
        { ...p1, dealIdx: 0 },
        { ...p2, dealIdx: 2 },
      ];
      const dealerHand: Card[] = [
        { ...d1, dealIdx: 1 },
        { ...d2, dealIdx: 3 },
      ];

      // Instant blackjack check
      if (isBlackjack(playerHand)) {
        // Dealer reveals immediately
        dealerHand[1] = { ...dealerHand[1]!, faceDown: false };
        const dealerBJ = isBlackjack(dealerHand);
        const result: RoundResult = dealerBJ ? 'push' : 'blackjack';
        const payout = dealerBJ ? prev.bet : Math.floor(prev.bet * 2.5);
        const net = dealerBJ ? 0 : payout - prev.bet;
        const newBalance = prev.balance - prev.bet + payout;
        const entry: HistoryEntry = { result, net, bet: prev.bet };
        return {
          ...prev,
          deck,
          playerHand,
          dealerHand,
          balance: newBalance,
          phase: 'result',
          lastResult: result,
          toast: { msg: dealerBJ ? 'PUSH — Both Blackjack' : `+${net.toLocaleString()} VCOIN`, positive: result !== 'push' },
          history: [entry, ...prev.history].slice(0, 10),
          sessionStats: {
            wins:   prev.sessionStats.wins   + (result === 'blackjack' ? 1 : 0),
            losses: prev.sessionStats.losses,
            pushes: prev.sessionStats.pushes + (result === 'push' ? 1 : 0),
            net:    prev.sessionStats.net    + net,
          },
        };
      }

      return {
        ...prev,
        deck,
        playerHand,
        dealerHand,
        balance: prev.balance - prev.bet,
        phase: 'playing',
        lastResult: null,
        toast: null,
      };
    });
  }, []);

  /* ── HIT ──────────────────────────────────────────────────────────── */
  const handleHit = useCallback(() => {
    setGs(prev => {
      if (prev.phase !== 'playing') return prev;
      let deck = [...prev.deck];
      if (deck.length < 10) deck = buildDeck();
      const newCard = { ...deck.shift()!, dealIdx: prev.playerHand.length };
      const playerHand = [...prev.playerHand, newCard];
      const val = getHandValue(playerHand);
      if (val > 21) {
        // Bust — move to result
        return {
          ...prev,
          deck,
          playerHand,
          phase: 'result',
          lastResult: 'bust',
          toast: { msg: `-${prev.bet.toLocaleString()} VCOIN`, positive: false },
          history: [{ result: 'bust' as RoundResult, net: -prev.bet, bet: prev.bet }, ...prev.history].slice(0, 10),
          sessionStats: {
            ...prev.sessionStats,
            losses: prev.sessionStats.losses + 1,
            net: prev.sessionStats.net - prev.bet,
          },
        };
      }
      return { ...prev, deck, playerHand };
    });
  }, []);

  /* ── STAND (triggers dealer play) ────────────────────────────────── */
  const handleStand = useCallback(() => {
    setGs(prev => {
      if (prev.phase !== 'playing') return prev;
      // Reveal dealer hole card
      const dealerHand = prev.dealerHand.map(c => ({ ...c, faceDown: false }));
      return { ...prev, dealerHand, phase: 'dealer' };
    });
    setFlippingHole(true);
    setTimeout(() => setFlippingHole(false), 600);
    setIsDealerThinking(true);
  }, []);

  /* ── DOUBLE DOWN ─────────────────────────────────────────────────── */
  const handleDouble = useCallback(() => {
    setGs(prev => {
      if (prev.phase !== 'playing') return prev;
      if (prev.playerHand.length !== 2) return prev;
      if (prev.balance < prev.bet) return prev; // need another bet unit

      let deck = [...prev.deck];
      if (deck.length < 10) deck = buildDeck();
      const newCard = { ...deck.shift()!, dealIdx: 2 };
      const playerHand = [...prev.playerHand, newCard];
      const newBet = prev.bet * 2;
      const val = getHandValue(playerHand);

      if (val > 21) {
        return {
          ...prev,
          deck,
          playerHand,
          bet: newBet,
          balance: prev.balance - prev.bet, // extra bet deducted
          phase: 'result',
          lastResult: 'bust',
          toast: { msg: `-${newBet.toLocaleString()} VCOIN`, positive: false },
          history: [{ result: 'bust' as RoundResult, net: -newBet, bet: newBet }, ...prev.history].slice(0, 10),
          sessionStats: {
            ...prev.sessionStats,
            losses: prev.sessionStats.losses + 1,
            net: prev.sessionStats.net - newBet,
          },
        };
      }

      // Stand after double — trigger dealer
      const dealerHand = prev.dealerHand.map(c => ({ ...c, faceDown: false }));
      return {
        ...prev,
        deck,
        playerHand,
        dealerHand,
        bet: newBet,
        balance: prev.balance - prev.bet, // extra bet deducted
        phase: 'dealer',
        lastResult: null,
        toast: null,
      };
    });
    setFlippingHole(true);
    setTimeout(() => setFlippingHole(false), 600);
    setIsDealerThinking(true);
  }, []);

  /* ── DEALER AUTO-PLAY ────────────────────────────────────────────── */
  useEffect(() => {
    if (gs.phase !== 'dealer') return;
    setIsDealerThinking(true);

    const dealerStep = (state: GameState): GameState => {
      const val = getHandValue(state.dealerHand);
      const soft = isSoftHand(state.dealerHand);
      // Dealer draws to hard ≥ 17 or soft ≥ 18
      const shouldDraw = val < 17 || (soft && val === 17);
      if (!shouldDraw) return state; // dealer done, will be processed in next effect pass

      let deck = [...state.deck];
      if (deck.length < 10) deck = buildDeck();
      const newCard = { ...deck.shift()!, dealIdx: state.dealerHand.length };
      return { ...state, deck, dealerHand: [...state.dealerHand, newCard] };
    };

    const settle = (state: GameState): GameState => {
      const playerVal = getHandValue(state.playerHand);
      const dealerVal = getHandValue(state.dealerHand);
      const dealerBust = dealerVal > 21;

      let result: RoundResult;
      let net: number;
      let payout: number;

      if (dealerBust || playerVal > dealerVal) {
        result = 'win';
        payout = state.bet * 2;
        net = state.bet;
      } else if (playerVal === dealerVal) {
        result = 'push';
        payout = state.bet;
        net = 0;
      } else {
        result = 'loss';
        payout = 0;
        net = -state.bet;
      }

      const entry: HistoryEntry = { result, net, bet: state.bet };
      return {
        ...state,
        balance: state.balance + payout,
        phase: 'result',
        lastResult: result,
        toast: {
          msg: result === 'push'
            ? 'PUSH — Bet Returned'
            : net > 0
            ? `+${net.toLocaleString()} VCOIN`
            : `${net.toLocaleString()} VCOIN`,
          positive: net >= 0,
        },
        history: [entry, ...state.history].slice(0, 10),
        sessionStats: {
          wins:   state.sessionStats.wins   + (result === 'win' ? 1 : 0),
          losses: state.sessionStats.losses + (result === 'loss' ? 1 : 0),
          pushes: state.sessionStats.pushes + (result === 'push' ? 1 : 0),
          net:    state.sessionStats.net    + net,
        },
      };
    };

    const runDealer = (currentState: GameState) => {
      const val = getHandValue(currentState.dealerHand);
      const soft = isSoftHand(currentState.dealerHand);
      const shouldDraw = val < 17 || (soft && val === 17);

      if (shouldDraw) {
        dealerTimerRef.current = setTimeout(() => {
          setGs(prev => {
            if (prev.phase !== 'dealer') return prev;
            const next = dealerStep(prev);
            runDealer(next);
            return next;
          });
        }, 650);
      } else {
        dealerTimerRef.current = setTimeout(() => {
          setGs(prev => {
            if (prev.phase !== 'dealer') return prev;
            setIsDealerThinking(false);
            return settle(prev);
          });
        }, 400);
      }
    };

    runDealer(gs);

    return () => {
      if (dealerTimerRef.current) clearTimeout(dealerTimerRef.current);
    };
  }, [gs.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── NEW ROUND ───────────────────────────────────────────────────── */
  const handleNewRound = useCallback(() => {
    setGs(prev => ({
      ...prev,
      phase: 'betting',
      playerHand: [],
      dealerHand: [],
      lastResult: null,
      toast: null,
      // Keep bet from previous round as convenience
    }));
    setFlippingHole(false);
    setIsDealerThinking(false);
  }, []);

  /* ── RESET BALANCE ───────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    saveBalance(STARTING_BALANCE);
    setGs(makeInitial(STARTING_BALANCE));
    setFlippingHole(false);
    setIsDealerThinking(false);
  }, []);

  /* ── BET HELPERS ─────────────────────────────────────────────────── */
  const addChipToBet = useCallback((chipVal: number) => {
    setGs(prev => {
      if (prev.phase !== 'betting') return prev;
      const newBet = Math.min(prev.bet + chipVal, Math.min(prev.balance, 10_000));
      return { ...prev, bet: newBet };
    });
  }, []);

  const clearBet = useCallback(() => {
    setGs(prev => prev.phase === 'betting' ? { ...prev, bet: 0 } : prev);
    setBetInput('');
  }, []);

  const applyBetInput = useCallback(() => {
    const n = parseInt(betInput, 10);
    if (!isNaN(n) && n >= 10) {
      setGs(prev => {
        if (prev.phase !== 'betting') return prev;
        return { ...prev, bet: Math.min(n, Math.min(prev.balance, 10_000)) };
      });
    }
    setBetInput('');
  }, [betInput]);

  /* ── DERIVED ─────────────────────────────────────────────────────── */
  const canDouble   = gs.phase === 'playing' && gs.playerHand.length === 2 && gs.balance >= gs.bet;
  const canHitStand = gs.phase === 'playing';
  const canDeal     = gs.phase === 'betting' && gs.bet >= 10 && gs.bet <= gs.balance;
  const isBetting   = gs.phase === 'betting';
  const isResult    = gs.phase === 'result';
  const visibleStats = gs.sessionStats;
  const netColor = visibleStats.net > 0 ? C.green : visibleStats.net < 0 ? C.magenta : C.textDim;

  /* ── RENDER ──────────────────────────────────────────────────────── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>
      <Stars/>

      {gs.toast && <Toast key={gs.history.length} msg={gs.toast.msg} positive={gs.toast.positive}/>}

      <div style={{
        minHeight: '100vh',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
        background: 'radial-gradient(ellipse at 50% 0%,#0a1a10 0%,#06000e 60%)',
      }}>

        {/* ── TOP NAV ─────────────────────────────────────────────────── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          background: `rgba(13,0,24,0.9)`,
          borderBottom: `1px solid ${C.cardBorder}`,
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
          flexShrink: 0,
        }}>
          {/* Left */}
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.cardBorder}`,
              color: C.textDim, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.purple; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.borderColor = C.cardBorder; }}
          >
            <span style={{ fontSize: 16 }}>←</span> LOBBY
          </button>

          {/* Center */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(15px,2.5vw,20px)', fontWeight: 900, letterSpacing: 3,
              background: `linear-gradient(90deg,#0a6020,${C.green},#a0ffc0,${C.green},#0a6020)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
            }}>BLACKJACK PRO</div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, marginTop: 1 }}>6-DECK · DEMO MODE</div>
          </div>

          {/* Right: balance + demo badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Demo badge */}
            <div style={{
              padding: '4px 10px', borderRadius: 20,
              border: `1px solid ${C.gold}55`,
              color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: 2,
              background: `${C.gold}11`,
            }}>DEMO</div>
            {/* Balance */}
            <div style={{
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(212,168,72,0.08)',
              border: `1px solid ${C.gold}44`,
            }}>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginBottom: 1 }}>BALANCE</div>
              <div style={{
                fontSize: 16, fontWeight: 900, color: C.goldBright,
                textShadow: `0 0 12px ${C.gold}88`,
                letterSpacing: '-0.5px',
              }}>
                {gs.balance.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 600, color: C.gold }}>VCOIN</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden', minHeight: 0 }}>

          {/* ── TABLE + CONTROLS ────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 24px', gap: 16, overflow: 'auto' }}>

            {/* ── FELT TABLE ─────────────────────────────────────── */}
            <div style={{
              width: '100%', maxWidth: 700,
              borderRadius: 32,
              background: `radial-gradient(ellipse at 50% 40%, ${C.feltBright} 0%, ${C.feltMid} 45%, ${C.feltDark} 100%)`,
              border: `3px solid #1a4028`,
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 80px rgba(34,197,94,0.08)',
              animation: 'tablePulse 6s ease-in-out infinite',
              padding: '24px 28px 28px',
              position: 'relative',
              minHeight: 420,
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {/* Table rail ring */}
              <div style={{
                position: 'absolute', inset: 8,
                borderRadius: 26,
                border: '2px solid rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              }}/>

              {/* Blackjack pays 3:2 text */}
              <div style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.18)',
                letterSpacing: 3, whiteSpace: 'nowrap', textTransform: 'uppercase',
              }}>BLACKJACK PAYS 3 TO 2 · DEALER DRAWS TO HARD 17</div>

              {/* ── DEALER AREA ─────────────────────────────────── */}
              <div style={{ marginTop: 24, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HandBadge cards={gs.dealerHand} label="Dealer" isDealer />
                {isDealerThinking && gs.phase === 'dealer' && <DealerThinking/>}
                <div style={{
                  display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
                  minHeight: 120, alignItems: 'center',
                }}>
                  {gs.dealerHand.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 13, fontStyle: 'italic' }}>Waiting for deal…</div>
                  ) : gs.dealerHand.map((card, i) => (
                    <PlayingCard
                      key={i}
                      card={card}
                      animIdx={card.dealIdx ?? i}
                      flipping={flippingHole && i === 1 && !card.faceDown && gs.phase !== 'betting'}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)',
                margin: '12px 0',
              }}/>

              {/* ── PLAYER AREA ─────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HandBadge cards={gs.playerHand} label="Your Hand"/>
                <div style={{
                  display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
                  minHeight: 120, alignItems: 'center',
                }}>
                  {gs.playerHand.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 13, fontStyle: 'italic' }}>Place your bet to deal…</div>
                  ) : gs.playerHand.map((card, i) => (
                    <PlayingCard key={i} card={card} animIdx={card.dealIdx ?? i}/>
                  ))}
                </div>
              </div>

              {/* Result badge overlay */}
              {isResult && gs.lastResult && (
                <ResultBadge key={gs.history.length} result={gs.lastResult}/>
              )}
            </div>

            {/* ── ACTION BUTTONS ──────────────────────────────────── */}
            {canHitStand && (
              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
                animation: 'fadeSlideIn 0.3s both',
              }}>
                <ActionBtn label="HIT" onClick={handleHit} variant="green"/>
                <ActionBtn label="STAND" onClick={handleStand} variant="red"/>
                <ActionBtn
                  label="DOUBLE DOWN"
                  onClick={handleDouble}
                  variant="gold"
                  disabled={!canDouble}
                />
              </div>
            )}

            {/* ── NEW ROUND BUTTON ────────────────────────────────── */}
            {isResult && (
              <div style={{ display: 'flex', gap: 12, animation: 'fadeSlideIn 0.4s both' }}>
                <ActionBtn label="NEXT ROUND" onClick={handleNewRound} variant="green"/>
              </div>
            )}

            {/* ── BET CONTROLS ────────────────────────────────────── */}
            <div style={{
              width: '100%', maxWidth: 700,
              background: `rgba(13,0,24,0.8)`,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 20,
              padding: '18px 20px',
              backdropFilter: 'blur(8px)',
              opacity: isBetting ? 1 : 0.45,
              transition: 'opacity 0.3s',
            }}>
              {/* Current bet display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginBottom: 2 }}>CURRENT BET</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: gs.bet > 0 ? C.goldBright : C.textDim }}>
                    {gs.bet > 0 ? gs.bet.toLocaleString() : '—'}
                    {gs.bet > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: C.gold, marginLeft: 4 }}>VCOIN</span>}
                  </div>
                </div>
                {gs.bet > 0 && isBetting && (
                  <ActionBtn label="CLEAR" onClick={clearBet} variant="default" small/>
                )}
              </div>

              {/* Chip selector row */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                {[50, 100, 200, 500].map(v => (
                  <Chip
                    key={v}
                    value={v}
                    selected={selectedChip === v}
                    onClick={() => {
                      setSelectedChip(v);
                      if (isBetting) addChipToBet(v);
                    }}
                  />
                ))}
              </div>

              {/* Manual input + DEAL */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  placeholder="Enter bet amount"
                  value={betInput}
                  min={10}
                  max={10000}
                  onChange={e => setBetInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyBetInput(); }}
                  disabled={!isBetting}
                  style={{
                    flex: 1, minWidth: 120,
                    padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${C.cardBorder}`,
                    color: C.text, fontSize: 14, fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                  }}
                />
                <ActionBtn label="SET BET" onClick={applyBetInput} disabled={!isBetting} small/>
                <ActionBtn
                  label="DEAL"
                  onClick={handleDeal}
                  variant="gold"
                  disabled={!canDeal}
                />
              </div>
              {isBetting && gs.bet < 10 && (
                <div style={{ marginTop: 8, fontSize: 11, color: C.magenta }}>Min bet is 10 VCOIN</div>
              )}
              {isBetting && gs.bet > 0 && gs.bet > gs.balance && (
                <div style={{ marginTop: 8, fontSize: 11, color: C.magenta }}>Bet exceeds balance</div>
              )}
            </div>

            {/* ── RESET + SIDEBAR TOGGLE ──────────────────────────── */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <ActionBtn label="RESET BALANCE" onClick={handleReset} variant="default" small/>
              <ActionBtn
                label={sidebarOpen ? 'HIDE STATS' : 'SHOW STATS'}
                onClick={() => setSidebarOpen(o => !o)}
                variant="default"
                small
              />
            </div>

          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────────── */}
          {sidebarOpen && (
            <div style={{
              width: 240,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '20px 14px',
              background: `rgba(13,0,24,0.6)`,
              borderLeft: `1px solid ${C.cardBorder}`,
              backdropFilter: 'blur(10px)',
              overflow: 'auto',
              animation: 'fadeSlideIn 0.35s both',
            }}>

              {/* Session stats */}
              <div style={{
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 16,
                padding: '14px 14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 3, marginBottom: 12 }}>SESSION STATS</div>
                {[
                  { label: 'Wins',   val: visibleStats.wins,   color: C.green },
                  { label: 'Losses', val: visibleStats.losses, color: C.magenta },
                  { label: 'Pushes', val: visibleStats.pushes, color: C.cyan },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: C.textDim }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.val}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: `1px solid ${C.cardBorder}`,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, color: C.textDim }}>Net</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: netColor }}>
                    {visibleStats.net >= 0 ? '+' : ''}{visibleStats.net.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Round history */}
              <div style={{
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 16,
                padding: '14px 14px',
                flex: 1,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 3, marginBottom: 10 }}>LAST 10 ROUNDS</div>
                {gs.history.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.textDim, textAlign: 'center', marginTop: 16 }}>No rounds played yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {gs.history.map((entry, i) => (
                      <HistoryRow key={i} entry={entry} idx={i}/>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick rules */}
              <div style={{
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 16,
                padding: '14px 14px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 3, marginBottom: 10 }}>RULES</div>
                {[
                  'Blackjack pays 3:2',
                  'Dealer draws to hard 17',
                  'Dealer hits soft 17',
                  'Double on first 2 cards',
                  'Insurance not offered',
                  'No splitting',
                  '6 decks, reshuffled',
                ].map((rule, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: C.textDim,
                    paddingBottom: 5, marginBottom: 5,
                    borderBottom: i < 6 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                    paddingLeft: 8,
                    borderLeft: `2px solid ${C.cardBorder}`,
                  }}>{rule}</div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>
    </>
  );
}
