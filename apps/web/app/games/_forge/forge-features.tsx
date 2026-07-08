'use client';

import React, { useEffect, useState } from 'react';
import { forgeAudio } from './forge-audio';
import { CoinIcon } from './forge-icons';

/**
 * Post-win gamble (red/black double-or-nothing) and the four-suit
 * progressive mystery jackpot. Both are RTP-neutral / pool-funded:
 * gamble is a fair 50/50, jackpot pools are fed by a spin contribution.
 */

/* ── progressive pools ─────────────────────────────────────────────────── */

export interface JackpotPools {
  spades: number;
  hearts: number;
  diamonds: number;
  clubs: number;
}

const POOL_KEY = 'forge_jackpot_pools';
const POOL_SEED: JackpotPools = { spades: 458_124, hearts: 87_922, diamonds: 12_450, clubs: 1_420 };
// Fraction of every bet fed into the pools (part of the game's cost model).
const CONTRIBUTION = 0.01;
const SPLIT: [keyof JackpotPools, number][] = [
  ['spades', 0.5],
  ['hearts', 0.28],
  ['diamonds', 0.15],
  ['clubs', 0.07],
];

export function loadPools(): JackpotPools {
  if (typeof window === 'undefined') return { ...POOL_SEED };
  try {
    const raw = localStorage.getItem(POOL_KEY);
    if (raw) {
      const p = JSON.parse(raw) as JackpotPools;
      if (Number.isFinite(p.spades)) return p;
    }
  } catch {
    /* corrupted → reseed */
  }
  return { ...POOL_SEED };
}

function savePools(p: JackpotPools): void {
  try {
    localStorage.setItem(POOL_KEY, JSON.stringify(p));
  } catch {
    /* storage full — pools are cosmetic-persistent only */
  }
}

export function tickPools(betCost: number): JackpotPools {
  const p = loadPools();
  for (const [suit, share] of SPLIT) p[suit] += betCost * CONTRIBUTION * share;
  savePools(p);
  return p;
}

function claimPool(suit: keyof JackpotPools): number {
  const p = loadPools();
  const amount = Math.round(p[suit]);
  p[suit] = POOL_SEED[suit];
  savePools(p);
  return amount;
}

/* ── gamble overlay ────────────────────────────────────────────────────── */

const MAX_GAMBLE_STEPS = 5;

export function GambleOverlay({
  stake,
  rng,
  accent,
  onClose,
}: {
  stake: number;
  rng: () => number;
  accent: string;
  onClose: (finalAmount: number) => void;
}) {
  const [amount, setAmount] = useState(stake);
  const [step, setStep] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [card, setCard] = useState<'red' | 'black' | null>(null);
  const [history, setHistory] = useState<('red' | 'black')[]>([]);
  const [lost, setLost] = useState(false);

  const guess = (pick: 'red' | 'black') => {
    if (flipping || lost) return;
    setFlipping(true);
    setCard(null);
    forgeAudio.play('click');
    setTimeout(() => {
      const actual: 'red' | 'black' = rng() < 0.5 ? 'red' : 'black';
      setCard(actual);
      setHistory((h) => [actual, ...h].slice(0, 6));
      setFlipping(false);
      if (actual === pick) {
        const doubled = amount * 2;
        setAmount(doubled);
        setStep((s) => s + 1);
        forgeAudio.play('winMedium');
        if (step + 1 >= MAX_GAMBLE_STEPS) {
          forgeAudio.play('bigWin');
          setTimeout(() => onClose(doubled), 1200);
        }
      } else {
        setLost(true);
        forgeAudio.play('burst');
        setTimeout(() => onClose(0), 1500);
      }
    }, 700);
  };

  return (
    <div className="fg-overlay">
      <div className="fg-modal fg-gamble" onClick={(e) => e.stopPropagation()}>
        <h3>RİSKE AT — KIRMIZI / SİYAH</h3>
        <p className="fg-gamble-note">
          Doğru rengi bil, kazancını ikiye katla. Yanlış bilirsen hepsi gider. (adil 50/50)
        </p>

        <div className={`fg-gamble-card${flipping ? ' fg-flipping' : ''}`}
          style={{
            background: card === 'red' ? 'linear-gradient(135deg,#ef4444,#7f1d1d)'
              : card === 'black' ? 'linear-gradient(135deg,#27272a,#09090b)'
              : 'linear-gradient(135deg,#3b0764,#1e1b4b)',
          }}
        >
          {flipping ? '?' : card === 'red' ? '♥' : card === 'black' ? '♠' : '?'}
        </div>

        <div className="fg-gamble-amount" style={{ color: accent }}>
          {lost ? 'KAYBETTİN' : (
            <>
              {amount.toLocaleString('tr-TR')} <CoinIcon size={16} />
            </>
          )}
        </div>
        <div className="fg-gamble-step">
          Adım {Math.min(step + 1, MAX_GAMBLE_STEPS)}/{MAX_GAMBLE_STEPS}
          {history.length > 0 && (
            <span className="fg-gamble-hist">
              {history.map((h, i) => (
                <span key={i} style={{ color: h === 'red' ? '#ef4444' : '#a1a1aa' }}>
                  {h === 'red' ? '♥' : '♠'}
                </span>
              ))}
            </span>
          )}
        </div>

        <div className="fg-gamble-actions">
          <button
            className="fg-gamble-red"
            disabled={flipping || lost}
            onClick={() => guess('red')}
          >
            ♥ KIRMIZI
          </button>
          <button
            className="fg-gamble-black"
            disabled={flipping || lost}
            onClick={() => guess('black')}
          >
            ♠ SİYAH
          </button>
        </div>
        <button
          className="fg-modal-cancel fg-gamble-cashout"
          disabled={flipping || lost}
          onClick={() => {
            forgeAudio.play('coin');
            onClose(amount);
          }}
        >
          KAZANCI AL ({amount.toLocaleString('tr-TR')})
        </button>
      </div>

      <style>{`
        .fg-gamble { text-align: center; max-width: 380px; }
        .fg-gamble-note { font-size: 12px; opacity: 0.7; }
        .fg-gamble-card { width: 110px; height: 150px; margin: 16px auto 10px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 54px; color: #fff; border: 2px solid rgba(255,255,255,0.25); box-shadow: 0 12px 40px rgba(0,0,0,0.6); transition: background 0.2s; }
        .fg-flipping { animation: fgCardFlip 0.7s ease infinite; }
        @keyframes fgCardFlip { 0%,100% { transform: rotateY(0); } 50% { transform: rotateY(90deg); } }
        .fg-gamble-amount { font-size: 26px; font-weight: 900; margin-top: 4px; }
        .fg-gamble-step { font-size: 11px; opacity: 0.65; margin: 6px 0 14px; }
        .fg-gamble-hist { margin-left: 10px; letter-spacing: 3px; font-size: 13px; }
        .fg-gamble-actions { display: flex; gap: 10px; }
        .fg-gamble-red, .fg-gamble-black { flex: 1; border: none; border-radius: 12px; padding: 14px 0; font-size: 14px; font-weight: 900; letter-spacing: 1px; cursor: pointer; color: #fff; transition: transform 0.12s; }
        .fg-gamble-red { background: linear-gradient(135deg, #ef4444, #991b1b); }
        .fg-gamble-black { background: linear-gradient(135deg, #3f3f46, #18181b); border: 1px solid rgba(255,255,255,0.2); }
        .fg-gamble-red:hover:not(:disabled), .fg-gamble-black:hover:not(:disabled) { transform: scale(1.04); }
        .fg-gamble-red:disabled, .fg-gamble-black:disabled { opacity: 0.5; cursor: default; }
        .fg-gamble-cashout { width: 100%; margin-top: 10px; }
      `}</style>
    </div>
  );
}

/* ── mystery jackpot overlay ───────────────────────────────────────────── */

type Suit = keyof JackpotPools;
const SUIT_GLYPH: Record<Suit, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const SUIT_COLOR: Record<Suit, string> = {
  spades: '#818cf8',
  hearts: '#f87171',
  diamonds: '#d4af37',
  clubs: '#4ade80',
};

interface JackpotCard {
  id: number;
  suit: Suit;
  revealed: boolean;
}

export function JackpotOverlay({
  rng,
  onClose,
}: {
  rng: () => number;
  onClose: (amount: number) => void;
}) {
  const [pools, setPools] = useState<JackpotPools>(POOL_SEED);
  const [cards, setCards] = useState<JackpotCard[]>([]);
  const [won, setWon] = useState<{ suit: Suit; amount: number } | null>(null);

  useEffect(() => {
    setPools(loadPools());
    const deck: Suit[] = (['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]).flatMap(
      (s) => [s, s, s],
    );
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck.map((suit, id) => ({ id, suit, revealed: false })));
    forgeAudio.play('freeSpinIntro');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reveal = (id: number) => {
    if (won) return;
    const target = cards.find((c) => c.id === id);
    if (!target || target.revealed) return;
    forgeAudio.play('click');
    const next = cards.map((c) => (c.id === id ? { ...c, revealed: true } : c));
    setCards(next);
    const count = next.filter((c) => c.revealed && c.suit === target.suit).length;
    if (count === 3) {
      const amount = claimPool(target.suit);
      setWon({ suit: target.suit, amount });
      forgeAudio.play('bigWin');
      setTimeout(() => onClose(amount), 2800);
    }
  };

  return (
    <div className="fg-overlay">
      <div className="fg-modal fg-jackpot" onClick={(e) => e.stopPropagation()}>
        <h3>GİZEMLİ JACKPOT KARTLARI</h3>
        <p className="fg-jackpot-note">Aynı renkten 3 kart bul — o havuzun tamamını kazan!</p>

        <div className="fg-jackpot-pools">
          {(Object.keys(SUIT_GLYPH) as Suit[]).map((s) => (
            <div key={s} className="fg-jackpot-pool" style={{ borderColor: `${SUIT_COLOR[s]}55` }}>
              <span style={{ color: SUIT_COLOR[s] }}>{SUIT_GLYPH[s]}</span>
              <b>{Math.round(pools[s]).toLocaleString('tr-TR')}</b>
            </div>
          ))}
        </div>

        <div className="fg-jackpot-grid">
          {cards.map((c) => (
            <button
              key={c.id}
              className={`fg-jackpot-card${c.revealed ? ' fg-jp-open' : ''}`}
              style={c.revealed ? { color: SUIT_COLOR[c.suit], borderColor: `${SUIT_COLOR[c.suit]}88` } : undefined}
              onClick={() => reveal(c.id)}
            >
              {c.revealed ? SUIT_GLYPH[c.suit] : '?'}
            </button>
          ))}
        </div>

        {won && (
          <div className="fg-jackpot-win" style={{ color: SUIT_COLOR[won.suit] }}>
            {SUIT_GLYPH[won.suit]} JACKPOT! +{won.amount.toLocaleString('tr-TR')} <CoinIcon size={18} />
          </div>
        )}
      </div>

      <style>{`
        .fg-jackpot { text-align: center; max-width: 420px; }
        .fg-jackpot-note { font-size: 12px; opacity: 0.7; }
        .fg-jackpot-pools { display: flex; gap: 8px; justify-content: center; margin: 12px 0; flex-wrap: wrap; }
        .fg-jackpot-pool { display: flex; align-items: center; gap: 6px; font-size: 12px; background: rgba(0,0,0,0.4); border: 1px solid; border-radius: 999px; padding: 4px 12px; }
        .fg-jackpot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 14px 0; }
        .fg-jackpot-card { aspect-ratio: 3/4; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: linear-gradient(160deg, #312e81, #1e1b4b); color: rgba(255,255,255,0.5); font-size: 26px; font-weight: 900; cursor: pointer; transition: transform 0.15s, background 0.2s; }
        .fg-jackpot-card:hover:not(.fg-jp-open) { transform: translateY(-3px); }
        .fg-jp-open { background: #0b0b0d; animation: fgJpFlip 0.35s ease; cursor: default; }
        @keyframes fgJpFlip { from { transform: rotateY(90deg); } to { transform: rotateY(0); } }
        .fg-jackpot-win { font-size: 22px; font-weight: 900; margin-top: 6px; animation: fgZoom 0.4s ease; }
      `}</style>
    </div>
  );
}
