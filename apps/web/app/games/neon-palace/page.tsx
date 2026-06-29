'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CasinoShell, BalancePanel, BetPanel, SpinButton, WinBanner, HistoryPanel } from '@casino/ui';
import type { WinTier as UIWinTier, HistoryEntry } from '@casino/ui';
import { GameLoop, createSession, NEON_PALACE_CONFIG, SYM } from '@casino/slot-runtime';
import type { SymbolGrid, GameSession } from '@casino/slot-runtime';
import { AudioBus, NEON_PALACE_SOUNDS } from '@casino/audio';
import { getWinTierAnimation } from '@casino/animation';
import type { WinTier as AnimWinTier } from '@casino/animation';
import { gameApi } from '../../../lib/api-game';
import { userApi } from '../../../lib/api-user';
import { ApiError } from '../../../lib/api-client';

// Browser-safe RNG for demo mode — avoids node:crypto
function createBrowserRng() {
  return {
    next(): number {
      const buf = new Uint32Array(2);
      crypto.getRandomValues(buf);
      const hi = (buf[0]! >>> 5) * 1;
      const lo = buf[1]! >>> 6;
      return (hi * 67108864.0 + lo) / 9007199254740992.0;
    },
    nextInt(min: number, max: number): number {
      const range = max - min + 1;
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return min + (buf[0]! % range);
    },
    nextBytes(count: number): Uint8Array {
      const buf = new Uint8Array(count);
      crypto.getRandomValues(buf);
      return buf;
    },
  };
}

const SYMBOL_CONFIG: Record<string, { char: string; bg: string; color: string }> = {
  wild:    { char: 'W',  bg: '#f4c430', color: '#0d0618' },
  scatter: { char: 'S',  bg: '#ff2d78', color: '#ffffff' },
  high_1:  { char: '♦',  bg: '#00d4c8', color: '#0d0618' },
  high_2:  { char: 'C',  bg: '#7c4dff', color: '#ffffff' },
  high_3:  { char: 'U',  bg: '#2e7d32', color: '#ffffff' },
  med_1:   { char: '7',  bg: '#c62828', color: '#ffffff' },
  med_2:   { char: '★',  bg: '#f9a825', color: '#0d0618' },
  low_1:   { char: '=',  bg: '#546e7a', color: '#ffffff' },
  low_2:   { char: '◆',  bg: '#6a1b9a', color: '#ffffff' },
  low_3:   { char: '●',  bg: '#006064', color: '#e0f7fa' },
};

const SPIN_CHARS = ['♦', 'C', 'W', '7', '★', '=', '◆', '●', 'S', 'U'];

const PLACEHOLDER_GRID: SymbolGrid = Array.from({ length: 5 }, () =>
  Array.from({ length: 3 }, () => SYM.LOW_3),
) as SymbolGrid;

const DEMO_BALANCE = 10_000;
const SPIN_ANIM_MS = 900;

function getAnimTier(multiplier: number): AnimWinTier {
  if (multiplier <= 0) return 'NONE';
  if (multiplier <= 3) return 'SMALL';
  if (multiplier <= 15) return 'MEDIUM';
  if (multiplier <= 50) return 'BIG';
  return 'JACKPOT';
}

function toUITier(tier: AnimWinTier): UIWinTier {
  if (tier === 'JACKPOT') return 'jackpot';
  if (tier === 'BIG') return 'big';
  if (tier === 'MEDIUM') return 'medium';
  return 'small';
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ── Sub-components ─────────────────────────────────────────────────────────────

function SymbolCell({ symKey, spinning }: { symKey: string; spinning: boolean }) {
  const cfg = SYMBOL_CONFIG[symKey] ?? { char: '?', bg: '#1a0a2e', color: '#f4c430' };
  return (
    <div
      style={{
        width: '68px',
        height: '68px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: spinning ? '#1a0a2e' : cfg.bg,
        color: spinning ? '#f4c43066' : cfg.color,
        fontSize: spinning ? '22px' : '28px',
        fontWeight: 'bold',
        border: `2px solid ${spinning ? '#f4c43022' : cfg.bg}`,
        boxShadow: spinning ? 'none' : `0 0 10px ${cfg.bg}88`,
        transition: 'background-color 120ms, box-shadow 120ms',
        userSelect: 'none',
      }}
    >
      {spinning ? '?' : cfg.char}
    </div>
  );
}

function SlotGrid({ grid, spinning }: { grid: SymbolGrid; spinning: boolean }) {
  const [cycleGrid, setCycleGrid] = useState<string[][]>(() =>
    Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => '?')),
  );

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => {
      setCycleGrid(
        Array.from({ length: 5 }, () =>
          Array.from({ length: 3 }, () => SPIN_CHARS[Math.floor(Math.random() * SPIN_CHARS.length)]!),
        ),
      );
    }, 60);
    return () => clearInterval(id);
  }, [spinning]);

  const displayGrid = spinning ? cycleGrid : (grid as unknown as string[][]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '20px',
        backgroundColor: '#07030f',
        border: '2px solid #f4c43033',
        borderRadius: '16px',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6), 0 0 30px rgba(244,196,48,0.08)',
      }}
    >
      {displayGrid.map((col, ci) => (
        <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {col.map((sym, ri) => (
            <SymbolCell
              key={ri}
              symKey={spinning ? (sym as string) : (grid[ci]?.[ri] as string ?? '')}
              spinning={spinning}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function NeonPalacePage() {
  const [balance, setBalance] = useState(DEMO_BALANCE);
  const [bet, setBet] = useState(NEON_PALACE_CONFIG.defaultBet);
  const [spinning, setSpinning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [grid, setGrid] = useState<SymbolGrid>(PLACEHOLDER_GRID);
  const [winVisible, setWinVisible] = useState(false);
  const [winTier, setWinTier] = useState<AnimWinTier>('NONE');
  const [winAmount, setWinAmount] = useState('0');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [apiMode, setApiMode] = useState(false);
  const [spinError, setSpinError] = useState<string | null>(null);

  const tokenRef = useRef<string | null>(null);
  const audioBusRef = useRef<AudioBus>(new AudioBus());
  const spinLock = useRef(false);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const sessionRef = useRef<GameSession | null>(null);

  const initDemoMode = useCallback((startBalance: number) => {
    gameLoopRef.current = new GameLoop(createBrowserRng());
    sessionRef.current = createSession(NEON_PALACE_CONFIG, startBalance);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    if (token) {
      tokenRef.current = token;

      userApi
        .getWallet(token)
        .then((wallet) => {
          setBalance(parseFloat(wallet.balance));
          setApiMode(true);
          setInitialized(true);
        })
        .catch(() => {
          initDemoMode(DEMO_BALANCE);
          setInitialized(true);
        });

      gameApi
        .getHistory(token)
        .then((data) => {
          setHistory(
            data.sessions.slice(0, 8).map((s) => ({
              roundId: s.serverSeed,
              bet: s.betAmount,
              outcome: parseFloat(s.winAmount) > 0 ? ('WIN' as const) : ('LOSS' as const),
              payout: parseFloat(s.winAmount).toFixed(0),
              timestamp: new Date(s.createdAt),
            })),
          );
        })
        .catch(() => {});
    } else {
      initDemoMode(DEMO_BALANCE);
      setInitialized(true);
    }
  }, [initDemoMode]);

  const handleSpin = useCallback(async () => {
    if (spinLock.current) return;
    const hasFreeSpins = freeSpinsLeft > 0;
    if (!hasFreeSpins && balance < bet) return;

    spinLock.current = true;
    setSpinning(true);
    setWinVisible(false);
    setSpinError(null);
    audioBusRef.current.trigger(NEON_PALACE_SOUNDS.SPIN_START.id);

    try {
      let totalPayout: number;
      let newGrid: SymbolGrid;
      let newBalance: number;
      let multiplier: number;
      let newFreeSpinsLeft = freeSpinsLeft;
      let rngSeed: string;

      if (apiMode && tokenRef.current) {
        const token = tokenRef.current;
        const [result] = await Promise.all([
          gameApi.spin(token, bet),
          delay(SPIN_ANIM_MS),
        ]);

        newGrid = result.grid as unknown as SymbolGrid;
        totalPayout = result.totalPayout;
        multiplier = result.multiplier;
        rngSeed = result.rngSeed;
        newBalance = balance + result.netResult;

        userApi
          .getWallet(token)
          .then((w) => setBalance(parseFloat(w.balance)))
          .catch(() => {});

        const entry: HistoryEntry = {
          roundId: rngSeed,
          bet: bet.toString(),
          outcome: totalPayout > 0 ? 'WIN' : 'LOSS',
          payout: totalPayout.toFixed(0),
          timestamp: new Date(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 8));
      } else {
        if (!gameLoopRef.current || !sessionRef.current) {
          spinLock.current = false;
          setSpinning(false);
          return;
        }

        const session = { ...sessionRef.current, balance, bet };
        const { result, updatedSession } = gameLoopRef.current.spin(session);
        await delay(SPIN_ANIM_MS);

        newGrid = result.grid;
        totalPayout = result.totalPayout;
        multiplier = result.multiplier;
        rngSeed = result.rngSeed;
        newBalance = updatedSession.balance;
        newFreeSpinsLeft = updatedSession.freeSpinsRemaining;
        sessionRef.current = updatedSession;

        const entry: HistoryEntry = {
          roundId: rngSeed,
          bet: result.bet.toString(),
          outcome: totalPayout > 0 ? 'WIN' : 'LOSS',
          payout: totalPayout.toFixed(0),
          timestamp: new Date(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 8));
      }

      setGrid(newGrid);
      setBalance(newBalance);
      setFreeSpinsLeft(newFreeSpinsLeft);
      audioBusRef.current.trigger(NEON_PALACE_SOUNDS.SPIN_STOP_3.id);

      if (totalPayout > 0) {
        const tier = getAnimTier(multiplier);
        const anim = getWinTierAnimation(tier);
        setWinTier(tier);
        setWinAmount(totalPayout.toLocaleString('en-US', { maximumFractionDigits: 0 }));
        setWinVisible(true);

        const winSound =
          tier === 'JACKPOT' ? NEON_PALACE_SOUNDS.WIN_JACKPOT
          : tier === 'BIG'   ? NEON_PALACE_SOUNDS.WIN_BIG
          : tier === 'MEDIUM'? NEON_PALACE_SOUNDS.WIN_MEDIUM
          :                    NEON_PALACE_SOUNDS.WIN_SMALL;
        audioBusRef.current.trigger(winSound.id);

        setTimeout(() => {
          setWinVisible(false);
          setSpinning(false);
          spinLock.current = false;
        }, anim.hold.durationMs + 400);
      } else {
        setSpinning(false);
        spinLock.current = false;
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        tokenRef.current = null;
        setApiMode(false);
        initDemoMode(DEMO_BALANCE);
        setBalance(DEMO_BALANCE);
        setHistory([]);
        setFreeSpinsLeft(0);
      } else if (err instanceof ApiError) {
        setSpinError(err.message);
      } else {
        setApiMode(false);
        initDemoMode(balance);
      }
      setSpinning(false);
      spinLock.current = false;
    }
  }, [apiMode, balance, bet, freeSpinsLeft, initDemoMode]);

  const canSpin = initialized && !spinning && (freeSpinsLeft > 0 || balance >= bet);
  const spinState = spinning ? 'spinning' : !canSpin ? 'disabled' : 'idle';

  return (
    <CasinoShell>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--np-bg-deep)',
          color: 'var(--np-text-primary)',
          fontFamily: 'var(--np-font-display)',
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--np-space-6)',
            height: '64px',
            borderBottom: '1px solid var(--np-border-subtle)',
            backgroundColor: 'var(--np-bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--np-space-4)' }}>
            <Link
              href="/"
              style={{
                color: 'var(--np-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--np-text-sm)',
                letterSpacing: 'var(--np-tracking-wider)',
              }}
            >
              ← LOBBY
            </Link>
            <span
              style={{
                fontSize: 'var(--np-text-lg)',
                fontWeight: 'var(--np-font-extrabold)',
                color: 'var(--np-gold)',
                letterSpacing: 'var(--np-tracking-display)',
              }}
            >
              NEON PALACE SLOTS
            </span>
            {freeSpinsLeft > 0 && (
              <span
                style={{
                  padding: '2px 10px',
                  backgroundColor: '#ff2d7833',
                  color: '#ff2d78',
                  borderRadius: '20px',
                  fontSize: 'var(--np-text-xs)',
                  fontWeight: 'var(--np-font-bold)',
                  letterSpacing: 'var(--np-tracking-wider)',
                }}
              >
                {freeSpinsLeft} FREE SPINS
              </span>
            )}
          </div>
          <BalancePanel
            balance={balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            currency="VCOIN"
          />
        </header>

        {/* Disclaimer */}
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--np-space-2) var(--np-space-4)',
            backgroundColor: '#1a0a2e',
            fontSize: 'var(--np-text-xs)',
            color: 'var(--np-text-muted)',
            letterSpacing: 'var(--np-tracking-wider)',
          }}
        >
          {apiMode ? 'LIVE MODE' : 'DEMO MODE'} &mdash; FOR ENTERTAINMENT ONLY &mdash; NO REAL MONEY GAMBLING
        </div>

        {/* Spin error */}
        {spinError && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--np-space-2) var(--np-space-4)',
              backgroundColor: '#c6282822',
              color: '#ff6b6b',
              fontSize: 'var(--np-text-xs)',
              letterSpacing: 'var(--np-tracking-wider)',
            }}
          >
            {spinError}
          </div>
        )}

        {/* Game area */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--np-space-8) var(--np-space-4)',
            gap: 'var(--np-space-6)',
          }}
        >
          {/* Slot grid with win banner overlay */}
          <div style={{ position: 'relative' }}>
            <SlotGrid grid={grid} spinning={spinning} />
            <WinBanner
              visible={winVisible}
              amount={winAmount}
              tier={toUITier(winTier)}
              currency="VCOIN"
              onDismiss={() => {
                setWinVisible(false);
                setSpinning(false);
                spinLock.current = false;
              }}
            />
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--np-space-8)',
              padding: 'var(--np-space-4) var(--np-space-6)',
              backgroundColor: 'var(--np-bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--np-border-subtle)',
            }}
          >
            <BetPanel
              bet={bet}
              minBet={NEON_PALACE_CONFIG.minBet}
              maxBet={NEON_PALACE_CONFIG.maxBet}
              step={5}
              presets={[5, 10, 25, 50, 100]}
              onBetChange={setBet}
              disabled={spinning}
            />

            <SpinButton state={spinState} onClick={handleSpin} size="lg" />

            {/* Payout info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--np-space-2)',
                fontSize: 'var(--np-text-xs)',
                color: 'var(--np-text-muted)',
                letterSpacing: 'var(--np-tracking-wider)',
                minWidth: '80px',
              }}
            >
              <div>
                <div style={{ color: 'var(--np-text-secondary)' }}>PAYLINES</div>
                <div style={{ color: 'var(--np-gold)', fontWeight: 'var(--np-font-bold)' }}>
                  {NEON_PALACE_CONFIG.paylines.length}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--np-text-secondary)' }}>TOTAL BET</div>
                <div style={{ color: 'var(--np-gold)', fontWeight: 'var(--np-font-bold)' }}>
                  {(bet * NEON_PALACE_CONFIG.paylines.length).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Symbol legend */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--np-space-2)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '420px',
            }}
          >
            {Object.entries(SYMBOL_CONFIG).map(([key, cfg]) => (
              <div
                key={key}
                title={key}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: cfg.bg,
                  color: cfg.color,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: `0 0 6px ${cfg.bg}66`,
                }}
              >
                {cfg.char}
              </div>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ width: '100%', maxWidth: '460px' }}>
              <HistoryPanel entries={history} maxRows={5} />
            </div>
          )}
        </main>
      </div>
    </CasinoShell>
  );
}
