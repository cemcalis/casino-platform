'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  cryptoRng,
  runSpin,
  startFreeSpins,
  playFreeSpin,
  type FreeSpinSession,
  type GameManifest,
  type SpinResult,
} from '@casino/forge';
import { forgeAudio } from './forge-audio';

const BETS = [10, 25, 50, 100, 200, 500];
const START_BALANCE = 10_000;
const AUTO_OPTIONS = [10, 25, 50, 100];

interface Timing {
  reelStopBase: number;
  reelStopStep: number;
  anticipationExtra: number;
  winShow: number;
  burst: number;
  drop: number;
  stepGap: number;
}

const NORMAL: Timing = {
  reelStopBase: 500,
  reelStopStep: 190,
  anticipationExtra: 1400,
  winShow: 900,
  burst: 380,
  drop: 420,
  stepGap: 260,
};

const TURBO: Timing = {
  reelStopBase: 180,
  reelStopStep: 70,
  anticipationExtra: 500,
  winShow: 350,
  burst: 160,
  drop: 180,
  stepGap: 100,
};

type Phase = 'idle' | 'spinning' | 'resolving' | 'freespins';

interface BigWinState {
  tier: 'BIG WIN' | 'MEGA WIN' | 'EPIC WIN';
  amount: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function useTickUp(): [number, (from: number, to: number, ms: number) => Promise<void>, () => void] {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);
  const skipRef = useRef<(() => void) | null>(null);

  const animate = useCallback((from: number, to: number, ms: number) => {
    cancelAnimationFrame(rafRef.current);
    return new Promise<void>((resolve) => {
      const start = performance.now();
      let lastTick = 0;
      const finish = () => {
        cancelAnimationFrame(rafRef.current);
        skipRef.current = null;
        setValue(to);
        resolve();
      };
      skipRef.current = finish;
      const step = (now: number) => {
        const t = Math.min((now - start) / ms, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(from + (to - from) * eased);
        if (now - lastTick > 90 && t < 1) {
          forgeAudio.play('tick');
          lastTick = now;
        }
        if (t < 1) rafRef.current = requestAnimationFrame(step);
        else finish();
      };
      rafRef.current = requestAnimationFrame(step);
    });
  }, []);

  const skip = useCallback(() => skipRef.current?.(), []);
  return [value, animate, skip];
}

export default function SlotForge({ manifest }: { manifest: GameManifest }) {
  const rngRef = useRef(cryptoRng());
  const aliveRef = useRef(true);
  const turboRef = useRef(false);
  const autoRef = useRef(0);
  const stopAutoRef = useRef(false);

  const [balance, setBalance] = useState(START_BALANCE);
  const [bet, setBet] = useState(BETS[1]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: manifest.columns }, (_, c) =>
      Array.from({ length: manifest.rows }, (_, r) =>
        manifest.symbols[(c * manifest.rows + r) % (manifest.symbols.length - 1)].id,
      ),
    ),
  );
  const [spinningCols, setSpinningCols] = useState<boolean[]>([]);
  const [anticipationCol, setAnticipationCol] = useState(-1);
  const [hitCells, setHitCells] = useState<Set<string>>(new Set());
  const [burstCells, setBurstCells] = useState<Set<string>>(new Set());
  const [dropKey, setDropKey] = useState(0);
  const [bombs, setBombs] = useState<{ cell: [number, number]; value: number }[]>([]);
  const [stepMultiplier, setStepMultiplier] = useState(1);
  const [winDisplay, animateWin, skipWin] = useTickUp();
  const [bigWin, setBigWin] = useState<BigWinState | null>(null);
  const [fsSession, setFsSession] = useState<FreeSpinSession | null>(null);
  const [fsIntro, setFsIntro] = useState(0);
  const [fsSummary, setFsSummary] = useState<number | null>(null);
  const [retriggerToast, setRetriggerToast] = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showAutoMenu, setShowAutoMenu] = useState(false);
  const [autoLeft, setAutoLeft] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [anteActive, setAnteActive] = useState(false);
  const [marqueeIdx, setMarqueeIdx] = useState(0);

  const scatterId = useMemo(
    () => manifest.symbols.find((s) => s.kind === 'scatter')?.id ?? '',
    [manifest],
  );
  const minTrigger = useMemo(
    () => Math.min(...Object.keys(manifest.freeSpins.awards).map(Number)),
    [manifest],
  );
  const symbolMap = useMemo(
    () => new Map(manifest.symbols.map((s) => [s.id, s])),
    [manifest],
  );

  const marqueeMessages = useMemo(() => {
    const msgs = [
      `MAKS KAZANÇ ${manifest.maxWinMultiplier.toLocaleString('tr-TR')}X`,
      manifest.tagline.toUpperCase(),
      `${minTrigger}+ ${symbolMap.get(scatterId)?.label ?? ''} FREE SPIN BAŞLATIR`,
    ];
    if (manifest.freeSpins.bombValues?.length) {
      const top = Math.max(...manifest.freeSpins.bombValues.map((b) => b.value));
      msgs.push(`FREE SPİNLERDE ${top}X'E KADAR ÇARPAN BOMBALARI`);
    }
    if (manifest.freeSpins.multiplierLadder?.length) {
      const top = manifest.freeSpins.multiplierLadder[manifest.freeSpins.multiplierLadder.length - 1];
      msgs.push(`FREE SPİNLERDE ZİNCİR ÇARPANI ${top}X'E ÇIKAR`);
    }
    if (manifest.bonusBuy) {
      msgs.push(`BONUS SATIN AL: ${manifest.bonusBuy.costMultiplier}X BAHİS`);
    }
    return msgs;
  }, [manifest, minTrigger, scatterId, symbolMap]);

  /* ── persistence ─────────────────────────────────────────────────────── */

  useEffect(() => {
    const saved = localStorage.getItem(manifest.theme.storageKey);
    if (saved) {
      const n = Number(saved);
      if (Number.isFinite(n) && n > 0) setBalance(n);
    }
  }, [manifest.theme.storageKey]);

  useEffect(() => {
    localStorage.setItem(manifest.theme.storageKey, String(Math.round(balance * 100) / 100));
  }, [balance, manifest.theme.storageKey]);

  useEffect(() => {
    aliveRef.current = true;
    const t = setInterval(() => setMarqueeIdx((i) => i + 1), 5000);
    return () => {
      aliveRef.current = false;
      clearInterval(t);
      forgeAudio.stopMusic();
    };
  }, []);

  useEffect(() => {
    turboRef.current = turbo;
  }, [turbo]);

  const timing = () => (turboRef.current ? TURBO : NORMAL);

  const startAudio = () => {
    forgeAudio.setMuted(muted);
    if (!muted) forgeAudio.startMusic(manifest.theme.music);
  };

  /* ── spin pipeline ───────────────────────────────────────────────────── */

  const revealSpin = async (result: SpinResult): Promise<void> => {
    const t = timing();
    setHitCells(new Set());
    setBurstCells(new Set());
    setBombs([]);
    setStepMultiplier(1);
    setSpinningCols(Array.from({ length: manifest.columns }, () => true));
    setGrid(result.steps[0].grid);
    forgeAudio.play('spin');

    // Staggered reel stops with scatter anticipation on the tail columns.
    let visibleScatters = 0;
    for (let c = 0; c < manifest.columns; c++) {
      let wait = c === 0 ? t.reelStopBase : t.reelStopStep;
      const remaining = manifest.columns - c;
      const canStillTrigger = visibleScatters + remaining >= minTrigger;
      const tension = visibleScatters >= minTrigger - 2 && canStillTrigger && c >= manifest.columns - 2;
      if (tension) {
        setAnticipationCol(c);
        forgeAudio.play('anticipation');
        wait += t.anticipationExtra;
      }
      await sleep(wait);
      if (!aliveRef.current) return;
      setSpinningCols((prev) => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
      forgeAudio.play('reelStop');
      for (let r = 0; r < manifest.rows; r++) {
        if (result.steps[0].grid[c][r] === scatterId) visibleScatters++;
      }
    }
    setAnticipationCol(-1);

    // Replay evaluation/tumble steps.
    let runningWin = 0;
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i];
      if (!aliveRef.current) return;
      setGrid(step.grid);
      setBombs(step.bombs);

      if (step.wins.length === 0) break;

      const cells = new Set<string>();
      for (const w of step.wins) for (const [c, r] of w.cells) cells.add(`${c}:${r}`);
      setHitCells(cells);
      forgeAudio.play(step.stepWin >= 5 ? 'winMedium' : 'winSmall');
      if (step.appliedMultiplier > 1) {
        setStepMultiplier(step.appliedMultiplier);
        forgeAudio.play('bomb');
      }
      const target = runningWin + step.stepWin * bet;
      await animateWin(runningWin, target, t.winShow);
      runningWin = target;
      await sleep(t.stepGap);
      if (!aliveRef.current) return;

      if (manifest.tumble && i < result.steps.length - 1) {
        setBurstCells(cells);
        setHitCells(new Set());
        forgeAudio.play('burst');
        await sleep(t.burst);
        if (!aliveRef.current) return;
        setBurstCells(new Set());
        setStepMultiplier(1);
        setDropKey((k) => k + 1);
        setGrid(result.steps[i + 1].grid);
        await sleep(t.drop);
      }
    }
    setHitCells(new Set());
  };

  const presentTotalWin = async (totalWin: number): Promise<void> => {
    const amount = totalWin * bet;
    if (totalWin >= 20) {
      const tier: BigWinState['tier'] =
        totalWin >= 100 ? 'EPIC WIN' : totalWin >= 50 ? 'MEGA WIN' : 'BIG WIN';
      setBigWin({ tier, amount });
      forgeAudio.play('bigWin');
      await animateWin(0, amount, turboRef.current ? 1200 : 2600);
      await sleep(turboRef.current ? 500 : 1200);
      setBigWin(null);
    } else if (totalWin > 0) {
      forgeAudio.play('coin');
    }
  };

  const runFreeSpins = async (awarded: number): Promise<void> => {
    setPhase('freespins');
    forgeAudio.play('freeSpinIntro');
    setFsIntro(awarded);
    await sleep(turboRef.current ? 900 : 2000);
    setFsIntro(0);

    let session = startFreeSpins(awarded);
    setFsSession(session);
    while (session.remaining > 0 && aliveRef.current) {
      const { session: next, result } = playFreeSpin(manifest, session, rngRef.current);
      if (result.freeSpinsAwarded > 0) {
        setRetriggerToast(result.freeSpinsAwarded);
        forgeAudio.play('scatter');
        setTimeout(() => setRetriggerToast(0), 2500);
      }
      await revealSpin(result);
      session = next;
      setFsSession(session);
      await sleep(timing().stepGap);
    }
    if (!aliveRef.current) return;

    const totalAmount = session.accumulatedWin * bet;
    setBalance((b) => Math.round((b + totalAmount) * 100) / 100);
    setFsSummary(totalAmount);
    forgeAudio.play('bigWin');
    await sleep(turboRef.current ? 1400 : 3000);
    setFsSummary(null);
    setFsSession(null);
  };

  const doSpin = async (opts: { buyBonus?: boolean } = {}): Promise<void> => {
    if (phase !== 'idle') return;
    startAudio();
    const anteCost = anteActive && manifest.anteBet ? manifest.anteBet.extraCostFraction : 0;
    const cost = opts.buyBonus
      ? bet * (manifest.bonusBuy?.costMultiplier ?? 0)
      : bet * (1 + anteCost);
    if (cost > balance) return;

    setPhase('spinning');
    setBalance((b) => Math.round((b - cost) * 100) / 100);
    skipWin();
    await animateWin(0, 0, 1);

    const result = runSpin(manifest, rngRef.current, {
      anteActive: anteActive && !opts.buyBonus,
      forceTrigger: opts.buyBonus,
    });

    await revealSpin(result);
    if (!aliveRef.current) return;
    setPhase('resolving');

    if (result.totalWin > 0) {
      setBalance((b) => Math.round((b + result.totalWin * bet) * 100) / 100);
      await presentTotalWin(result.totalWin);
    }

    if (result.freeSpinsAwarded > 0) {
      forgeAudio.play('scatter');
      autoRef.current = 0;
      setAutoLeft(0);
      await runFreeSpins(result.freeSpinsAwarded);
    }
    if (!aliveRef.current) return;
    setPhase('idle');

    // Autoplay continuation.
    if (autoRef.current > 0 && !stopAutoRef.current) {
      autoRef.current -= 1;
      setAutoLeft(autoRef.current);
      if (autoRef.current > 0 && bet * (1 + anteCost) <= balance) {
        setTimeout(() => {
          if (aliveRef.current && !stopAutoRef.current) void doSpin();
        }, turboRef.current ? 250 : 600);
      } else {
        autoRef.current = 0;
        setAutoLeft(0);
      }
    }
  };

  const startAuto = (count: number) => {
    setShowAutoMenu(false);
    stopAutoRef.current = false;
    autoRef.current = count;
    setAutoLeft(count);
    void doSpin();
  };

  const stopAuto = () => {
    stopAutoRef.current = true;
    autoRef.current = 0;
    setAutoLeft(0);
  };

  const resetBalance = () => {
    setBalance(START_BALANCE);
    forgeAudio.play('click');
  };

  const anteCostLabel =
    anteActive && manifest.anteBet ? bet * (1 + manifest.anteBet.extraCostFraction) : bet;
  const busy = phase !== 'idle';
  const canSpin = !busy && balance >= anteCostLabel;

  /* ── render ──────────────────────────────────────────────────────────── */

  return (
    <div className="fg-root" style={{ background: manifest.theme.bgGradient }}>
      {/* Header */}
      <header className="fg-header">
        <div className="fg-title-block">
          <h1 className="fg-title" style={{ color: manifest.theme.accentColor2 }}>
            {manifest.gameName}
          </h1>
          <span className="fg-provider">{manifest.provider}</span>
        </div>
        <div className="fg-marquee" key={marqueeIdx % marqueeMessages.length}>
          {marqueeMessages[marqueeIdx % marqueeMessages.length]}
        </div>
        <div className="fg-balance-block">
          <div className="fg-balance-lbl">BAKİYE</div>
          <div className="fg-balance" style={{ color: manifest.theme.accentColor2 }}>
            {balance.toLocaleString('tr-TR')} 🪙
          </div>
        </div>
      </header>

      <div className="fg-stage">
        {/* Side feature buttons */}
        <div className="fg-side">
          {manifest.bonusBuy && (
            <button
              className="fg-feature-btn fg-buy"
              disabled={busy || balance < bet * manifest.bonusBuy.costMultiplier}
              onClick={() => {
                forgeAudio.play('click');
                setShowBuyModal(true);
              }}
              style={{ borderColor: manifest.theme.accentColor }}
            >
              BONUS
              <br />
              SATIN AL
              <span className="fg-feature-sub">{manifest.bonusBuy.costMultiplier}x</span>
            </button>
          )}
          {manifest.anteBet && (
            <button
              className={`fg-feature-btn${anteActive ? ' fg-feature-on' : ''}`}
              disabled={busy}
              onClick={() => {
                forgeAudio.play('click');
                setAnteActive((a) => !a);
              }}
              style={anteActive ? { borderColor: manifest.theme.accentColor2 } : undefined}
            >
              ANTE BAHİS
              <span className="fg-feature-sub">
                {anteActive ? 'AÇIK — 2x scatter' : `+%${manifest.anteBet.extraCostFraction * 100}`}
              </span>
            </button>
          )}
        </div>

        {/* Reels */}
        <div
          className="fg-board-wrap"
          style={{ borderColor: manifest.theme.frameColor, background: manifest.theme.reelBg }}
        >
          {fsSession && (
            <div className="fg-fs-banner" style={{ background: manifest.theme.accentColor }}>
              FREE SPIN {fsSession.spinIndex}/{fsSession.totalAwarded} — KALAN {fsSession.remaining} —
              TOPLAM {(fsSession.accumulatedWin * bet).toLocaleString('tr-TR')} 🪙
            </div>
          )}
          <div
            className="fg-board"
            style={{ gridTemplateColumns: `repeat(${manifest.columns}, 1fr)` }}
          >
            {Array.from({ length: manifest.columns }, (_, c) => (
              <div
                key={c}
                className={`fg-col${spinningCols[c] ? ' fg-col-spin' : ''}${
                  anticipationCol === c && spinningCols[c] ? ' fg-col-tense' : ''
                }`}
              >
                {spinningCols[c] ? (
                  <div className="fg-strip">
                    {Array.from({ length: manifest.rows * 3 }, (_, i) => {
                      const sym = manifest.symbols[(c * 7 + i * 3) % manifest.symbols.length];
                      return (
                        <div key={i} className="fg-cell fg-cell-blur">
                          <span>{sym.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  Array.from({ length: manifest.rows }, (_, r) => {
                    const id = grid[c]?.[r];
                    const sym = id ? symbolMap.get(id) : undefined;
                    const key = `${c}:${r}`;
                    const bomb = bombs.find((b) => b.cell[0] === c && b.cell[1] === r);
                    return (
                      <div
                        key={`${key}-${dropKey}`}
                        className={`fg-cell fg-drop${hitCells.has(key) ? ' fg-hit' : ''}${
                          burstCells.has(key) ? ' fg-burst' : ''
                        }${sym?.kind === 'scatter' ? ' fg-scatter' : ''}`}
                        style={{
                          animationDelay: `${r * 0.05}s`,
                          ...(hitCells.has(key)
                            ? { boxShadow: `0 0 18px ${manifest.theme.accentColor}` }
                            : {}),
                        }}
                      >
                        <span style={{ color: sym?.color }}>{sym?.label}</span>
                        {bomb && (
                          <span
                            className="fg-bomb-badge"
                            style={{ background: manifest.theme.accentColor }}
                          >
                            {bomb.value}x
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
          {stepMultiplier > 1 && (
            <div className="fg-step-mult" style={{ color: manifest.theme.accentColor2 }}>
              x{stepMultiplier}
            </div>
          )}
          {winDisplay > 0 && !bigWin && !fsSummary && (
            <div className="fg-win-line" style={{ color: manifest.theme.accentColor2 }}>
              KAZANÇ: {Math.round(winDisplay).toLocaleString('tr-TR')} 🪙
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <footer className="fg-controls">
        <button
          className="fg-icon-btn"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            forgeAudio.setMuted(next);
            if (!next) forgeAudio.startMusic(manifest.theme.music);
          }}
          title="Ses"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="fg-icon-btn"
          onClick={() => {
            forgeAudio.play('click');
            setShowPaytable(true);
          }}
          title="Ödeme tablosu"
        >
          ℹ️
        </button>

        <div className="fg-bet-block">
          <span className="fg-ctrl-lbl">BAHİS</span>
          <div className="fg-chips">
            {BETS.map((b) => (
              <button
                key={b}
                className={`fg-chip${bet === b ? ' fg-chip-on' : ''}`}
                disabled={busy}
                onClick={() => {
                  forgeAudio.play('click');
                  setBet(b);
                }}
                style={
                  bet === b
                    ? { background: manifest.theme.accentColor, borderColor: manifest.theme.accentColor }
                    : undefined
                }
              >
                {b}
              </button>
            ))}
          </div>
          {anteActive && manifest.anteBet && (
            <span className="fg-ante-note">
              maliyet: {anteCostLabel.toLocaleString('tr-TR')} 🪙
            </span>
          )}
        </div>

        <div className="fg-actions">
          <button
            className={`fg-icon-btn${turbo ? ' fg-icon-on' : ''}`}
            onClick={() => {
              forgeAudio.play('click');
              setTurbo((t) => !t);
            }}
            title="Turbo spin"
            style={turbo ? { borderColor: manifest.theme.accentColor2 } : undefined}
          >
            ⚡
          </button>

          <div className="fg-auto-wrap">
            {autoLeft > 0 ? (
              <button className="fg-auto-btn fg-auto-on" onClick={stopAuto}>
                DURDUR ({autoLeft})
              </button>
            ) : (
              <button
                className="fg-auto-btn"
                disabled={busy}
                onClick={() => {
                  forgeAudio.play('click');
                  setShowAutoMenu((s) => !s);
                }}
              >
                OTOMATİK
              </button>
            )}
            {showAutoMenu && (
              <div className="fg-auto-menu">
                {AUTO_OPTIONS.map((n) => (
                  <button key={n} onClick={() => startAuto(n)}>
                    {n} spin
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="fg-spin-btn"
            disabled={!canSpin}
            onClick={() => void doSpin()}
            style={{
              background: `linear-gradient(135deg, ${manifest.theme.accentColor2}, ${manifest.theme.accentColor})`,
            }}
          >
            {busy ? '···' : 'SPIN'}
          </button>

          <button className="fg-reset-btn" disabled={busy} onClick={resetBalance} title="Demo bakiyeyi sıfırla">
            SIFIRLA
          </button>
        </div>
      </footer>

      <div className="fg-demo-note">
        Demo mod — sanal para. RTP hedefi %{(manifest.targetRtp.min * 100).toFixed(0)}–
        {(manifest.targetRtp.max * 100).toFixed(0)} · Volatilite {'⚡'.repeat(manifest.volatility)}
      </div>

      {/* Overlays */}
      {bigWin && (
        <div className="fg-overlay" onClick={skipWin}>
          <div className="fg-bigwin">
            <div className="fg-bigwin-tier" style={{ color: manifest.theme.accentColor2 }}>
              {bigWin.tier}
            </div>
            <div className="fg-bigwin-amount">
              {Math.round(winDisplay).toLocaleString('tr-TR')} 🪙
            </div>
            <div className="fg-particles">
              {Array.from({ length: 26 }, (_, i) => (
                <div
                  key={i}
                  className="fg-particle"
                  style={{
                    left: `${(i * 37 + 11) % 100}%`,
                    animationDelay: `${(i * 0.09) % 1.2}s`,
                    background: i % 2 ? manifest.theme.accentColor : manifest.theme.accentColor2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {fsIntro > 0 && (
        <div className="fg-overlay">
          <div className="fg-fs-intro">
            <div className="fg-fs-count" style={{ color: manifest.theme.accentColor2 }}>
              {fsIntro}
            </div>
            <div className="fg-fs-lbl">FREE SPIN KAZANDIN!</div>
          </div>
        </div>
      )}

      {fsSummary !== null && (
        <div className="fg-overlay">
          <div className="fg-fs-intro">
            <div className="fg-fs-lbl">FREE SPIN BİTTİ</div>
            <div className="fg-fs-count" style={{ color: manifest.theme.accentColor2 }}>
              {fsSummary.toLocaleString('tr-TR')} 🪙
            </div>
          </div>
        </div>
      )}

      {retriggerToast > 0 && (
        <div className="fg-toast" style={{ background: manifest.theme.accentColor }}>
          +{retriggerToast} FREE SPIN!
        </div>
      )}

      {showBuyModal && manifest.bonusBuy && (
        <div className="fg-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="fg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Bonus Satın Al</h3>
            <p>
              Free spin turunu doğrudan başlat:{' '}
              <strong>
                {(bet * manifest.bonusBuy.costMultiplier).toLocaleString('tr-TR')} 🪙
              </strong>{' '}
              ({manifest.bonusBuy.costMultiplier}x bahis)
            </p>
            <div className="fg-modal-actions">
              <button className="fg-modal-cancel" onClick={() => setShowBuyModal(false)}>
                Vazgeç
              </button>
              <button
                className="fg-modal-buy"
                style={{ background: manifest.theme.accentColor }}
                onClick={() => {
                  setShowBuyModal(false);
                  void doSpin({ buyBonus: true });
                }}
              >
                Satın Al
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaytable && (
        <div className="fg-overlay" onClick={() => setShowPaytable(false)}>
          <div className="fg-modal fg-paytable" onClick={(e) => e.stopPropagation()}>
            <h3>Ödeme Tablosu</h3>
            <p className="fg-pt-note">
              {manifest.payModel === 'lines'
                ? `${manifest.paylines?.length} sabit çizgi — kazançlar çizgi başına bahsin ${manifest.paylines?.length}'te biri üzerinden.`
                : 'Küme ödemeli: aynı semboldan yeterli sayıda herhangi bir yerde.'}
              {manifest.tumble && ' Kazanan semboller patlar, yenileri düşer.'}
            </p>
            <div className="fg-pt-grid">
              {manifest.symbols
                .filter((s) => Object.keys(s.payouts).length > 0)
                .map((s) => (
                  <div key={s.id} className="fg-pt-row">
                    <span className="fg-pt-sym" style={{ color: s.color }}>
                      {s.label}
                    </span>
                    <span className="fg-pt-pays">
                      {Object.entries(s.payouts)
                        .map(([k, v]) => `${k}${manifest.payModel === 'scatterPays' ? '+' : ''}: ${v}x`)
                        .join('  ·  ')}
                      {s.kind === 'wild' ? '  (WILD)' : ''}
                    </span>
                  </div>
                ))}
              <div className="fg-pt-row">
                <span className="fg-pt-sym">{symbolMap.get(scatterId)?.label}</span>
                <span className="fg-pt-pays">
                  SCATTER —{' '}
                  {Object.entries(manifest.freeSpins.awards)
                    .map(([k, v]) => `${k} adet: ${v} free spin`)
                    .join('  ·  ')}
                </span>
              </div>
            </div>
            <button className="fg-modal-cancel" onClick={() => setShowPaytable(false)}>
              Kapat
            </button>
          </div>
        </div>
      )}

      <style>{`
        .fg-root { min-height: 100vh; display: flex; flex-direction: column; color: #e5e7eb; font-family: system-ui, sans-serif; }
        .fg-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 22px; }
        .fg-title { font-size: 26px; font-weight: 900; letter-spacing: 1px; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.6); }
        .fg-provider { font-size: 11px; opacity: 0.65; letter-spacing: 2px; text-transform: uppercase; }
        .fg-marquee { flex: 1; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 2px; opacity: 0.9; animation: fgMarquee 5s ease infinite; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        @keyframes fgMarquee { 0% { opacity: 0; transform: translateY(6px); } 12% { opacity: 0.9; transform: none; } 88% { opacity: 0.9; } 100% { opacity: 0; transform: translateY(-6px); } }
        .fg-balance-block { text-align: right; }
        .fg-balance-lbl { font-size: 10px; letter-spacing: 2px; opacity: 0.6; }
        .fg-balance { font-size: 20px; font-weight: 800; }
        .fg-stage { display: flex; align-items: center; justify-content: center; gap: 18px; flex: 1; padding: 8px 22px; }
        .fg-side { display: flex; flex-direction: column; gap: 12px; }
        .fg-feature-btn { background: rgba(0,0,0,0.45); border: 2px solid rgba(255,255,255,0.25); border-radius: 14px; color: #fff; font-weight: 800; font-size: 12px; letter-spacing: 1px; padding: 14px 12px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; min-width: 110px; }
        .fg-feature-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 18px rgba(255,255,255,0.25); }
        .fg-feature-btn:disabled { opacity: 0.4; cursor: default; }
        .fg-feature-sub { display: block; font-size: 10px; opacity: 0.75; margin-top: 4px; font-weight: 600; }
        .fg-board-wrap { position: relative; border: 3px solid; border-radius: 18px; padding: 14px; box-shadow: 0 10px 50px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.35); }
        .fg-fs-banner { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); white-space: nowrap; padding: 5px 18px; border-radius: 999px; font-size: 12px; font-weight: 800; color: #111; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); z-index: 3; }
        .fg-board { display: grid; gap: 8px; }
        .fg-col { display: flex; flex-direction: column; gap: 8px; overflow: hidden; border-radius: 10px; }
        .fg-col-tense { box-shadow: 0 0 22px rgba(255, 220, 100, 0.8); }
        .fg-strip { display: flex; flex-direction: column; gap: 8px; animation: fgStrip 0.24s linear infinite; }
        @keyframes fgStrip { from { transform: translateY(-34%); } to { transform: translateY(0); } }
        .fg-cell { position: relative; width: clamp(52px, 8.5vw, 92px); height: clamp(52px, 8.5vw, 92px); display: flex; align-items: center; justify-content: center; font-size: clamp(26px, 4.5vw, 46px); background: rgba(255,255,255,0.06); border-radius: 10px; }
        .fg-cell-blur { filter: blur(2px); opacity: 0.75; }
        .fg-drop { animation: fgDrop 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) backwards; }
        @keyframes fgDrop { from { transform: translateY(-120%); opacity: 0.4; } to { transform: none; opacity: 1; } }
        .fg-hit { animation: fgPulse 0.5s ease infinite alternate; z-index: 2; }
        @keyframes fgPulse { from { transform: scale(1); } to { transform: scale(1.12); } }
        .fg-burst { animation: fgBurst 0.36s ease forwards; }
        @keyframes fgBurst { to { transform: scale(0); opacity: 0; } }
        .fg-scatter { background: rgba(255, 255, 255, 0.14); box-shadow: inset 0 0 14px rgba(255,255,255,0.25); }
        .fg-bomb-badge { position: absolute; bottom: 4px; right: 4px; font-size: 12px; font-weight: 900; color: #111; border-radius: 8px; padding: 1px 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.5); animation: fgBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes fgBadge { from { transform: scale(0); } to { transform: scale(1); } }
        .fg-step-mult { position: absolute; top: 8px; right: 14px; font-size: 34px; font-weight: 900; text-shadow: 0 2px 14px rgba(0,0,0,0.7); animation: fgBadge 0.35s ease; }
        .fg-win-line { position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(0,0,0,0.75); border-radius: 999px; padding: 4px 18px; font-size: 14px; font-weight: 800; letter-spacing: 1px; }
        .fg-controls { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 18px 22px 8px; flex-wrap: wrap; }
        .fg-ctrl-lbl { font-size: 10px; letter-spacing: 2px; opacity: 0.6; display: block; margin-bottom: 4px; }
        .fg-chips { display: flex; gap: 6px; }
        .fg-chip { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #e5e7eb; border-radius: 999px; padding: 6px 13px; font-weight: 700; font-size: 13px; cursor: pointer; }
        .fg-chip-on { color: #fff; }
        .fg-chip:disabled { opacity: 0.45; cursor: default; }
        .fg-ante-note { font-size: 11px; opacity: 0.7; margin-left: 8px; }
        .fg-actions { display: flex; align-items: center; gap: 10px; }
        .fg-icon-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 18px; padding: 9px 12px; cursor: pointer; color: #fff; }
        .fg-icon-on { box-shadow: 0 0 12px rgba(255, 230, 120, 0.6); }
        .fg-auto-wrap { position: relative; }
        .fg-auto-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); color: #e5e7eb; border-radius: 12px; padding: 11px 16px; font-weight: 800; font-size: 12px; letter-spacing: 1px; cursor: pointer; }
        .fg-auto-on { border-color: #f87171; color: #f87171; }
        .fg-auto-menu { position: absolute; bottom: 110%; left: 0; background: #111827; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; overflow: hidden; z-index: 6; min-width: 110px; }
        .fg-auto-menu button { display: block; width: 100%; background: none; border: none; color: #e5e7eb; padding: 9px 14px; font-size: 13px; cursor: pointer; text-align: left; }
        .fg-auto-menu button:hover { background: rgba(255,255,255,0.1); }
        .fg-spin-btn { border: none; border-radius: 999px; color: #fff; font-size: 18px; font-weight: 900; letter-spacing: 2px; padding: 16px 44px; cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,0.45); transition: transform 0.12s; }
        .fg-spin-btn:hover:not(:disabled) { transform: scale(1.06); }
        .fg-spin-btn:disabled { opacity: 0.5; cursor: default; }
        .fg-reset-btn { background: none; border: 1px solid rgba(255,255,255,0.25); color: #9ca3af; border-radius: 12px; padding: 11px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .fg-demo-note { text-align: center; font-size: 11px; opacity: 0.55; padding: 6px 0 14px; }
        .fg-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 40; animation: fgFade 0.25s ease; }
        @keyframes fgFade { from { opacity: 0; } }
        .fg-bigwin { text-align: center; position: relative; padding: 40px; }
        .fg-bigwin-tier { font-size: clamp(44px, 9vw, 96px); font-weight: 900; letter-spacing: 4px; text-shadow: 0 4px 30px rgba(0,0,0,0.8); animation: fgZoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fg-bigwin-amount { font-size: clamp(30px, 6vw, 60px); font-weight: 900; color: #fff; margin-top: 10px; }
        @keyframes fgZoom { from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .fg-particles { position: absolute; inset: -60px; pointer-events: none; overflow: hidden; }
        .fg-particle { position: absolute; top: -12px; width: 10px; height: 10px; border-radius: 50%; animation: fgFall 1.6s linear infinite; }
        @keyframes fgFall { to { transform: translateY(70vh) rotate(400deg); opacity: 0.2; } }
        .fg-fs-intro { text-align: center; animation: fgZoom 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fg-fs-count { font-size: clamp(60px, 12vw, 130px); font-weight: 900; text-shadow: 0 6px 30px rgba(0,0,0,0.8); }
        .fg-fs-lbl { font-size: clamp(18px, 3.5vw, 30px); font-weight: 800; letter-spacing: 3px; }
        .fg-toast { position: fixed; top: 84px; left: 50%; transform: translateX(-50%); color: #111; font-weight: 900; letter-spacing: 1px; padding: 10px 26px; border-radius: 999px; z-index: 45; animation: fgZoom 0.4s ease; box-shadow: 0 6px 24px rgba(0,0,0,0.5); }
        .fg-modal { background: #111827; border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 26px; max-width: 480px; width: calc(100vw - 40px); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        .fg-modal h3 { margin: 0 0 12px; font-size: 20px; }
        .fg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }
        .fg-modal-cancel { background: none; border: 1px solid rgba(255,255,255,0.3); color: #e5e7eb; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-weight: 700; }
        .fg-modal-buy { border: none; color: #111; border-radius: 10px; padding: 10px 22px; cursor: pointer; font-weight: 900; }
        .fg-paytable { max-height: 80vh; overflow-y: auto; }
        .fg-pt-note { font-size: 13px; opacity: 0.75; }
        .fg-pt-grid { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; }
        .fg-pt-row { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 8px 12px; }
        .fg-pt-sym { font-size: 26px; width: 40px; text-align: center; }
        .fg-pt-pays { font-size: 12.5px; opacity: 0.9; }
        @media (max-width: 900px) {
          .fg-stage { flex-direction: column; }
          .fg-side { flex-direction: row; }
          .fg-marquee { display: none; }
        }
      `}</style>
    </div>
  );
}
