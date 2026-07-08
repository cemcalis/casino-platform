'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  cryptoRng,
  defaultCrashConfig,
  drawCrashPoint,
  multiplierAt,
} from '@casino/forge';
import { forgeAudio } from '../_forge/forge-audio';
import { CoinIcon } from '../_forge/forge-icons';

const BETS = [10, 25, 50, 100, 250, 500];
const START_BALANCE = 10_000;
const STORAGE_KEY = 'forge_rocket_rush';

type Phase = 'idle' | 'flying' | 'crashed' | 'cashed';

interface HistoryEntry {
  id: number;
  crash: number;
}

export default function RocketRushPage() {
  const rngRef = useRef(cryptoRng());
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const crashRef = useRef(0);
  const cashedRef = useRef(false);

  const [balance, setBalance] = useState(START_BALANCE);
  const [bet, setBet] = useState(BETS[1]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [mult, setMult] = useState(1);
  const [cashMult, setCashMult] = useState(0);
  const [autoCash, setAutoCash] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const n = Number(saved);
      if (Number.isFinite(n) && n > 0) setBalance(n);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(Math.round(balance * 100) / 100));
  }, [balance]);

  const settleCrash = useCallback((crash: number) => {
    setPhase('crashed');
    forgeAudio.play('burst');
    forgeAudio.play('bomb');
    setHistory((h) => [{ id: Date.now(), crash }, ...h].slice(0, 14));
    setTimeout(() => setPhase('idle'), 1600);
  }, []);

  const cashOut = useCallback(() => {
    if (cashedRef.current) return;
    cashedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    const m = multiplierAt(performance.now() - startRef.current);
    const final = Math.min(m, crashRef.current);
    setCashMult(final);
    setPhase('cashed');
    setBalance((b) => Math.round((b + bet * final) * 100) / 100);
    forgeAudio.play('bigWin');
    setHistory((h) => [{ id: Date.now(), crash: crashRef.current }, ...h].slice(0, 14));
    setTimeout(() => setPhase('idle'), 1600);
  }, [bet]);

  const launch = () => {
    if (phase !== 'idle' || bet > balance) return;
    forgeAudio.setMuted(muted);
    if (!muted) forgeAudio.startMusic('arcade');
    setBalance((b) => Math.round((b - bet) * 100) / 100);
    crashRef.current = drawCrashPoint(defaultCrashConfig, rngRef.current);
    cashedRef.current = false;
    startRef.current = performance.now();
    setMult(1);
    setCashMult(0);
    setPhase('flying');
    forgeAudio.play('spin');
    forgeAudio.startSpinLoop();

    const target = autoCash ? parseFloat(autoCash) : 0;
    const step = (now: number) => {
      const m = multiplierAt(now - startRef.current);
      if (m >= crashRef.current) {
        forgeAudio.stopSpinLoop();
        setMult(crashRef.current);
        settleCrash(crashRef.current);
        return;
      }
      if (target >= 1.01 && m >= target && !cashedRef.current) {
        forgeAudio.stopSpinLoop();
        cashOut();
        return;
      }
      setMult(m);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const manualCashOut = () => {
    forgeAudio.stopSpinLoop();
    cashOut();
  };

  const flying = phase === 'flying';
  // Rocket climbs with the log of the multiplier so it stays on screen.
  const progress = Math.min(1, Math.log(Math.max(mult, 1)) / Math.log(30));

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_bottom,#1e1b4b_0%,#0a0a14_55%,#050508_100%)] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-3.5">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-black tracking-wide text-[#d4af37]">
            ROCKET RUSH
          </h1>
          <span className="text-[10px] uppercase tracking-[2px] text-white/45">
            Forge Studio · Crash · RTP %96
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[2px] text-white/45">BAKİYE</div>
          <div className="text-lg font-black text-[#d4af37] flex items-center gap-1.5 justify-end">
            {balance.toLocaleString('tr-TR')} <CoinIcon size={15} />
          </div>
        </div>
      </header>

      {/* HISTORY CHIPS */}
      <div className="flex gap-1.5 px-5 pb-1 overflow-x-auto scrollbar-none">
        {history.map((h) => (
          <span
            key={h.id}
            className={`flex-shrink-0 text-[11px] font-black px-2.5 py-1 rounded-full border ${
              h.crash >= 10
                ? 'text-[#d4af37] border-[#d4af37]/40 bg-[#d4af37]/10'
                : h.crash >= 2
                  ? 'text-green-400 border-green-500/30 bg-green-500/10'
                  : 'text-red-400 border-red-500/30 bg-red-500/10'
            }`}
          >
            {h.crash.toFixed(2)}x
          </span>
        ))}
        {history.length === 0 && (
          <span className="text-[11px] text-white/30">İlk turu başlat — geçmiş burada birikir.</span>
        )}
      </div>

      {/* FLIGHT AREA */}
      <div className="relative flex-1 mx-4 md:mx-8 my-2 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        {/* stars */}
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${(i * 23 + 7) % 100}%`,
              top: `${(i * 17 + 3) % 100}%`,
              opacity: 0.5,
              animation: flying ? `rrStar ${0.5 + (i % 5) * 0.2}s linear infinite` : 'none',
            }}
          />
        ))}

        {/* multiplier readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`font-display font-black tracking-wide transition-colors ${
              phase === 'crashed' ? 'text-red-500' : phase === 'cashed' ? 'text-green-400' : 'text-white'
            }`}
            style={{ fontSize: 'clamp(44px, 10vw, 110px)', textShadow: '0 6px 40px rgba(0,0,0,0.8)' }}
          >
            {phase === 'cashed' ? cashMult.toFixed(2) : mult.toFixed(2)}x
          </div>
          {phase === 'crashed' && (
            <div className="text-red-400 font-black tracking-[3px] text-sm md:text-lg animate-[fadeIn_0.2s_ease]">
              ROKET PATLADI
            </div>
          )}
          {phase === 'cashed' && (
            <div className="text-green-400 font-black tracking-[2px] text-sm md:text-lg flex items-center gap-1.5">
              +{Math.round(bet * cashMult).toLocaleString('tr-TR')} <CoinIcon size={14} /> ALINDI
            </div>
          )}
        </div>

        {/* rocket */}
        <div
          className="absolute transition-transform duration-100"
          style={{
            left: `${8 + progress * 70}%`,
            bottom: `${6 + progress * 74}%`,
            transform: `rotate(${-38 + progress * 10}deg) scale(${phase === 'crashed' ? 0 : 1})`,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
            <path d="M38 8c8 2 16 10 18 18-6 2-12 2-18 0-2-6-2-12 0-18Z" fill="#e4e4e7" />
            <path d="M38 8c8 2 16 10 18 18l-9-1-8-8-1-9Z" fill="#8b5cf6" />
            <circle cx="42" cy="22" r="4.5" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
            <path d="M30 24l-10 2 6 6 6-2m8 8l2 6 6-6-2-6" fill="#d4af37" />
            <path d="M28 36 14 50" stroke="#f97316" strokeWidth="5" strokeLinecap="round" opacity={flying ? 0.9 : 0.3} />
            <path d="M24 32 8 48" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity={flying ? 0.8 : 0.2} />
          </svg>
        </div>

        {phase === 'crashed' && (
          <div
            className="absolute w-24 h-24 rounded-full animate-[rrBoom_0.6s_ease_forwards]"
            style={{
              left: `${8 + progress * 70}%`,
              bottom: `${6 + progress * 74}%`,
              background: 'radial-gradient(circle, #fbbf24 0%, #f97316 40%, transparent 70%)',
            }}
          />
        )}
      </div>

      {/* CONTROLS */}
      <footer className="px-4 md:px-8 pb-5 pt-1 flex flex-wrap items-end justify-center gap-4">
        <div>
          <span className="text-[10px] tracking-[2px] text-white/45 block mb-1.5">BAHİS</span>
          <div className="flex gap-1.5">
            {BETS.map((b) => (
              <button
                key={b}
                disabled={flying}
                onClick={() => {
                  forgeAudio.play('click');
                  setBet(b);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                  bet === b
                    ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white'
                    : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
                } disabled:opacity-40`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] tracking-[2px] text-white/45 block mb-1.5">OTO CASH-OUT</span>
          <input
            value={autoCash}
            disabled={flying}
            onChange={(e) => setAutoCash(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="örn. 2.00"
            className="w-28 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm font-bold text-[#d4af37] placeholder-white/25 focus:outline-none focus:border-[#8b5cf6]/60 disabled:opacity-40"
          />
        </div>

        {flying ? (
          <button
            onClick={manualCashOut}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-display font-black text-base tracking-widest shadow-[0_8px_30px_rgba(34,197,94,0.35)] transition-transform hover:scale-105 animate-pulse"
          >
            CASH OUT · {Math.round(bet * mult).toLocaleString('tr-TR')}
          </button>
        ) : (
          <button
            onClick={launch}
            disabled={phase !== 'idle' || bet > balance}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#8b5cf6] text-white font-display font-black text-base tracking-widest shadow-[0_8px_30px_rgba(139,92,246,0.35)] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            KALKIŞ
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              forgeAudio.setMuted(next);
            }}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white/70"
          >
            {muted ? 'SES AÇ' : 'SES KIS'}
          </button>
          <button
            disabled={flying}
            onClick={() => setBalance(START_BALANCE)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white/70 disabled:opacity-40"
          >
            SIFIRLA
          </button>
          <Link
            href="/"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white/70 hover:text-white"
          >
            LOBİ
          </Link>
        </div>
      </footer>

      <p className="text-center text-[10px] text-white/35 pb-3">
        Demo mod — sanal para. Her stratejide RTP %96: P(crash ≥ m) = 0.96 / m.
      </p>

      <style>{`
        @keyframes rrStar { from { transform: translateY(0); } to { transform: translateY(40px); } }
        @keyframes rrBoom { from { transform: scale(0.3); opacity: 1; } to { transform: scale(2.4); opacity: 0; } }
      `}</style>
    </div>
  );
}
