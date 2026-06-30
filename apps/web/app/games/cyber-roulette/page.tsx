'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────── */
const C = {
  bg: '#04080f',
  surface: '#070d1a',
  card: '#0b1222',
  navy: '#0a1628',
  cyan: '#00d4c8',
  cyanDim: '#00d4c840',
  gold: '#f4c430',
  purple: '#7c3aed',
  magenta: '#ff2d78',
  green: '#22c55e',
  text: '#f0eaf8',
  textDim: '#6a7a9a',
};

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%;
  background: #04080f;
  font-family: 'Outfit', sans-serif;
  color: #f0eaf8;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #04080f; }
::-webkit-scrollbar-thumb { background: #00d4c830; border-radius: 2px; }

@keyframes ballOrbit {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-1800deg); }
}
@keyframes toastSlideUp {
  0%   { opacity: 0; transform: translateY(60px) scale(0.9); }
  20%  { opacity: 1; transform: translateY(0) scale(1.02); }
  30%  { transform: scale(1); }
  80%  { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
}
@keyframes glowPulse {
  0%,100% { box-shadow: 0 0 10px #00d4c840, 0 0 20px #00d4c820; }
  50%      { box-shadow: 0 0 20px #00d4c880, 0 0 40px #00d4c840; }
}
@keyframes winPocket {
  0%,100% { fill-opacity: 1; }
  50%      { fill-opacity: 0.5; }
}
@keyframes spinnerGlow {
  0%,100% { box-shadow: 0 0 30px #00d4c840, inset 0 0 20px #00d4c810; }
  50%      { box-shadow: 0 0 60px #00d4c880, inset 0 0 40px #00d4c820; }
}
@keyframes betPlaced {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.15); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.spin-btn { transition: all 0.2s ease; }
.spin-btn:hover:not(:disabled) {
  background: #00f5e8 !important;
  box-shadow: 0 0 40px #00d4c8, 0 8px 32px #00d4c860 !important;
  transform: translateY(-2px);
}
.spin-btn:active:not(:disabled) { transform: translateY(0); }
.spin-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.chip-btn { transition: all 0.15s ease; cursor: pointer; }
.chip-btn:hover { transform: scale(1.1) translateY(-2px); }
.chip-btn.chip-active {
  border-color: #00d4c8 !important;
  box-shadow: 0 0 12px #00d4c860 !important;
}

.num-cell { transition: all 0.12s ease; cursor: pointer; position: relative; }
.num-cell:hover { transform: scale(1.08); z-index: 10; }
.num-cell.selected { box-shadow: 0 0 0 2px #00d4c8, 0 0 12px #00d4c860 !important; }
.num-cell.winner-cell { animation: glowPulse 0.8s ease-in-out infinite; }

.outside-btn { transition: all 0.12s ease; cursor: pointer; }
.outside-btn:hover { border-color: #00d4c8 !important; background: #00d4c815 !important; }
.outside-btn.selected { border-color: #00d4c8 !important; box-shadow: 0 0 10px #00d4c840 !important; }

.clear-btn { transition: all 0.15s ease; cursor: pointer; }
.clear-btn:hover { background: #ff2d7820 !important; border-color: #ff2d78 !important; }
`;

/* ─── ROULETTE CONSTANTS ─────────────────────────────────────────────────── */
// Standard European roulette wheel order (clockwise from 0)
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const CHIPS = [10, 25, 100, 500];
const SPIN_MS = 4200;
const STORAGE_KEY = 'cr_demo_balance';
const INITIAL_BAL = 10_000;

/* ─── TYPES ──────────────────────────────────────────────────────────────── */
type Phase = 'betting' | 'spinning' | 'result';
type BetType = 'straight' | 'color' | 'parity' | 'range' | 'dozen' | 'column';
interface Bet { type: BetType; value: string | number; amount: number; }

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function numColor(n: number): 'green' | 'red' | 'black' {
  if (n === 0) return 'green';
  return RED_NUMS.has(n) ? 'red' : 'black';
}

function calcWin(result: number, bets: Bet[]): number {
  const c = numColor(result);
  let total = 0;
  for (const b of bets) {
    switch (b.type) {
      case 'straight':
        if (b.value === result) total += b.amount * 36; // 35:1 + stake
        break;
      case 'color':
        if (result !== 0 && b.value === c) total += b.amount * 2;
        break;
      case 'parity':
        if (result !== 0) {
          if (b.value === 'odd' && result % 2 === 1) total += b.amount * 2;
          if (b.value === 'even' && result % 2 === 0) total += b.amount * 2;
        }
        break;
      case 'range':
        if (result !== 0) {
          if (b.value === 'low' && result <= 18) total += b.amount * 2;
          if (b.value === 'high' && result >= 19) total += b.amount * 2;
        }
        break;
      case 'dozen':
        if (result !== 0) {
          const d = result <= 12 ? 1 : result <= 24 ? 2 : 3;
          if (b.value === d) total += b.amount * 3; // 2:1 + stake
        }
        break;
      case 'column':
        if (result !== 0) {
          const col = ((result - 1) % 3) + 1;
          if (b.value === col) total += b.amount * 3;
        }
        break;
    }
  }
  return total;
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

/* ─── WHEEL SVG GEOMETRY ─────────────────────────────────────────────────── */
const W_SZ = 300;
const W_CX = W_SZ / 2;
const W_CY = W_SZ / 2;
const OUTER_R = 142;
const TRACK_R = 134; // ball track (inner part of outer ring)
const SEG_R = 126;   // segment outer radius
const INNER_R = 44;  // hub radius
const LABEL_R = 112; // where number text goes
const SEG_DEG = 360 / 37;

function buildSegPath(i: number, r: number = SEG_R): string {
  const s = ((i * SEG_DEG - 90) * Math.PI) / 180;
  const e = (((i + 1) * SEG_DEG - 90) * Math.PI) / 180;
  const x1 = W_CX + r * Math.cos(s);
  const y1 = W_CY + r * Math.sin(s);
  const x2 = W_CX + r * Math.cos(e);
  const y2 = W_CY + r * Math.sin(e);
  return `M${W_CX},${W_CY} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
}

function labelPos(i: number): [number, number, number] {
  const midDeg = (i + 0.5) * SEG_DEG;
  const rad = ((midDeg - 90) * Math.PI) / 180;
  return [
    W_CX + LABEL_R * Math.cos(rad),
    W_CY + LABEL_R * Math.sin(rad),
    midDeg,
  ];
}

// Pre-compute segment geometry
const SEGMENTS = WHEEL_ORDER.map((num, i) => {
  const c = numColor(num);
  const [lx, ly, midDeg] = labelPos(i);
  return { num, i, c, lx, ly, midDeg, path: buildSegPath(i) };
});

/* ─── WHEEL COMPONENT ────────────────────────────────────────────────────── */
function RouletteWheel({
  rotation, phase, winNumber,
}: { rotation: number; phase: Phase; winNumber: number | null }) {
  const isSpinning = phase === 'spinning';

  return (
    <div style={{ position: 'relative', width: W_SZ, height: W_SZ }}>
      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -14,
        borderRadius: '50%',
        boxShadow: isSpinning
          ? '0 0 60px #00d4c860, 0 0 120px #00d4c830'
          : '0 0 30px #00d4c840, 0 0 60px #00d4c820',
        transition: 'box-shadow 0.5s ease',
        pointerEvents: 'none',
        animation: isSpinning ? 'spinnerGlow 1.2s ease-in-out infinite' : 'none',
      }} />

      {/* Spinning wheel container */}
      <div style={{
        width: W_SZ, height: W_SZ,
        borderRadius: '50%',
        transition: isSpinning
          ? `transform ${SPIN_MS}ms cubic-bezier(0.2, 0.8, 0.3, 1)` : 'none',
        transform: `rotate(${rotation}deg)`,
        willChange: 'transform',
      }}>
        <svg width={W_SZ} height={W_SZ} viewBox={`0 0 ${W_SZ} ${W_SZ}`} style={{ display: 'block' }}>
          {/* Outer decorative rings */}
          <circle cx={W_CX} cy={W_CY} r={OUTER_R} fill="#050a15" stroke="#00d4c8" strokeWidth="2.5" />
          <circle cx={W_CX} cy={W_CY} r={TRACK_R} fill="#040810" stroke="#00d4c840" strokeWidth="1" />

          {/* Wheel segments */}
          {SEGMENTS.map(({ num, c, lx, ly, midDeg, path }) => {
            const isWin = winNumber === num && phase === 'result';
            const segFill = c === 'green' ? '#14532d' : c === 'red' ? '#7f1d1d' : '#0d1424';
            const winFill = c === 'green' ? '#22c55e' : c === 'red' ? '#ef4444' : '#334155';
            return (
              <g key={num}>
                <path
                  d={path}
                  fill={isWin ? winFill : segFill}
                  stroke="#00000060"
                  strokeWidth="0.4"
                />
                {isWin && (
                  <path d={path} fill="none" stroke="#f4c430" strokeWidth="2.5" opacity="0.9" />
                )}
                <text
                  x={lx} y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7.5"
                  fontFamily="Outfit, sans-serif"
                  fontWeight="700"
                  fill={isWin ? '#f4c430' : '#e2e8f0'}
                  transform={`rotate(${midDeg}, ${lx}, ${ly})`}
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Pocket dividers */}
          {SEGMENTS.map(({ i }) => {
            const rad = ((i * SEG_DEG - 90) * Math.PI) / 180;
            const x = W_CX + SEG_R * Math.cos(rad);
            const y = W_CY + SEG_R * Math.sin(rad);
            return (
              <line key={i}
                x1={W_CX} y1={W_CY} x2={x.toFixed(2)} y2={y.toFixed(2)}
                stroke="#00000050" strokeWidth="0.3"
              />
            );
          })}

          {/* Hub */}
          <circle cx={W_CX} cy={W_CY} r={INNER_R} fill="#04080f" stroke="#00d4c8" strokeWidth="2" />
          <circle cx={W_CX} cy={W_CY} r={INNER_R - 8} fill="#0a1628" />
          <circle cx={W_CX} cy={W_CY} r={INNER_R - 16} fill="#04080f" stroke="#00d4c830" strokeWidth="1" />
          <text x={W_CX} y={W_CY - 5}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fontFamily="Outfit" fontWeight="800" fill="#00d4c8">CYBER</text>
          <text x={W_CX} y={W_CY + 7}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="6.5" fontFamily="Outfit" fontWeight="500" fill="#6a7a9a">ROULETTE</text>
        </svg>
      </div>

      {/* Ball orbit (counter-clockwise while wheel spins clockwise) */}
      {isSpinning && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: W_SZ, height: W_SZ,
          transformOrigin: 'center center',
          animation: `ballOrbit ${SPIN_MS}ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards`,
          pointerEvents: 'none',
        }}>
          {/* Ball at top of orbit track (at OUTER_R - 6 = 136 from center, so top = 150-136 = 14) */}
          <div style={{
            position: 'absolute',
            top: W_CY - OUTER_R + 4,
            left: W_CX - 5,
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffffff, #b0b8c0)',
            boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.5)',
          }} />
        </div>
      )}

      {/* Ball resting in winning pocket after spin */}
      {phase === 'result' && winNumber !== null && (() => {
        // Indicator at top (0 deg) shows winning pocket — ball rests at the top of the outer ring.
        const ballAngleRad = (-90 * Math.PI) / 180; // top = -90 degrees in standard math coords
        const bx = W_CX + (OUTER_R - 6) * Math.cos(ballAngleRad) - 5;
        const by = W_CY + (OUTER_R - 6) * Math.sin(ballAngleRad) - 5;
        return (
          <div style={{
            position: 'absolute',
            top: by, left: bx,
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffffff, #b0b8c0)',
            boxShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px #f4c43060',
            pointerEvents: 'none',
            zIndex: 20,
          }} />
        );
      })()}

      {/* Fixed indicator pointer */}
      <div style={{
        position: 'absolute', top: -6, left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '16px solid #f4c430',
        filter: 'drop-shadow(0 0 8px #f4c430)',
        zIndex: 30,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─── WINNING DISPLAY ────────────────────────────────────────────────────── */
function WinDisplay({ winNumber }: { winNumber: number | null }) {
  if (winNumber === null) return null;
  const c = numColor(winNumber);
  const labelColor = c === 'green' ? C.green : c === 'red' ? C.magenta : C.text;
  const label = c === 'green' ? 'GREEN' : c === 'red' ? 'RED' : 'BLACK';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 24px',
      background: C.card,
      borderRadius: 12,
      border: `1px solid ${labelColor}40`,
      boxShadow: `0 0 20px ${labelColor}30`,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: 2, textTransform: 'uppercase' }}>
        Last Result
      </span>
      <span style={{ fontSize: 52, fontWeight: 900, color: labelColor, lineHeight: 1 }}>
        {winNumber}
      </span>
      <span style={{
        fontSize: 12, fontWeight: 700, color: labelColor, letterSpacing: 3,
        padding: '2px 10px', borderRadius: 4,
        background: `${labelColor}20`,
        border: `1px solid ${labelColor}40`,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─── NUMBER GRID ────────────────────────────────────────────────────────── */
interface NumberGridProps {
  bets: Bet[];
  phase: Phase;
  winNumber: number | null;
  onBet: (type: BetType, value: string | number) => void;
}

function NumberGrid({ bets, phase, winNumber, onBet }: NumberGridProps) {
  const getBetOnNum = (n: number) => bets.filter(b => b.type === 'straight' && b.value === n).reduce((s, b) => s + b.amount, 0);
  const canBet = phase === 'betting';

  // Color styles for number cells
  function cellStyle(n: number): React.CSSProperties {
    const c = numColor(n);
    const bet = getBetOnNum(n);
    const isWin = winNumber === n && phase === 'result';
    const selected = bet > 0;
    let bg = c === 'green' ? '#14532d' : c === 'red' ? '#3f0d0d' : '#0d1118';
    let border = c === 'green' ? '#22c55e40' : c === 'red' ? '#ef444440' : '#1e2a3a';
    let textColor = c === 'green' ? C.green : c === 'red' ? '#fca5a5' : '#94a3b8';
    if (isWin) {
      bg = c === 'green' ? '#22c55e' : c === 'red' ? '#ef4444' : '#334155';
      textColor = '#ffffff';
      border = C.gold;
    }
    return {
      background: bg,
      border: `1px solid ${selected ? C.cyan : border}`,
      boxShadow: selected ? `0 0 8px ${C.cyanDim}` : isWin ? `0 0 16px ${C.gold}60` : 'none',
      color: textColor,
      borderRadius: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      fontSize: 13, fontWeight: 700,
      cursor: canBet ? 'pointer' : 'default',
      userSelect: 'none',
      position: 'relative',
      minHeight: 36,
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 0 cell spanning full row */}
      <div
        className={`num-cell${getBetOnNum(0) > 0 ? ' selected' : ''}${winNumber === 0 && phase === 'result' ? ' winner-cell' : ''}`}
        style={{
          ...cellStyle(0),
          minHeight: 38,
          fontSize: 15,
          letterSpacing: 1,
        }}
        onClick={() => canBet && onBet('straight', 0)}
      >
        <span>0</span>
        {getBetOnNum(0) > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 4,
            fontSize: 9, color: C.cyan, fontWeight: 700,
          }}>{getBetOnNum(0)}</span>
        )}
      </div>

      {/* Numbers 1–36 in rows of 3 */}
      {Array.from({ length: 12 }, (_, row) => (
        <div key={row} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          {[row * 3 + 1, row * 3 + 2, row * 3 + 3].map(n => {
            const bet = getBetOnNum(n);
            return (
              <div
                key={n}
                className={`num-cell${bet > 0 ? ' selected' : ''}${winNumber === n && phase === 'result' ? ' winner-cell' : ''}`}
                style={cellStyle(n)}
                onClick={() => canBet && onBet('straight', n)}
              >
                <span>{n}</span>
                {bet > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 3,
                    fontSize: 8, color: C.cyan, fontWeight: 700,
                  }}>{bet}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Column bets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginTop: 2 }}>
        {[1, 2, 3].map(col => {
          const bet = bets.filter(b => b.type === 'column' && b.value === col).reduce((s, b) => s + b.amount, 0);
          return (
            <div
              key={col}
              className={`outside-btn${bet > 0 ? ' selected' : ''}`}
              style={{
                background: C.navy,
                border: `1px solid ${bet > 0 ? C.cyan : '#1e2a3a'}`,
                borderRadius: 5,
                padding: '5px 4px',
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: bet > 0 ? C.cyan : C.textDim,
                cursor: canBet ? 'pointer' : 'default',
                position: 'relative',
              }}
              onClick={() => canBet && onBet('column', col)}
            >
              {col === 1 ? '1st Col' : col === 2 ? '2nd Col' : '3rd Col'}
              <span style={{ display: 'block', fontSize: 9, color: C.textDim, fontWeight: 400 }}>2:1</span>
              {bet > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, color: C.cyan, fontWeight: 700 }}>{bet}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── OUTSIDE BETS ───────────────────────────────────────────────────────── */
interface OutsideBetsProps {
  bets: Bet[];
  phase: Phase;
  onBet: (type: BetType, value: string | number) => void;
}

function OutsideBets({ bets, phase, onBet }: OutsideBetsProps) {
  const canBet = phase === 'betting';

  function getBet(type: BetType, value: string | number): number {
    return bets.filter(b => b.type === type && b.value === value).reduce((s, b) => s + b.amount, 0);
  }

  function OutBtn({
    type, value, label, sub, accentColor,
  }: { type: BetType; value: string | number; label: string; sub?: string; accentColor?: string }) {
    const bet = getBet(type, value);
    const active = bet > 0;
    const accent = accentColor ?? C.cyan;
    return (
      <div
        className={`outside-btn${active ? ' selected' : ''}`}
        style={{
          background: active ? `${accent}12` : C.navy,
          border: `1px solid ${active ? accent : '#1e2a3a'}`,
          borderRadius: 6,
          padding: '8px 6px',
          textAlign: 'center',
          cursor: canBet ? 'pointer' : 'default',
          position: 'relative',
          flex: 1,
        }}
        onClick={() => canBet && onBet(type, value)}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: active ? accent : C.text }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{sub}</div>}
        {bet > 0 && (
          <div style={{
            position: 'absolute', top: 3, right: 5,
            fontSize: 9, color: accent, fontWeight: 700,
          }}>{bet}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
      {/* Dozens */}
      <div style={{ display: 'flex', gap: 4 }}>
        <OutBtn type="dozen" value={1} label="1–12" sub="2:1" />
        <OutBtn type="dozen" value={2} label="13–24" sub="2:1" />
        <OutBtn type="dozen" value={3} label="25–36" sub="2:1" />
      </div>

      {/* Even-money bets */}
      <div style={{ display: 'flex', gap: 4 }}>
        <OutBtn type="range" value="low"  label="1–18"  sub="1:1" accentColor={C.cyan} />
        <OutBtn type="parity" value="odd"  label="Odd"   sub="1:1" accentColor={C.cyan} />
        <OutBtn type="color" value="red"   label="Red"   sub="1:1" accentColor={C.magenta} />
        <OutBtn type="color" value="black" label="Black" sub="1:1" accentColor="#94a3b8" />
        <OutBtn type="parity" value="even" label="Even"  sub="1:1" accentColor={C.cyan} />
        <OutBtn type="range" value="high"  label="19–36" sub="1:1" accentColor={C.cyan} />
      </div>
    </div>
  );
}

/* ─── RESULT TOAST ───────────────────────────────────────────────────────── */
function ResultToast({ winNumber, winAmount }: { winNumber: number | null; winAmount: number }) {
  if (winNumber === null) return null;
  const c = numColor(winNumber);
  const colorLabel = c === 'green' ? 'GREEN' : c === 'red' ? 'RED' : 'BLACK';
  const accentColor = c === 'green' ? C.green : c === 'red' ? C.magenta : '#94a3b8';
  const isWin = winAmount > 0;

  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      animation: 'toastSlideUp 3s ease-in-out forwards',
      minWidth: 280,
    }}>
      <div style={{
        background: C.card,
        border: `2px solid ${accentColor}`,
        borderRadius: 16,
        padding: '20px 32px',
        textAlign: 'center',
        boxShadow: `0 8px 40px ${accentColor}40, 0 0 80px ${accentColor}20`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: 3, marginBottom: 8 }}>
          RESULT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{
            fontSize: 56, fontWeight: 900, color: accentColor, lineHeight: 1,
          }}>{winNumber}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: accentColor,
              background: `${accentColor}20`, padding: '2px 10px', borderRadius: 4,
              border: `1px solid ${accentColor}40`,
              letterSpacing: 2,
            }}>{colorLabel}</div>
            {c !== 'green' && (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
                {winNumber % 2 === 0 ? 'EVEN' : 'ODD'} · {winNumber <= 18 ? '1–18' : '19–36'}
              </div>
            )}
          </div>
        </div>
        {isWin ? (
          <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>
            +{fmtNum(winAmount)} VCOIN
          </div>
        ) : (
          <div style={{ fontSize: 16, fontWeight: 600, color: C.magenta }}>
            No win this round
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function CyberRoulette() {
  const router = useRouter();
  const [balance, setBalance] = useState(INITIAL_BAL);
  const [bets, setBets] = useState<Bet[]>([]);
  const [chip, setChip] = useState(25);
  const [phase, setPhase] = useState<Phase>('betting');
  const [winNumber, setWinNumber] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load / save balance ────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setBalance(Number(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(balance));
  }, [balance]);

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ── Derived values ─────────────────────────────────────────────────────
  const totalBet = bets.reduce((s, b) => s + b.amount, 0);

  // ── Place / accumulate a bet ───────────────────────────────────────────
  const placeBet = useCallback((type: BetType, value: string | number) => {
    if (phase !== 'betting') return;
    if (chip > balance - totalBet) return; // insufficient funds
    setBets(prev => {
      const idx = prev.findIndex(b => b.type === type && b.value === value);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: next[idx].amount + chip };
        return next;
      }
      return [...prev, { type, value, amount: chip }];
    });
  }, [phase, chip, balance, totalBet]);

  // ── Clear bets ─────────────────────────────────────────────────────────
  const clearBets = useCallback(() => {
    if (phase !== 'betting') return;
    setBets([]);
  }, [phase]);

  // ── Spin ───────────────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (phase !== 'betting' || bets.length === 0) return;

    const result = Math.floor(Math.random() * 37); // 0–36
    const idx = WHEEL_ORDER.indexOf(result);

    // Calculate wheel rotation so pocket at `idx` lands at the indicator (top).
    // Pocket i starts at angle: i * SEG_DEG clockwise from top.
    // After CW rotation D, indicator (top) points to pocket that was at angle (360 - D % 360) % 360.
    // We want: (360 - D % 360) % 360 ≡ idx * SEG_DEG (mod 360)
    // → D ≡ 360 - idx * SEG_DEG (mod 360) ≡ -idx * SEG_DEG (mod 360)
    const targetMod = ((-idx * SEG_DEG) % 360 + 360) % 360;
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    let delta = ((targetMod - currentMod) % 360 + 360) % 360;
    if (delta < 10) delta += 360; // ensure at least some visual movement
    const extraSpins = (6 + Math.floor(Math.random() * 3)) * 360;

    setWheelRotation(prev => prev + delta + extraSpins);
    setPhase('spinning');
    setBalance(prev => prev - totalBet);

    timerRef.current = setTimeout(() => {
      const winnings = calcWin(result, bets);
      setWinNumber(result);
      setWinAmount(winnings);
      if (winnings > 0) setBalance(prev => prev + winnings);
      setPhase('result');
      setShowToast(true);

      timerRef.current = setTimeout(() => {
        setShowToast(false);
        setBets([]);
        setPhase('betting');
      }, 3200);
    }, SPIN_MS + 100);
  }, [phase, bets, totalBet, wheelRotation]);

  // ── Reset ──────────────────────────────────────────────────────────────
  const resetBalance = useCallback(() => {
    if (phase === 'spinning') return;
    setBalance(INITIAL_BAL);
    setBets([]);
    setPhase('betting');
    setWinNumber(null);
  }, [phase]);

  const canSpin = phase === 'betting' && bets.length > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <div style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
      }}>

        {/* ── TOP NAV ─────────────────────────────────────────────────── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          background: C.surface,
          borderBottom: `1px solid ${C.cyanDim}`,
          boxShadow: '0 2px 20px rgba(0,212,200,0.08)',
          position: 'sticky', top: 0, zIndex: 100,
          flexShrink: 0,
        }}>
          {/* Left — back button */}
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: `1px solid ${C.cyanDim}`,
              borderRadius: 8,
              color: C.textDim,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.color = C.cyan;
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.cyan;
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.color = C.textDim;
              (e.currentTarget as HTMLButtonElement).style.borderColor = C.cyanDim;
            }}
          >
            ← LOBBY
          </button>

          {/* Center — title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontSize: 18, fontWeight: 900, letterSpacing: 3,
              color: C.cyan,
              textShadow: '0 0 20px #00d4c880',
            }}>
              CYBER ROULETTE
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2,
              background: `${C.purple}30`,
              border: `1px solid ${C.purple}60`,
              borderRadius: 4, padding: '2px 8px',
              color: C.purple,
            }}>EUROPEAN</span>
          </div>

          {/* Right — balance + reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              padding: '6px 14px',
              background: C.card,
              border: `1px solid ${C.cyanDim}`,
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 10, color: C.textDim, letterSpacing: 1 }}>BALANCE</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>
                {fmtNum(balance)} <span style={{ fontSize: 10, color: C.textDim }}>VCOIN</span>
              </span>
            </div>
            <button
              onClick={resetBalance}
              title="Reset balance to 10,000"
              style={{
                background: 'transparent',
                border: `1px solid #f4c43040`,
                borderRadius: 8, padding: '6px 12px',
                fontSize: 11, fontWeight: 600, color: '#f4c43080',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >↺ RESET</button>
          </div>
        </nav>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 16px 120px',
          gap: 20,
        }}>
          {/* Demo mode badge */}
          <div style={{
            background: `${C.gold}15`,
            border: `1px solid ${C.gold}40`,
            borderRadius: 20, padding: '4px 16px',
            fontSize: 11, fontWeight: 700, color: C.gold,
            letterSpacing: 2,
          }}>
            DEMO MODE — Virtual Currency Only
          </div>

          {/* Two-column layout */}
          <div style={{
            display: 'flex',
            gap: 24,
            width: '100%',
            maxWidth: 1100,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {/* ── LEFT COLUMN: WHEEL ─────────────────────────────────── */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              minWidth: 300,
            }}>
              <RouletteWheel
                rotation={wheelRotation}
                phase={phase}
                winNumber={winNumber}
              />

              {/* Spin status text */}
              <div style={{
                fontSize: 13, fontWeight: 600, color: C.textDim,
                letterSpacing: 2, textAlign: 'center', minHeight: 20,
              }}>
                {phase === 'spinning' && '● SPINNING…'}
                {phase === 'betting' && (bets.length === 0 ? 'Place your bets to spin' : `${bets.length} bet${bets.length > 1 ? 's' : ''} placed — ready to spin`)}
                {phase === 'result' && '● RESULT'}
              </div>

              {/* Win display */}
              <WinDisplay winNumber={phase === 'result' ? winNumber : winNumber} />
            </div>

            {/* ── RIGHT COLUMN: BETTING TABLE ────────────────────────── */}
            <div style={{
              flex: 1, minWidth: 320, maxWidth: 500,
              background: C.surface,
              border: `1px solid ${C.cyanDim}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 4px 40px rgba(0,212,200,0.06)',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: C.textDim,
                letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase',
              }}>Betting Table</div>

              <NumberGrid
                bets={bets}
                phase={phase}
                winNumber={winNumber}
                onBet={placeBet}
              />

              <div style={{
                height: 1,
                background: `linear-gradient(to right, transparent, ${C.cyanDim}, transparent)`,
                margin: '12px 0',
              }} />

              <OutsideBets bets={bets} phase={phase} onBet={placeBet} />

              {/* Bet summary */}
              {bets.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: C.card,
                  borderRadius: 8,
                  border: `1px solid ${C.cyanDim}`,
                  fontSize: 12, color: C.textDim,
                }}>
                  {bets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: C.text }}>
                        {b.type === 'straight' ? `#${b.value}` :
                          b.type === 'color' ? String(b.value).toUpperCase() :
                          b.type === 'parity' ? String(b.value).toUpperCase() :
                          b.type === 'range' ? (b.value === 'low' ? '1–18' : '19–36') :
                          b.type === 'dozen' ? `${b.value}${b.value === 1 ? 'st' : b.value === 2 ? 'nd' : 'rd'} Dozen` :
                          `${b.value}${b.value === 1 ? 'st' : b.value === 2 ? 'nd' : 'rd'} Column`}
                      </span>
                      <span style={{ color: C.cyan, fontWeight: 700 }}>{fmtNum(b.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── BOTTOM BAR ──────────────────────────────────────────────── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: C.surface,
          borderTop: `1px solid ${C.cyanDim}`,
          boxShadow: '0 -4px 30px rgba(0,212,200,0.10)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, zIndex: 200, flexWrap: 'wrap',
        }}>
          {/* Chip selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: 1, marginRight: 4 }}>
              CHIP
            </span>
            {CHIPS.map(c => (
              <button
                key={c}
                className={`chip-btn${chip === c ? ' chip-active' : ''}`}
                onClick={() => setChip(c)}
                style={{
                  width: 48, height: 48,
                  borderRadius: '50%',
                  border: `2px solid ${chip === c ? C.cyan : '#1e2a3a'}`,
                  background: chip === c
                    ? `radial-gradient(circle at 35% 35%, #00d4c830, #00d4c810)`
                    : C.card,
                  color: chip === c ? C.cyan : C.textDim,
                  fontSize: c >= 100 ? 11 : 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: chip === c ? `0 0 12px ${C.cyanDim}` : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {c >= 1000 ? `${c / 1000}k` : c}
              </button>
            ))}
          </div>

          {/* Total bet display */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1 }}>TOTAL BET</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: totalBet > 0 ? C.gold : C.textDim }}>
              {fmtNum(totalBet)} VCOIN
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="clear-btn"
              onClick={clearBets}
              disabled={bets.length === 0 || phase !== 'betting'}
              style={{
                background: 'transparent',
                border: `1px solid #1e2a3a`,
                borderRadius: 10, padding: '12px 20px',
                fontSize: 13, fontWeight: 700, color: C.textDim,
                cursor: bets.length > 0 && phase === 'betting' ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                opacity: bets.length === 0 || phase !== 'betting' ? 0.4 : 1,
              }}
            >
              Clear Bets
            </button>

            <button
              className="spin-btn"
              onClick={spin}
              disabled={!canSpin}
              style={{
                background: canSpin
                  ? `linear-gradient(135deg, #00d4c8, #00a89e)`
                  : C.card,
                border: `2px solid ${canSpin ? C.cyan : '#1e2a3a'}`,
                borderRadius: 12,
                padding: '12px 40px',
                fontSize: 16, fontWeight: 900, letterSpacing: 3,
                color: canSpin ? '#04080f' : C.textDim,
                fontFamily: 'inherit',
                boxShadow: canSpin ? '0 0 20px #00d4c860, 0 4px 20px #00d4c840' : 'none',
                animation: canSpin && phase === 'betting' ? 'glowPulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {phase === 'spinning' ? 'SPINNING…' : 'SPIN'}
            </button>
          </div>
        </div>

        {/* ── RESULT TOAST ────────────────────────────────────────────── */}
        {showToast && (
          <ResultToast winNumber={winNumber} winAmount={winAmount} />
        )}
      </div>
    </>
  );
}
