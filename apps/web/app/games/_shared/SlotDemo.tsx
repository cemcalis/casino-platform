'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

/* ─── Public interfaces ─────────────────────────────────────────────────────── */

export interface SlotSymbol {
  id: string;
  label: string;
  color: string;
  payout3: number;
  payout4: number;
  payout5: number;
}

export interface SlotConfig {
  gameId: string;
  gameName: string;
  provider: string;
  rtp: string;
  bgGradient: string;
  accentColor: string;
  accentColor2: string;
  symbols: SlotSymbol[]; // exactly 7, index 0 = lowest, 6 = highest
  storageKey: string;
}

/* ─── Engine constants ──────────────────────────────────────────────────────── */

// 5 paylines on a 5-column × 3-row grid (col, row)
const PAYLINES: [number, number][][] = [
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], // top row
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]], // mid row
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], // bottom row
  [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]], // V-shape diagonal
  [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]], // inverted V diagonal
];

const BETS = [10, 25, 50, 100, 200, 500];

// Column stop times (ms) — staggered for cascading feel
const STOP_TIMES = [700, 900, 1100, 1300, 1500];

const EVAL_DELAY = STOP_TIMES[4] + 220;

const STARTING_BALANCE = 10_000;
const BIG_WIN_MULTIPLIER = 20;
const FREE_SPIN_COUNT = 8;

/* ─── Web Audio sound engine ────────────────────────────────────────────────── */

function playSlotSound(type: 'spin' | 'win' | 'bigwin' | 'click' | 'tick'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'tick': {
        // Soft reel-stop thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'spin': {
        // Short white-noise burst
        const bufSize = Math.floor(ctx.sampleRate * 0.18);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.22;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        src.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        src.start(now);
        break;
      }

      case 'win': {
        // Ascending C-E-G arpeggio
        [261.63, 329.63, 392.0].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const t = now + i * 0.13;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        break;
      }

      case 'bigwin': {
        // C-major chord with layered harmonics
        [261.63, 329.63, 392.0, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
          osc.start(now);
          osc.stop(now + 2.0);
        });
        break;
      }
    }

    setTimeout(() => {
      try { ctx.close(); } catch { /* ignore */ }
    }, 3500);
  } catch {
    // Web Audio not supported — silent fallback
  }
}

/* ─── Internal types ────────────────────────────────────────────────────────── */

interface WinEntry {
  spin: number;
  win: number;
  bet: number;
}

interface SessionStats {
  totalBet: number;
  totalWon: number;
}

/* ─── SlotDemo component ────────────────────────────────────────────────────── */

export default function SlotDemo({ config }: { config: SlotConfig }) {
  const initGrid = (): number[][] =>
    Array.from({ length: 5 }, () => [0, 0, 0]);

  // ── Core state ──────────────────────────────────────────────────────────────
  const [displayGrid, setDisplayGrid] = useState<number[][]>(initGrid);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>(
    [false, false, false, false, false]
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === 'undefined') return STARTING_BALANCE;
    const raw = localStorage.getItem(config.storageKey);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : STARTING_BALANCE;
  });

  const [bet, setBet] = useState(25);
  const [autoSpin, setAutoSpin] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [winPaylines, setWinPaylines] = useState<number[]>([]);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [showBigWin, setShowBigWin] = useState(false);
  const [winHistory, setWinHistory] = useState<WinEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>(
    { totalBet: 0, totalWon: 0 }
  );
  const [spinCount, setSpinCount] = useState(0);

  // ── Presentation-only state (no effect on outcome/payout logic) ──────────
  const [stripSymbols, setStripSymbols] = useState<number[][]>(() =>
    Array.from({ length: 5 }, () => [])
  );
  const [landingCols, setLandingCols] = useState<Set<number>>(new Set());
  const [displayWin, setDisplayWin] = useState(0);
  const winRafRef = useRef<number | null>(null);

  // ── Refs for stale-closure–safe access inside timeouts ───────────────────
  const isSpinningRef = useRef(false);
  const balanceRef = useRef(balance);
  const betRef = useRef(bet);
  const freeSpinsRef = useRef(freeSpins);
  const spinCountRef = useRef(0);
  const lastPaidBetRef = useRef(bet); // last bet size used in a paid spin

  isSpinningRef.current = isSpinning;
  balanceRef.current = balance;
  betRef.current = bet;
  freeSpinsRef.current = freeSpins;
  spinCountRef.current = spinCount;

  // ── Persist balance ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.storageKey, String(balance));
    }
  }, [balance, config.storageKey]);

  // ── Win count-up animation (presentation only) ───────────────────────────
  useEffect(() => {
    if (winRafRef.current !== null) cancelAnimationFrame(winRafRef.current);
    if (lastWin <= 0) {
      setDisplayWin(0);
      return;
    }
    const duration = 700;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setDisplayWin(Math.round(lastWin * eased));
      if (t < 1) {
        winRafRef.current = requestAnimationFrame(tick);
      }
    };
    winRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (winRafRef.current !== null) cancelAnimationFrame(winRafRef.current);
    };
  }, [lastWin, spinCount]);

  // ── Spin logic ───────────────────────────────────────────────────────────
  const doSpin = useCallback(() => {
    if (isSpinningRef.current) return;

    const currentBet = betRef.current;
    const currentBal = balanceRef.current;
    const isFree = freeSpinsRef.current > 0;
    const cost = isFree ? 0 : currentBet;
    // Wins during free spins are credited at the last paid bet size
    const effectiveBet = isFree ? lastPaidBetRef.current : currentBet;

    if (!isFree && currentBal < currentBet) {
      setAutoSpin(false);
      return;
    }

    if (!isFree) {
      lastPaidBetRef.current = currentBet;
      setBalance(b => b - cost);
      setSessionStats(s => ({ ...s, totalBet: s.totalBet + cost }));
    }

    setIsSpinning(true);
    setLastWin(0);
    setWinPaylines([]);
    setWinningCells(new Set());
    setShowBigWin(false);
    setLandingCols(new Set());

    // Pre-generate the final reel outcome before animations begin
    const finalGrid: number[][] = Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * config.symbols.length)
      )
    );

    // Decorative scrolling strip content — purely visual, does not influence outcome
    setStripSymbols(
      Array.from({ length: 5 }, () =>
        Array.from({ length: 10 }, () =>
          Math.floor(Math.random() * config.symbols.length)
        )
      )
    );

    setReelSpinning([true, true, true, true, true]);
    playSlotSound('spin');

    // Stop each reel column at its staggered time, revealing final symbols
    STOP_TIMES.forEach((delay, col) => {
      setTimeout(() => {
        setDisplayGrid(prev => {
          const next = prev.map(c => [...c]);
          next[col] = [...finalGrid[col]];
          return next;
        });
        setReelSpinning(prev => {
          const next = [...prev];
          next[col] = false;
          return next;
        });
        playSlotSound('tick');
        setLandingCols(prev => new Set(prev).add(col));
        setTimeout(() => {
          setLandingCols(prev => {
            const next = new Set(prev);
            next.delete(col);
            return next;
          });
        }, 420);
      }, delay);
    });

    // Evaluate wins after all reels have stopped
    setTimeout(() => {
      // Ensure final grid is fully applied
      setDisplayGrid(finalGrid.map(c => [...c]));
      setReelSpinning([false, false, false, false, false]);
      setIsSpinning(false);

      // ── Win evaluation ───────────────────────────────────────────────────
      let totalWin = 0;
      const winLines: number[] = [];
      const cells = new Set<string>();

      PAYLINES.forEach((payline, lineIdx) => {
        const baseIdx = finalGrid[payline[0][0]][payline[0][1]];
        let matchLen = 1;
        for (let pos = 1; pos < 5; pos++) {
          if (finalGrid[payline[pos][0]][payline[pos][1]] === baseIdx) {
            matchLen++;
          } else {
            break;
          }
        }
        if (matchLen >= 3) {
          const sym = config.symbols[baseIdx];
          const multiplier =
            matchLen === 5 ? sym.payout5 :
            matchLen === 4 ? sym.payout4 :
            sym.payout3;
          totalWin += effectiveBet * multiplier;
          winLines.push(lineIdx);
          for (let pos = 0; pos < matchLen; pos++) {
            cells.add(`${payline[pos][0]}-${payline[pos][1]}`);
          }
        }
      });

      // ── Free spins trigger: 3+ top symbol on mid row ─────────────────────
      const topSymIdx = config.symbols.length - 1;
      let midTopCount = 0;
      for (let col = 0; col < 5; col++) {
        if (finalGrid[col][1] === topSymIdx) midTopCount++;
      }
      if (midTopCount >= 3) {
        setFreeSpins(fs => fs + FREE_SPIN_COUNT);
      }

      // Consume one free spin
      if (isFree) {
        setFreeSpins(fs => Math.max(0, fs - 1));
      }

      // ── Credit wins ──────────────────────────────────────────────────────
      if (totalWin > 0) {
        setBalance(b => b + totalWin);
        setLastWin(totalWin);
        setWinPaylines(winLines);
        setWinningCells(cells);
        setSessionStats(s => ({ ...s, totalWon: s.totalWon + totalWin }));
        const isBig = totalWin > effectiveBet * BIG_WIN_MULTIPLIER;
        playSlotSound(isBig ? 'bigwin' : 'win');
        if (isBig) {
          setShowBigWin(true);
          setTimeout(() => setShowBigWin(false), 3500);
        }
      }

      const sc = spinCountRef.current;
      setWinHistory(h =>
        [{ spin: sc + 1, win: totalWin, bet: cost }, ...h].slice(0, 10)
      );
      setSpinCount(n => n + 1);
    }, EVAL_DELAY);
  }, [config.symbols]); // stable ref — config is module-level const in game pages

  // ── Auto-spin driver ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoSpin || isSpinning) return;
    if (freeSpins === 0 && balance < bet) {
      setAutoSpin(false);
      return;
    }
    const t = setTimeout(doSpin, 550);
    return () => clearTimeout(t);
  }, [autoSpin, isSpinning, balance, bet, freeSpins, doSpin]);

  // ── Event handlers ───────────────────────────────────────────────────────
  const handleSpin = useCallback(() => {
    playSlotSound('click');
    doSpin();
  }, [doSpin]);

  const handleBet = useCallback(
    (b: number) => {
      if (isSpinning) return;
      playSlotSound('click');
      setBet(b);
    },
    [isSpinning]
  );

  const handleAuto = useCallback(() => {
    playSlotSound('click');
    setAutoSpin(a => !a);
  }, []);

  const handleReset = useCallback(() => {
    if (isSpinning) return;
    setBalance(STARTING_BALANCE);
    setSessionStats({ totalBet: 0, totalWon: 0 });
    setWinHistory([]);
    setSpinCount(0);
    setLastWin(0);
    setWinPaylines([]);
    setWinningCells(new Set());
    setShowBigWin(false);
    setFreeSpins(0);
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.storageKey, String(STARTING_BALANCE));
    }
  }, [isSpinning, config.storageKey]);

  // ── Derived values ───────────────────────────────────────────────────────
  const canSpin = !isSpinning && (freeSpins > 0 || balance >= bet);
  const net = sessionStats.totalWon - sessionStats.totalBet;

  // ── CSS (built once per config — config is stable) ───────────────────────
  const css = useMemo(() => buildCSS(config), [config]);

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`sp sp-${config.gameId}`}>
        {/* Ambient star particles */}
        <div className="sp-stars" aria-hidden="true">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="sp-star"
              style={{
                left: `${(i * 37 + 7) % 100}%`,
                top: `${(i * 53 + 11) % 100}%`,
                animationDelay: `${((i * 0.29) % 3).toFixed(2)}s`,
                width: i % 6 === 0 ? '3px' : '2px',
                height: i % 6 === 0 ? '3px' : '2px',
              }}
            />
          ))}
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="sp-nav">
          <a
            href="/games"
            className="sp-back"
            onClick={() => playSlotSound('click')}
          >
            ← LOBBY
          </a>

          <h1 className="sp-game-name">{config.gameName}</h1>

          <div className="sp-bal-area">
            <div className="sp-bal-box">
              <span className="sp-bal-lbl">BALANCE</span>
              <span className="sp-bal-val">{balance.toLocaleString()}</span>
              <span className="sp-bal-unit">VCOIN</span>
            </div>
            <span className="sp-demo-badge">DEMO</span>
          </div>
        </nav>

        {/* ── Main layout ─────────────────────────────────────────────────── */}
        <div className="sp-layout">
          {/* ── Reels + controls ──────────────────────────────────────────── */}
          <section className="sp-center">
            {freeSpins > 0 && (
              <div className="sp-fs-banner">
                FREE SPINS ACTIVE — {freeSpins} remaining
              </div>
            )}

            {/* Reel grid */}
            <div className="sp-reel-frame">
              <div className="sp-reel-glint" aria-hidden="true" />
              <div className="sp-reel-grid">
                {Array.from({ length: 5 }, (_, col) => {
                  const isColSpin = reelSpinning[col];
                  const isLanding = landingCols.has(col);

                  if (isColSpin) {
                    const strip = stripSymbols[col] ?? [];
                    const looped = [...strip, ...strip];
                    return (
                      <div key={col} className="sp-reel-col sp-reel-col-spin">
                        <div
                          className="sp-reel-strip"
                          style={{ animationDuration: `${0.42 + col * 0.05}s` }}
                        >
                          {looped.map((symIdx, i) => {
                            const sym = config.symbols[symIdx] ?? config.symbols[0];
                            return (
                              <div key={i} className="sp-strip-sym" style={{ color: sym.color }}>
                                {sym.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={col} className="sp-reel-col">
                      {Array.from({ length: 3 }, (_, row) => {
                        const symIdx = displayGrid[col]?.[row] ?? 0;
                        const sym = config.symbols[symIdx] ?? config.symbols[0];
                        const cellKey = `${col}-${row}`;
                        const isWin = winningCells.has(cellKey);
                        return (
                          <div
                            key={row}
                            className={[
                              'sp-cell',
                              isLanding ? 'sp-cell-land' : '',
                              isWin ? 'sp-cell-win' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={
                              isWin
                                ? {
                                    borderColor: sym.color,
                                    boxShadow: `0 0 18px ${sym.color}80, inset 0 0 10px ${sym.color}20`,
                                  }
                                : undefined
                            }
                          >
                            <span
                              className={`sp-sym${isWin ? ' sp-sym-win' : ''}`}
                              style={{
                                color: sym.color,
                                textShadow: isWin
                                  ? `0 0 22px ${sym.color}, 0 0 8px ${sym.color}`
                                  : `0 0 14px ${sym.color}`,
                              }}
                            >
                              {sym.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {winPaylines.length > 0 && (
                <div className="sp-win-lines">
                  {winPaylines.map(pl => (
                    <span key={pl} className="sp-wl-chip">
                      LINE {pl + 1}
                    </span>
                  ))}
                </div>
              )}

              {lastWin > 0 && !showBigWin && (
                <div className="sp-win-burst" key={`burst-${spinCount}`} aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div
                      key={i}
                      className="sp-burst-particle"
                      style={{
                        left: `${(i * 23 + 9) % 92 + 4}%`,
                        animationDelay: `${((i * 0.05) % 0.4).toFixed(2)}s`,
                        background:
                          i % 3 === 0
                            ? config.accentColor
                            : i % 3 === 1
                            ? config.accentColor2
                            : '#fbbf24',
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Controls ──────────────────────────────────────────────── */}
            <div className="sp-controls">
              {/* Bet chips */}
              <div className="sp-bet-row">
                <span className="sp-bet-lbl">BET:</span>
                <div className="sp-chips">
                  {BETS.map(b => (
                    <button
                      key={b}
                      className={`sp-chip${bet === b ? ' sp-chip-on' : ''}`}
                      onClick={() => handleBet(b)}
                      disabled={isSpinning}
                      style={
                        bet === b
                          ? {
                              background: config.accentColor,
                              borderColor: config.accentColor,
                              color: '#fff',
                            }
                          : undefined
                      }
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="sp-actions">
                <button
                  className={`sp-auto-btn${autoSpin ? ' sp-auto-on' : ''}`}
                  onClick={handleAuto}
                  style={
                    autoSpin
                      ? { color: config.accentColor, borderColor: config.accentColor }
                      : undefined
                  }
                >
                  {autoSpin ? 'STOP AUTO' : 'AUTO'}
                </button>

                <button
                  className={`sp-spin-btn${isSpinning ? ' sp-spin-active' : ''}`}
                  onClick={handleSpin}
                  disabled={!canSpin}
                  style={{
                    background: `linear-gradient(135deg, ${config.accentColor2}, ${config.accentColor})`,
                  }}
                >
                  {freeSpins > 0
                    ? `FREE (${freeSpins})`
                    : isSpinning
                    ? 'SPINNING...'
                    : 'SPIN'}
                </button>

                <button
                  className="sp-reset-btn"
                  onClick={handleReset}
                  disabled={isSpinning}
                  title="Reset to 10,000 VCOIN"
                >
                  RESET
                </button>
              </div>
            </div>
          </section>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside className="sp-sidebar">
            {/* Game info */}
            <div className="sp-card">
              <h3 className="sp-card-hd">Game Info</h3>
              <div className="sp-row">
                <span>Provider</span>
                <span>{config.provider}</span>
              </div>
              <div className="sp-row">
                <span>RTP</span>
                <span style={{ color: config.accentColor, fontWeight: 700 }}>
                  {config.rtp}
                </span>
              </div>
              <div className="sp-row">
                <span>Paylines</span>
                <span>5</span>
              </div>
              <div className="sp-row">
                <span>Grid</span>
                <span>5×3</span>
              </div>
            </div>

            {/* Session stats */}
            <div className="sp-card">
              <h3 className="sp-card-hd">Session</h3>
              <div className="sp-row">
                <span>Spins</span>
                <span>{spinCount}</span>
              </div>
              <div className="sp-row">
                <span>Total Bet</span>
                <span>{sessionStats.totalBet.toLocaleString()}</span>
              </div>
              <div className="sp-row">
                <span>Total Won</span>
                <span style={{ color: '#4ade80' }}>
                  {sessionStats.totalWon.toLocaleString()}
                </span>
              </div>
              <div className="sp-row">
                <span>Net</span>
                <span
                  style={{
                    color: net >= 0 ? '#4ade80' : '#f87171',
                    fontWeight: 800,
                  }}
                >
                  {net >= 0 ? '+' : ''}
                  {net.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Win history */}
            <div className="sp-card sp-history">
              <h3 className="sp-card-hd">Last 10 Spins</h3>
              {winHistory.length === 0 ? (
                <p className="sp-empty">No spins yet — hit SPIN!</p>
              ) : (
                winHistory.map((e, i) => (
                  <div key={i} className="sp-hist-row">
                    <span className="sp-hist-num">#{e.spin}</span>
                    <span className="sp-hist-bet">−{e.bet}</span>
                    <span
                      className={`sp-hist-win${e.win > 0 ? ' sp-hist-pos' : ''}`}
                    >
                      {e.win > 0 ? `+${e.win}` : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Paytable */}
            <div className="sp-card">
              <h3 className="sp-card-hd">Paytable (× bet)</h3>
              {[...config.symbols].reverse().map(sym => (
                <div key={sym.id} className="sp-pay-row">
                  <span style={{ color: sym.color, fontWeight: 700, minWidth: 54 }}>
                    {sym.label}
                  </span>
                  <span className="sp-pay-vals">
                    3×{sym.payout3} &nbsp;4×{sym.payout4} &nbsp;5×{sym.payout5}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ── Win toast ───────────────────────────────────────────────────── */}
        {lastWin > 0 && !showBigWin && (
          <div className="sp-toast" key={`toast-${spinCount}`}>
            <span
              className="sp-toast-amt"
              style={{ color: config.accentColor }}
            >
              +{displayWin.toLocaleString()}
            </span>
            <span className="sp-toast-lbl">WINNER!</span>
          </div>
        )}

        {/* ── Big win overlay ──────────────────────────────────────────────── */}
        {showBigWin && (
          <div className="sp-bigwin-overlay">
            <div
              className="sp-bigwin-box"
              style={{ borderColor: config.accentColor }}
            >
              <div
                className="sp-bw-title"
                style={{ color: config.accentColor }}
              >
                BIG WIN!
              </div>
              <div className="sp-bw-amount" style={{ color: '#fbbf24' }}>
                +{displayWin.toLocaleString()}
              </div>
              <div className="sp-bw-unit">VCOIN</div>

              {/* Particle burst */}
              {Array.from({ length: 28 }, (_, i) => (
                <div
                  key={i}
                  className="sp-particle"
                  style={{
                    left: `${(i * 13 + 4) % 92 + 4}%`,
                    animationDelay: `${((i * 0.05) % 0.7).toFixed(2)}s`,
                    animationDuration: `${(1.1 + (i % 5) * 0.18).toFixed(2)}s`,
                    borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
                    background:
                      i % 3 === 0
                        ? config.accentColor
                        : i % 3 === 1
                        ? config.accentColor2
                        : '#fbbf24',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── CSS builder ───────────────────────────────────────────────────────────── */

function buildCSS(config: SlotConfig): string {
  const { accentColor, accentColor2, bgGradient } = config;
  return `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Page shell ─────────────────────────────────────────────────────────────── */
.sp {
  --sp-cell-h: 80px;
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  background: ${bgGradient};
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

/* ── Stars background ───────────────────────────────────────────────────────── */
.sp-stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.sp-star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: starTwinkle 3s ease-in-out infinite;
}

/* ── Nav ────────────────────────────────────────────────────────────────────── */
.sp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.sp-back {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 8px;
  color: #e2e8f0;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  white-space: nowrap;
}
.sp-back:hover {
  background: rgba(255,255,255,0.12);
  border-color: ${accentColor};
  color: ${accentColor};
}

.sp-game-name {
  font-size: clamp(16px, 3vw, 26px);
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, ${accentColor2}, ${accentColor}, ${accentColor2});
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
  text-align: center;
}

.sp-bal-area {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sp-bal-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.sp-bal-lbl {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
}
.sp-bal-val {
  font-size: 20px;
  font-weight: 900;
  color: #fbbf24;
  line-height: 1;
}
.sp-bal-unit {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.35);
}
.sp-demo-badge {
  padding: 4px 10px;
  background: rgba(251,191,36,0.12);
  border: 1px solid rgba(251,191,36,0.38);
  border-radius: 6px;
  color: #fbbf24;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

/* ── Layout ─────────────────────────────────────────────────────────────────── */
.sp-layout {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.sp-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

/* ── Free spins banner ──────────────────────────────────────────────────────── */
.sp-fs-banner {
  text-align: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.04));
  border: 1px solid rgba(251,191,36,0.45);
  border-radius: 10px;
  color: #fbbf24;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  animation: winPulse 1.4s ease-in-out infinite;
}

/* ── Reel frame ─────────────────────────────────────────────────────────────── */
.sp-reel-frame {
  position: relative;
  background: rgba(0,0,0,0.55);
  border: 2px solid ${accentColor}55;
  border-radius: 16px;
  padding: 14px;
  box-shadow:
    0 0 40px ${accentColor}25,
    0 0 80px ${accentColor}10,
    inset 0 0 40px rgba(0,0,0,0.4);
  overflow: hidden;
}

.sp-reel-glint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255,255,255,0.06) 45%,
    rgba(255,255,255,0.1) 50%,
    rgba(255,255,255,0.06) 55%,
    transparent 70%
  );
  background-size: 250% 250%;
  animation: reelGlint 7s ease-in-out infinite;
  z-index: 1;
}

.sp-reel-grid {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
}

.sp-reel-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border-radius: 8px;
  height: calc(3 * var(--sp-cell-h, 80px) + 2 * 8px);
}

/* ── Scrolling reel strip (shown only while a column is spinning) ────────────── */
.sp-reel-col-spin {
  position: relative;
  border: 2px solid rgba(255,255,255,0.07);
  background: rgba(0,0,0,0.45);
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 14%,
    black 86%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 14%,
    black 86%,
    transparent 100%
  );
}

.sp-reel-strip {
  display: flex;
  flex-direction: column;
  animation-name: reelScroll;
  animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
  animation-iteration-count: infinite;
  filter: blur(2.5px);
}

.sp-strip-sym {
  height: var(--sp-cell-h, 80px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

/* ── Cells ──────────────────────────────────────────────────────────────────── */
.sp-cell {
  width: 100%;
  height: var(--sp-cell-h, 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  background: rgba(0,0,0,0.45);
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.sp-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.04) 0%,
    transparent 40%,
    rgba(0,0,0,0.2) 100%
  );
  pointer-events: none;
}

.sp-cell-land {
  animation: reelLand 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: 50% 0%;
}

.sp-cell-win {
  border-width: 2px;
  animation: winPulse 0.55s ease-in-out infinite;
}

.sp-sym {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  user-select: none;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  text-shadow: 0 0 8px currentColor;
  opacity: 0.92;
  transition: opacity 0.2s, text-shadow 0.2s;
}

.sp-sym-win {
  opacity: 1;
  animation: symGlow 0.55s ease-in-out infinite;
}

/* ── Win burst (small per-win particle pop, shown for every paying spin) ─────── */
.sp-win-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}
.sp-burst-particle {
  position: absolute;
  bottom: 10%;
  width: 7px;
  height: 7px;
  animation: burstFly 0.95s ease-out forwards;
}

/* ── Win line chips ─────────────────────────────────────────────────────────── */
.sp-win-lines {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.sp-wl-chip {
  padding: 3px 12px;
  background: rgba(74,222,128,0.12);
  border: 1px solid rgba(74,222,128,0.38);
  border-radius: 20px;
  color: #4ade80;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* ── Controls ───────────────────────────────────────────────────────────────── */
.sp-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sp-bet-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.sp-bet-lbl {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
  min-width: 32px;
}
.sp-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.sp-chip {
  padding: 6px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 20px;
  color: #e2e8f0;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.sp-chip:hover:not(:disabled) {
  background: rgba(255,255,255,0.11);
  border-color: ${accentColor};
}
.sp-chip:disabled { opacity: 0.45; cursor: not-allowed; }
.sp-chip-on { font-weight: 900; }

.sp-actions {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.sp-auto-btn {
  padding: 12px 18px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.05em;
  min-width: 108px;
  white-space: nowrap;
}
.sp-auto-btn:hover { background: rgba(255,255,255,0.09); }
.sp-auto-on { background: rgba(0,0,0,0.25) !important; }

.sp-spin-btn {
  flex: 1;
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 22px ${accentColor}55;
}
.sp-spin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px ${accentColor}80;
}
.sp-spin-btn:active:not(:disabled) { transform: translateY(0); }
.sp-spin-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.sp-spin-active { animation: spinBtnPulse 0.75s ease-in-out infinite; }

.sp-reset-btn {
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.35);
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}
.sp-reset-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.6);
}
.sp-reset-btn:disabled { opacity: 0.25; cursor: not-allowed; }

/* ── Sidebar ────────────────────────────────────────────────────────────────── */
.sp-sidebar {
  width: 256px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sp-card {
  background: rgba(0,0,0,0.48);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
}

.sp-card-hd {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: ${accentColor};
  text-transform: uppercase;
  margin-bottom: 10px;
}

.sp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sp-row:last-child { border-bottom: none; }
.sp-row span:first-child { color: rgba(255,255,255,0.42); }
.sp-row span:last-child { font-weight: 700; }

.sp-empty {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  text-align: center;
  padding: 6px 0;
}

.sp-hist-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sp-hist-row:last-child { border-bottom: none; }
.sp-hist-num { color: rgba(255,255,255,0.28); min-width: 32px; }
.sp-hist-bet { color: #f87171; flex: 1; }
.sp-hist-win { color: rgba(255,255,255,0.28); font-weight: 700; text-align: right; }
.sp-hist-pos { color: #4ade80; }

.sp-pay-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 11px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sp-pay-row:last-child { border-bottom: none; }
.sp-pay-vals {
  color: rgba(255,255,255,0.38);
  font-size: 10px;
  white-space: nowrap;
}

/* ── Win toast ──────────────────────────────────────────────────────────────── */
.sp-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.92);
  border: 2px solid ${accentColor};
  border-radius: 16px;
  padding: 14px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 200;
  animation: toastSlide 0.35s ease-out;
  box-shadow: 0 0 36px ${accentColor}55;
  pointer-events: none;
}
.sp-toast-amt {
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
}
.sp-toast-lbl {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.55);
}

/* ── Big win overlay ────────────────────────────────────────────────────────── */
.sp-bigwin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  animation: fadeIn 0.25s ease-out;
}

.sp-bigwin-box {
  position: relative;
  text-align: center;
  padding: 44px 64px;
  background: rgba(0,0,0,0.93);
  border: 3px solid;
  border-radius: 24px;
  animation: bigWinPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 0 70px ${accentColor}55;
  overflow: hidden;
}
.sp-bw-title {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1;
  animation: winPulse 0.5s ease-in-out infinite;
}
.sp-bw-amount {
  font-size: 68px;
  font-weight: 900;
  line-height: 1.1;
  margin: 8px 0 4px;
}
.sp-bw-unit {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.45);
}

/* ── Particles ──────────────────────────────────────────────────────────────── */
.sp-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  bottom: 8px;
  animation-name: particleFly;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

/* ── Keyframes ──────────────────────────────────────────────────────────────── */
@keyframes reelSpin {
  0%   { transform: translateY(0)    scaleY(1);    filter: blur(0px);  opacity: 1;   }
  20%  { transform: translateY(-6px) scaleY(0.95); filter: blur(3px);  opacity: 0.6; }
  50%  { transform: translateY(4px)  scaleY(0.88); filter: blur(6px);  opacity: 0.3; }
  80%  { transform: translateY(-4px) scaleY(0.95); filter: blur(3px);  opacity: 0.6; }
  100% { transform: translateY(0)    scaleY(1);    filter: blur(0px);  opacity: 1;   }
}

@keyframes reelScroll {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}

@keyframes reelLand {
  0%   { transform: scaleY(0.82) translateY(-8px); }
  45%  { transform: scaleY(1.1)  translateY(4px);  }
  70%  { transform: scaleY(0.96) translateY(-2px); }
  100% { transform: scaleY(1)    translateY(0);    }
}

@keyframes reelGlint {
  0%, 100% { background-position: 0% 0%; }
  50%       { background-position: 100% 100%; }
}

@keyframes symGlow {
  0%, 100% { filter: brightness(1);    transform: scale(1);    }
  50%       { filter: brightness(1.5); transform: scale(1.12); }
}

@keyframes winPulse {
  0%, 100% { transform: scale(1);    opacity: 1;    }
  50%       { transform: scale(1.05); opacity: 0.85; }
}

@keyframes bigWinPop {
  0%   { transform: scale(0.35) rotate(-6deg); opacity: 0; }
  100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
}

@keyframes particleFly {
  0%   { transform: translateY(0)      scale(1)   rotate(0deg);   opacity: 1; }
  100% { transform: translateY(-200px) scale(0.2) rotate(220deg); opacity: 0; }
}

@keyframes burstFly {
  0%   { transform: translateY(0)      scale(0.6) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(-110px) scale(1.1) rotate(160deg); opacity: 0; }
}

@keyframes shimmer {
  0%   { background-position: 0%   center; }
  100% { background-position: 200% center; }
}

@keyframes toastSlide {
  from { transform: translateX(-50%) translateY(30px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(1);   }
  50%       { opacity: 0.75; transform: scale(1.4); }
}

@keyframes spinBtnPulse {
  0%, 100% { box-shadow: 0 4px 22px ${accentColor}55; }
  50%       { box-shadow: 0 4px 44px ${accentColor}99; }
}

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .sp { --sp-cell-h: 68px; }
  .sp-layout { flex-direction: column; padding: 16px; }
  .sp-sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .sp-history { grid-column: 1 / -1; }
  .sp-bw-title { font-size: 44px; }
  .sp-bw-amount { font-size: 54px; }
}

@media (max-width: 640px) {
  .sp { --sp-cell-h: 56px; }
  .sp-nav { padding: 10px 14px; gap: 10px; }
  .sp-bal-val { font-size: 17px; }
  .sp-layout { padding: 12px; gap: 12px; }
  .sp-reel-grid { gap: 5px; }
  .sp-reel-col { gap: 5px; }
  .sp-sym, .sp-strip-sym { font-size: 9px; }
  .sp-actions { flex-wrap: wrap; }
  .sp-spin-btn { flex: 1 1 100%; order: -1; font-size: 17px; padding: 14px 20px; }
  .sp-auto-btn, .sp-reset-btn { flex: 1; min-width: 0; }
  .sp-sidebar { grid-template-columns: 1fr; }
  .sp-bw-title { font-size: 32px; }
  .sp-bw-amount { font-size: 40px; }
  .sp-bigwin-box { padding: 24px 24px; }
  .sp-toast { padding: 10px 22px; bottom: 16px; }
  .sp-toast-amt { font-size: 24px; }
}

@media (max-width: 380px) {
  .sp { --sp-cell-h: 46px; }
  .sp-game-name { display: none; }
  .sp-sym, .sp-strip-sym { font-size: 8px; }
}
`;
}
