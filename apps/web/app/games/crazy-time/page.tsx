'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type SegmentKind =
  | '1'
  | '2'
  | '5'
  | '10'
  | 'COIN FLIP'
  | 'PACHINKO'
  | 'CASH HUNT'
  | 'CRAZY TIME';

type Phase = 'betting' | 'spinning' | 'result';

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  round: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEGMENT_DEFS: Array<{
  kind: SegmentKind;
  color: string;
  count: number;
  pay: number;
}> = [
  { kind: '1',          color: '#00d4c8', count: 21, pay: 1   },
  { kind: '2',          color: '#fbbf24', count: 13, pay: 2   },
  { kind: '5',          color: '#ef4444', count: 7,  pay: 5   },
  { kind: '10',         color: '#a855f7', count: 4,  pay: 10  },
  { kind: 'COIN FLIP',  color: '#22c55e', count: 4,  pay: 20  },
  { kind: 'PACHINKO',   color: '#f97316', count: 2,  pay: 40  },
  { kind: 'CASH HUNT',  color: '#ec4899', count: 2,  pay: 50  },
  { kind: 'CRAZY TIME', color: '#ffffff', count: 1,  pay: 100 },
];

const WHEEL_SEGMENTS: SegmentKind[] = [
  '1', '2', '1', '5', '1', '2', '1', '1', 'COIN FLIP', '1',
  '2', '1', '10', '1', '2', '1', '1', '5', '1', '2',
  'PACHINKO', '1', '2', '1', '1', '2', '1', '5', '1', '2',
  'CASH HUNT', '1', '2', '1', '1', 'COIN FLIP', '1', '2', '1', '10',
  '1', '2', '1', '1', '5', '1', '2', 'PACHINKO', '1', '2',
  'CASH HUNT', 'CRAZY TIME', 'COIN FLIP', 'COIN FLIP',
];

const COLOR_MAP = Object.fromEntries(
  SEGMENT_DEFS.map((d) => [d.kind, d.color]),
) as Record<SegmentKind, string>;

const PAY_MAP = Object.fromEntries(
  SEGMENT_DEFS.map((d) => [d.kind, d.pay]),
) as Record<SegmentKind, number>;

const SEG_LABEL: Record<SegmentKind, string> = {
  '1':          '1',
  '2':          '2',
  '5':          '5',
  '10':         '10',
  'COIN FLIP':  'CF',
  'PACHINKO':   'PAC',
  'CASH HUNT':  'CH',
  'CRAZY TIME': 'CT',
};

const CHIP_VALUES = [10, 25, 100, 500] as const;

const SVG_SIZE = 400;
const CENTER   = SVG_SIZE / 2;
const RADIUS   = 185;
const SEG_ANGLE = 360 / WHEEL_SEGMENTS.length; // 6.666…°

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @keyframes confetti-fall {
    0%   { transform: translateY(-30px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
  }

  @keyframes result-pop {
    0%   { transform: translate(-50%, -50%) scale(0.45); opacity: 0; }
    65%  { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
  }

  @keyframes spin-badge {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }

  @keyframes border-glow {
    0%, 100% { box-shadow: 0 0 8px currentColor; }
    50%       { box-shadow: 0 0 20px currentColor; }
  }
`;

// ─── SVG geometry helpers ─────────────────────────────────────────────────────

function polarToCartesian(r: number, angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

function buildSegmentPath(index: number): string {
  const startAngle = index * SEG_ANGLE;
  const endAngle   = (index + 1) * SEG_ANGLE;
  const s = polarToCartesian(RADIUS, startAngle);
  const e = polarToCartesian(RADIUS, endAngle);
  return `M ${CENTER} ${CENTER} L ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${RADIUS} ${RADIUS} 0 0 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)} Z`;
}

// ─── Game helpers ─────────────────────────────────────────────────────────────

function calcWin(resultKind: SegmentKind, bets: Map<SegmentKind, number>): number {
  const def = SEGMENT_DEFS.find((d) => d.kind === resultKind)!;
  const bet = bets.get(resultKind) ?? 0;
  return bet > 0 ? bet * def.pay : 0;
}

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: SEGMENT_DEFS[Math.floor(Math.random() * SEGMENT_DEFS.length)].color,
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1.2,
    round: Math.random() > 0.5,
  }));
}

// ─── Web Audio ────────────────────────────────────────────────────────────────

function playWheelSound(type: 'spin' | 'tick' | 'win' | 'bigwin'): void {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();

    if (type === 'spin') {
      const bufSize = ctx.sampleRate * 0.5;
      const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
      }
      const src  = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();

    } else if (type === 'tick') {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 440;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);

    } else if (type === 'win') {
      [523, 659, 784].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.25);
      });

    } else {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch {
    // audio unavailable — silently ignore
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrazyTime() {
  const router = useRouter();

  const [balance,      setBalance]      = useState<number>(10_000);
  const [bets,         setBets]         = useState<Map<SegmentKind, number>>(new Map());
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [phase,        setPhase]        = useState<Phase>('betting');
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [result,       setResult]       = useState<SegmentKind | null>(null);
  const [winAmount,    setWinAmount]    = useState<number>(0);
  const [confetti,     setConfetti]     = useState<ConfettiParticle[]>([]);

  const rotationRef    = useRef<number>(0);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── localStorage ──────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem('ct_demo_balance');
    if (saved !== null) setBalance(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('ct_demo_balance', String(balance));
  }, [balance]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalBet = Array.from(bets.values()).reduce((a, b) => a + b, 0);

  // ── Actions ───────────────────────────────────────────────────────────────

  const placeBet = useCallback(
    (kind: SegmentKind) => {
      if (phase !== 'betting') return;
      if (balance < selectedChip) return;
      setBets((prev) => {
        const next = new Map(prev);
        next.set(kind, (next.get(kind) ?? 0) + selectedChip);
        return next;
      });
      setBalance((prev) => prev - selectedChip);
    },
    [phase, balance, selectedChip],
  );

  const clearBets = useCallback(() => {
    if (phase !== 'betting') return;
    setBalance((prev) => prev + totalBet);
    setBets(new Map());
  }, [phase, totalBet]);

  const spin = useCallback(() => {
    if (phase !== 'betting' || totalBet === 0) return;

    const resultIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const resultKind  = WHEEL_SEGMENTS[resultIndex];

    setPhase('spinning');
    playWheelSound('spin');

    // Compute new cumulative rotation so resultIndex lands at 12 o'clock
    const targetAngle  = (resultIndex + 0.5) * SEG_ANGLE;
    const currentAngle = rotationRef.current % 360;
    let delta = targetAngle - currentAngle;
    if (delta < 0) delta += 360;
    const extraSpins  = 6 + Math.floor(Math.random() * 4); // 6–9 full rotations
    const totalDelta  = delta + extraSpins * 360;
    const newRotation = rotationRef.current + totalDelta;
    rotationRef.current = newRotation;
    setWheelRotation(newRotation);

    // Tick sounds during spin
    tickIntervalRef.current = setInterval(() => {
      playWheelSound('tick');
    }, 150);

    // Reveal result after CSS transition (4s) + small buffer
    setTimeout(() => {
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }

      const win = calcWin(resultKind, bets);
      setResult(resultKind);
      setWinAmount(win);

      if (win > 0) {
        setBalance((prev) => prev + win);
        if (resultKind === 'CRAZY TIME') {
          playWheelSound('bigwin');
          setConfetti(generateConfetti());
        } else {
          playWheelSound('win');
        }
      }

      setPhase('result');
    }, 4_100);
  }, [phase, totalBet, bets]);

  const resetGame = useCallback(() => {
    setPhase('betting');
    setBets(new Map());
    setResult(null);
    setWinAmount(0);
    setConfetti([]);
  }, []);

  // ── Dark text needed on light segment colors (white, green) ──────────────

  const needsDarkText = (kind: SegmentKind) =>
    kind === 'CRAZY TIME' || kind === 'COIN FLIP';

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ── Confetti (only for CRAZY TIME) ── */}
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.x}%`,
            top: '-30px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            zIndex: 999,
            pointerEvents: 'none',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}

      <div
        style={{
          minHeight: '100vh',
          background: '#02040a',
          color: '#f0f4ff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '100px',
        }}
      >
        {/* ── Top Nav ─────────────────────────────────────────────────────── */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: '#060a14',
            borderBottom: '1px solid #1a2840',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: '1px solid #1a2840',
              color: '#f0f4ff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ← LOBBY
          </button>

          <h1
            style={{
              fontSize: '30px',
              fontWeight: '900',
              margin: 0,
              letterSpacing: '2px',
              background:
                'linear-gradient(90deg, #ff0080, #ff8c00, #ffed00, #00ff80, #00cfff, #cc00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            CRAZY TIME
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                color: '#fbbf24',
                fontWeight: '700',
                fontSize: '17px',
                letterSpacing: '0.5px',
              }}
            >
              {balance.toLocaleString()} VCOIN
            </span>
            <span
              style={{
                background: '#0a1020',
                border: '1px solid #1a2840',
                color: '#5a6a8a',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px',
              }}
            >
              DEMO MODE
            </span>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            padding: '28px 16px',
          }}
        >
          {/* ── Wheel Area ─────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '36px',
            }}
          >
            {/* Outer container — holds both indicator & wheel */}
            <div
              style={{
                position: 'relative',
                width: SVG_SIZE,
                height: SVG_SIZE,
              }}
            >
              {/* Fixed pointer / indicator at 12 o'clock */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0px',
                  pointerEvents: 'none',
                }}
              >
                {/* Diamond tip */}
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    background: '#fbbf24',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 0 12px #fbbf24',
                    marginBottom: '-8px',
                  }}
                />
                {/* Stem */}
                <div
                  style={{
                    width: '6px',
                    height: '32px',
                    background: 'linear-gradient(to bottom, #fbbf24, #92400e)',
                    boxShadow: '0 0 8px #fbbf24aa',
                  }}
                />
              </div>

              {/* Spinning wheel */}
              <div
                style={{
                  width: SVG_SIZE,
                  height: SVG_SIZE,
                  borderRadius: '50%',
                  border: '8px solid #1a2840',
                  boxShadow:
                    '0 0 0 2px #0a1a30, 0 0 50px rgba(0,212,200,0.25), inset 0 0 24px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                  transition:
                    phase === 'spinning'
                      ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                      : 'none',
                  transform: `rotate(${wheelRotation}deg)`,
                }}
              >
                <svg
                  width={SVG_SIZE}
                  height={SVG_SIZE}
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                >
                  {/* Pie segments */}
                  {WHEEL_SEGMENTS.map((kind, i) => {
                    const midAngle = (i + 0.5) * SEG_ANGLE;
                    const midRad   = ((midAngle - 90) * Math.PI) / 180;
                    const labelR   = RADIUS * 0.68;
                    const tx       = CENTER + labelR * Math.cos(midRad);
                    const ty       = CENTER + labelR * Math.sin(midRad);
                    const label    = SEG_LABEL[kind];
                    const color    = COLOR_MAP[kind];
                    const darkText = needsDarkText(kind);

                    return (
                      <g key={i}>
                        <path
                          d={buildSegmentPath(i)}
                          fill={color}
                          stroke="#03060e"
                          strokeWidth="0.6"
                        />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6.5"
                          fill={darkText ? '#000000' : '#ffffff'}
                          fontWeight="bold"
                          transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                          style={{ userSelect: 'none' }}
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Separator rings */}
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS * 0.82}
                    fill="none"
                    stroke="#03060e"
                    strokeWidth="1"
                    opacity="0.4"
                  />

                  {/* Center hub */}
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={32}
                    fill="#060a14"
                    stroke="#1a2840"
                    strokeWidth="2"
                  />
                  <text
                    x={CENTER}
                    y={CENTER - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill="#fbbf24"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    CRAZY
                  </text>
                  <text
                    x={CENTER}
                    y={CENTER + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill="#fbbf24"
                    fontWeight="900"
                    letterSpacing="1"
                  >
                    TIME
                  </text>
                </svg>
              </div>

              {/* Spinning badge overlay */}
              {phase === 'spinning' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a2840',
                    color: '#00d4c8',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    animation: 'spin-badge 0.8s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SPINNING...
                </div>
              )}
            </div>
          </div>

          {/* ── Bet Grid ───────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            {SEGMENT_DEFS.map((def) => {
              const betAmt  = bets.get(def.kind) ?? 0;
              const hasBet  = betAmt > 0;
              const canBet  = phase === 'betting';
              const darkTxt = needsDarkText(def.kind);

              return (
                <div
                  key={def.kind}
                  onClick={() => placeBet(def.kind)}
                  style={{
                    background: `${def.color}22`,
                    border: `2px solid ${hasBet ? def.color : def.color + '55'}`,
                    boxShadow: hasBet
                      ? `0 0 14px ${def.color}70, inset 0 0 8px ${def.color}18`
                      : 'none',
                    borderRadius: '12px',
                    padding: '14px 10px 12px',
                    cursor: canBet ? 'pointer' : 'not-allowed',
                    textAlign: 'center',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    opacity: !canBet ? 0.65 : 1,
                    position: 'relative',
                    minHeight: '88px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  {/* Segment color swatch */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: def.color,
                      marginBottom: '4px',
                      boxShadow: `0 0 8px ${def.color}80`,
                    }}
                  />

                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: def.color,
                      lineHeight: 1.2,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {def.kind}
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: '#5a6a8a',
                      fontWeight: '600',
                    }}
                  >
                    ×{def.pay}
                  </div>

                  {hasBet && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#fbbf24',
                        fontWeight: '800',
                        marginTop: '2px',
                      }}
                    >
                      {betAmt.toLocaleString()}
                    </div>
                  )}

                  {/* Dark-text variant guard — not used in JSX, just silence lint */}
                  {darkTxt && false && null}
                </div>
              );
            })}
          </div>

          {/* ── Recent payout reference ────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '16px',
            }}
          >
            {SEGMENT_DEFS.map((def) => (
              <span
                key={def.kind}
                style={{
                  background: `${def.color}18`,
                  border: `1px solid ${def.color}40`,
                  color: def.color,
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                }}
              >
                {def.kind} ×{def.pay}
              </span>
            ))}
          </div>
        </main>

        {/* ── Result Backdrop ───────────────────────────────────────────────── */}
        {phase === 'result' && (
          <div
            onClick={resetGame}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.78)',
              zIndex: 98,
              cursor: 'pointer',
            }}
          />
        )}

        {/* ── Result Card ───────────────────────────────────────────────────── */}
        {phase === 'result' && result !== null && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 100,
              background: COLOR_MAP[result],
              borderRadius: '24px',
              padding: '44px 64px',
              textAlign: 'center',
              boxShadow: `0 0 80px ${COLOR_MAP[result]}cc, 0 0 160px ${COLOR_MAP[result]}44`,
              animation: 'result-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              minWidth: '320px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: needsDarkText(result) ? '#00000099' : '#ffffff99',
                letterSpacing: '3px',
                marginBottom: '10px',
              }}
            >
              RESULT
            </div>

            <div
              style={{
                fontSize: '38px',
                fontWeight: '900',
                color: needsDarkText(result) ? '#000000' : '#ffffff',
                letterSpacing: '1px',
                marginBottom: '18px',
                lineHeight: 1.1,
              }}
            >
              {result}
            </div>

            {winAmount > 0 ? (
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: '900',
                  color: needsDarkText(result) ? '#000000cc' : '#ffffffcc',
                  marginBottom: '8px',
                }}
              >
                +{winAmount.toLocaleString()} VCOIN
              </div>
            ) : (
              <div
                style={{
                  fontSize: '18px',
                  color: needsDarkText(result) ? '#00000066' : '#ffffff66',
                  marginBottom: '8px',
                }}
              >
                No bet on this segment
              </div>
            )}

            {(result === 'COIN FLIP' ||
              result === 'PACHINKO' ||
              result === 'CASH HUNT') && (
              <div
                style={{
                  marginTop: '14px',
                  background: 'rgba(0,0,0,0.18)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: needsDarkText(result) ? '#000000bb' : '#ffffffbb',
                  letterSpacing: '0.5px',
                }}
              >
                BONUS ROUND — ×{PAY_MAP[result]} multiplier applied!
              </div>
            )}

            {result === 'CRAZY TIME' && (
              <div
                style={{
                  marginTop: '14px',
                  background: 'rgba(0,0,0,0.18)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#000000cc',
                  letterSpacing: '1px',
                }}
              >
                🎉 JACKPOT! ×100 MEGA WIN!
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              style={{
                marginTop: '26px',
                background: 'rgba(0,0,0,0.22)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: needsDarkText(result) ? '#000000' : '#ffffff',
                padding: '12px 32px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '800',
                letterSpacing: '1px',
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {/* ── Bottom Bar ────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#060a14',
            borderTop: '1px solid #1a2840',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 50,
          }}
        >
          {/* Chip selector */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {CHIP_VALUES.map((v) => {
              const active = selectedChip === v;
              return (
                <button
                  key={v}
                  onClick={() => setSelectedChip(v)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: `2px solid ${active ? '#fbbf24' : '#1a2840'}`,
                    background: active ? '#fbbf24' : '#0a1020',
                    color: active ? '#000' : '#f0f4ff',
                    fontWeight: '800',
                    fontSize: '11px',
                    cursor: 'pointer',
                    boxShadow: active ? '0 0 12px #fbbf2480' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Spacer + total bet */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10px',
                color: '#5a6a8a',
                fontWeight: '700',
                letterSpacing: '1.5px',
                marginBottom: '2px',
              }}
            >
              TOTAL BET
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: '900',
                color: totalBet > 0 ? '#fbbf24' : '#2a3a5a',
                transition: 'color 0.2s',
              }}
            >
              {totalBet.toLocaleString()}
            </div>
          </div>

          {/* Clear Bets */}
          <button
            onClick={clearBets}
            disabled={phase !== 'betting' || totalBet === 0}
            style={{
              background: '#0a1020',
              border: '1px solid #1a2840',
              color:
                phase !== 'betting' || totalBet === 0 ? '#2a3a5a' : '#f0f4ff',
              padding: '11px 20px',
              borderRadius: '10px',
              cursor:
                phase !== 'betting' || totalBet === 0
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              letterSpacing: '0.5px',
              flexShrink: 0,
            }}
          >
            CLEAR
          </button>

          {/* Spin */}
          <button
            onClick={spin}
            disabled={phase !== 'betting' || totalBet === 0}
            style={{
              background:
                phase !== 'betting' || totalBet === 0
                  ? '#0f1824'
                  : 'linear-gradient(135deg, #ff0080 0%, #cc00ff 100%)',
              border: 'none',
              color:
                phase !== 'betting' || totalBet === 0 ? '#2a3a5a' : '#ffffff',
              padding: '13px 36px',
              borderRadius: '12px',
              cursor:
                phase !== 'betting' || totalBet === 0
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: '900',
              fontSize: '18px',
              letterSpacing: '1px',
              boxShadow:
                phase !== 'betting' || totalBet === 0
                  ? 'none'
                  : '0 0 24px rgba(204,0,255,0.5), 0 0 48px rgba(255,0,128,0.25)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {phase === 'spinning' ? 'SPINNING...' : 'SPIN!'}
          </button>
        </div>
      </div>
    </>
  );
}
