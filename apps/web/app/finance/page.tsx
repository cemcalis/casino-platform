'use client';

import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const C = {
  bgDeep: '#0d0618',
  bgSurface: '#251240',
  bgCard: '#1a0d30',
  gold: '#f4c430',
  goldDim: '#c9a020',
  teal: '#00d4c8',
  magenta: '#ff2d78',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#a855f7',
  yellow: '#eab308',
  text: '#f0e8ff',
  textMuted: '#9b8ab8',
  border: 'rgba(244,196,48,0.15)',
  borderFaint: 'rgba(240,232,255,0.07)',
};

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const REVENUE_DATA = [
  210000, 185000, 232000, 278000, 195000, 310000, 265000,
  298000, 240000, 315000, 282000, 330000, 295000, 318000,
  275000, 345000, 312000, 358000, 290000, 375000, 340000,
  392000, 328000, 410000, 365000, 425000, 380000, 440000,
  395000, 460000,
];
const PROFIT_DATA = REVENUE_DATA.map((v) => Math.round(v * 0.32 + Math.random() * 15000));

const TRANSACTIONS = [
  { id: 'TXN-88421', player: 'GoldStar_99', type: 'Deposit',    amount: 5000,   method: 'Card',    status: 'Completed', time: '23:01', kycLevel: 3, riskScore: 5, ip: '192.168.1.45' },
  { id: 'TXN-88420', player: 'NeonKing',    type: 'Withdrawal', amount: 2500,   method: 'Crypto',  status: 'Pending',   time: '22:58', kycLevel: 2, riskScore: 15, ip: '185.42.12.89' },
  { id: 'TXN-88419', player: 'VIPLord_7',   type: 'Bonus',      amount: 1000,   method: '—',       status: 'Completed', time: '22:55', kycLevel: 3, riskScore: 2, ip: '45.33.21.100' },
  { id: 'TXN-88418', player: 'SpinMaster',  type: 'Deposit',    amount: 750,    method: 'eWallet', status: 'Completed', time: '22:51', kycLevel: 1, riskScore: 8, ip: '78.120.45.67' },
  { id: 'TXN-88417', player: 'CryptoAce',   type: 'Withdrawal', amount: 12000,  method: 'Crypto',  status: 'Failed',    time: '22:48', kycLevel: 2, riskScore: 45, ip: '103.55.88.12' },
  { id: 'TXN-88416', player: 'LuckyStar',   type: 'Deposit',    amount: 300,    method: 'Bank',    status: 'Pending',   time: '22:44', kycLevel: 1, riskScore: 12, ip: '212.45.78.90' },
  { id: 'TXN-88415', player: 'HighRoller',  type: 'Adjustment', amount: -500,   method: '—',       status: 'Completed', time: '22:40', kycLevel: 3, riskScore: 0, ip: '89.12.45.67' },
  { id: 'TXN-88414', player: 'NeonQueen',   type: 'Deposit',    amount: 2000,   method: 'Card',    status: 'Completed', time: '22:37', kycLevel: 2, riskScore: 7, ip: '156.78.90.12' },
  { id: 'TXN-88413', player: 'JetSet_VIP',  type: 'Withdrawal', amount: 8500,   method: 'Bank',    status: 'Completed', time: '22:33', kycLevel: 3, riskScore: 3, ip: '34.56.78.90' },
  { id: 'TXN-88412', player: 'SlotKing',    type: 'Bonus',      amount: 250,    method: '—',       status: 'Completed', time: '22:29', kycLevel: 1, riskScore: 5, ip: '123.45.67.89' },
  { id: 'TXN-88411', player: 'DiamondX',    type: 'Deposit',    amount: 10000,  method: 'Crypto',  status: 'Completed', time: '22:25', kycLevel: 3, riskScore: 10, ip: '67.89.12.34' },
  { id: 'TXN-88410', player: 'RoyalFlush',  type: 'Withdrawal', amount: 3200,   method: 'eWallet', status: 'Pending',   time: '22:20', kycLevel: 2, riskScore: 18, ip: '90.12.34.56' },
  { id: 'TXN-88409', player: 'GoldRush',    type: 'Deposit',    amount: 1500,   method: 'Card',    status: 'Completed', time: '22:15', kycLevel: 1, riskScore: 6, ip: '234.56.78.90' },
  { id: 'TXN-88408', player: 'NightOwl',    type: 'Adjustment', amount: 200,    method: '—',       status: 'Completed', time: '22:10', kycLevel: 2, riskScore: 1, ip: '45.67.89.12' },
  { id: 'TXN-88407', player: 'VaultBreak',  type: 'Deposit',    amount: 4200,   method: 'Bank',    status: 'Completed', time: '22:05', kycLevel: 3, riskScore: 4, ip: '78.90.12.34' },
];

const RISK_ALERTS = [
  { level: 'HIGH',   color: C.red,    bg: 'rgba(239,68,68,0.12)',    icon: '🔴', msg: 'Player #8421 – Unusual withdrawal pattern ($50,000)',  time: '2m ago' },
  { level: 'MEDIUM', color: C.orange, bg: 'rgba(249,115,22,0.12)',   icon: '🟠', msg: 'RTP spike on Neon Palace Slots (98.2%)',               time: '11m ago' },
  { level: 'LOW',    color: C.yellow, bg: 'rgba(234,179,8,0.12)',    icon: '🟡', msg: 'New IP login detected for VIP player #1204',           time: '18m ago' },
  { level: 'INFO',   color: C.blue,   bg: 'rgba(59,130,246,0.12)',   icon: '🔵', msg: 'Daily GGR target reached 94% – on track',             time: '34m ago' },
  { level: 'MEDIUM', color: C.orange, bg: 'rgba(249,115,22,0.12)',   icon: '🟠', msg: 'Chargeback request submitted – $2,300',                time: '1h ago' },
];

const PAYMENT_METHODS = [
  { name: 'Card',    pct: 45, color: C.gold },
  { name: 'Crypto',  pct: 28, color: C.teal },
  { name: 'Bank',    pct: 18, color: C.purple },
  { name: 'eWallet', pct:  9, color: C.magenta },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function useCountUp(target: number, duration = 1800, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now() + delay;
    function tick(now: number) {
      const elapsed = Math.max(0, now - start);
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(lerp(0, target, eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

/* ─────────────────────────────────────────────
   SPARKLINE
───────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${h} L${pts.split(' ').map((p, i) => (i === 0 ? `0,${h} L${p}` : p)).join(' L')} L${w},${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${area}`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   REVENUE CHART
───────────────────────────────────────────── */
function RevenueChart({ progress }: { progress: number }) {
  const W = 900, H = 280, PAD = { t: 20, r: 20, b: 40, l: 70 };
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b;
  const all = [...REVENUE_DATA, ...PROFIT_DATA];
  const maxV = Math.max(...all), minV = 0;

  function toXY(data: number[], idx: number) {
    const x = PAD.l + (idx / (data.length - 1)) * cw;
    const y = PAD.t + ch - ((data[idx] - minV) / (maxV - minV)) * ch;
    return [x, y];
  }

  function buildPath(data: number[], prog: number) {
    const pts = data.map((_, i) => toXY(data, i));
    const visible = Math.max(2, Math.round(prog * pts.length));
    const p = pts.slice(0, visible);
    if (p.length < 2) return '';
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const cp1x = p[i-1][0] + (p[i][0] - p[i-1][0]) / 3;
      const cp2x = p[i][0] - (p[i][0] - p[i-1][0]) / 3;
      d += ` C${cp1x},${p[i-1][1]} ${cp2x},${p[i][1]} ${p[i][0]},${p[i][1]}`;
    }
    return d;
  }

  function buildArea(data: number[], prog: number) {
    const path = buildPath(data, prog);
    if (!path) return '';
    const pts = data.map((_, i) => toXY(data, i));
    const visible = Math.max(2, Math.round(prog * pts.length));
    const lastX = pts[visible - 1][0];
    return `${path} L${lastX},${PAD.t + ch} L${PAD.l},${PAD.t + ch} Z`;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(t => maxV * t);
  const dayLabels = [1,5,10,15,20,25,30];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.teal} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.teal} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((v, i) => {
        const y = PAD.t + ch - (v / maxV) * ch;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke="rgba(240,232,255,0.07)" strokeWidth="1" strokeDasharray="4,4" />
            <text x={PAD.l - 8} y={y + 4} textAnchor="end"
              fill={C.textMuted} fontSize="11" fontFamily="Inter, sans-serif">
              {v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            </text>
          </g>
        );
      })}

      {/* Day labels */}
      {dayLabels.map(d => {
        const i = d - 1;
        const x = PAD.l + (i / (REVENUE_DATA.length - 1)) * cw;
        return (
          <text key={d} x={x} y={H - 8} textAnchor="middle"
            fill={C.textMuted} fontSize="11" fontFamily="Inter, sans-serif">
            Day {d}
          </text>
        );
      })}

      {/* Area fills */}
      <path d={buildArea(REVENUE_DATA, progress)} fill="url(#revGrad)" />
      <path d={buildArea(PROFIT_DATA, progress)} fill="url(#profGrad)" />

      {/* Lines */}
      <path d={buildPath(REVENUE_DATA, progress)} fill="none"
        stroke={C.gold} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={buildPath(PROFIT_DATA, progress)} fill="none"
        stroke={C.teal} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Legend */}
      <circle cx={PAD.l + 10} cy={PAD.t - 5} r="4" fill={C.gold} />
      <text x={PAD.l + 20} y={PAD.t - 1} fill={C.text} fontSize="12" fontFamily="Inter, sans-serif">Revenue</text>
      <circle cx={PAD.l + 100} cy={PAD.t - 5} r="4" fill={C.teal} />
      <text x={PAD.l + 110} y={PAD.t - 1} fill={C.text} fontSize="12" fontFamily="Inter, sans-serif">Profit</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */
function KpiCard({
  label, value, prefix='$', suffix='', change, changeUp, color, sparkData, delay
}: {
  label: string; value: number; prefix?: string; suffix?: string;
  change?: string; changeUp?: boolean; color: string;
  sparkData: number[]; delay: number;
}) {
  const counted = useCountUp(value, 1800, delay);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  const displayVal = prefix === '$' ? fmt(counted).replace('$','') : counted.toLocaleString();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 22px',
      flex: 1,
      minWidth: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: 1.2,
        textTransform: 'uppercase', margin: '0 0 10px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ color: C.text, fontSize: 26, fontWeight: 700, margin: 0,
            fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
            <span style={{ color: color, fontSize: 18, marginRight: 2 }}>{prefix}</span>
            {displayVal}{suffix}
          </p>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <span style={{
                color: changeUp ? C.green : C.red, fontSize: 12, fontWeight: 700,
                background: changeUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                padding: '2px 6px', borderRadius: 6,
              }}>
                {changeUp ? '↑' : '↓'} {change}
              </span>
            </div>
          )}
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANALYTICS CARD
───────────────────────────────────────────── */
interface AnalyticsCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  sub: string;
  trend: string;
  up: boolean;
  delay: number;
}

function AnalyticsCard({ label, value, icon, color, sub, trend, up, delay }: AnalyticsCardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
      border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -12, right: -12, width: 64, height: 64,
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: up ? C.green : C.red,
          background: (up ? C.green : C.red) + '20',
          padding: '2px 7px', borderRadius: 6,
        }}>{trend}</span>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800,
        fontFamily: 'Outfit, sans-serif', color: color }}>{value}</p>
      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: C.text }}>{label}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function FinancePage() {
  const [range, setRange] = useState('30D');
  const [chartProgress, setChartProgress] = useState(0);
  const [txnFilter, setTxnFilter] = useState('All');
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const animRef = useRef<number>(0);

  // Chart draw animation
  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setChartProgress(eased);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  function handleRefresh() {
    setSpinning(true);
    setChartProgress(0);
    setTimeout(() => {
      setSpinning(false);
      const start = performance.now();
      const duration = 1500;
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 2);
        setChartProgress(eased);
        if (t < 1) animRef.current = requestAnimationFrame(tick);
      }
      animRef.current = requestAnimationFrame(tick);
    }, 400);
  }

  const filteredTxns = txnFilter === 'All'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(t => t.type === txnFilter || t.status === txnFilter);

  const typeColor = (t: string) => ({
    Deposit: C.green, Withdrawal: C.orange, Bonus: C.purple, Adjustment: C.blue
  }[t] ?? C.text);

  const statusColor = (s: string) => ({
    Completed: C.green, Pending: C.yellow, Failed: C.red
  }[s] ?? C.text);

  const activeAlerts = RISK_ALERTS.filter((_, i) => !dismissedAlerts.includes(i));

  // Conic gradient for donut
  const conicGrad = `conic-gradient(${C.gold} 0% 68%, ${C.teal} 68% 100%)`;

  // Progress bar animate
  const [barProgress, setBarProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarProgress(1), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bgDeep}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bgDeep}; }
        ::-webkit-scrollbar-thumb { background: ${C.bgSurface}; border-radius: 3px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes blink { 0%,100% { background: rgba(239,68,68,0.2); } 50% { background: rgba(239,68,68,0.05); } }
        .txn-row:hover { background: rgba(244,196,48,0.06) !important; }
        .range-btn:hover { background: rgba(244,196,48,0.1) !important; }
        .filter-tab:hover { color: ${C.text} !important; }
        .dismiss-btn:hover { background: rgba(240,232,255,0.1) !important; }
        .action-btn:hover { opacity: 0.85; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.bgDeep,
        fontFamily: 'Inter, sans-serif', color: C.text,
        padding: '0 0 40px',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: `linear-gradient(180deg, ${C.bgSurface} 0%, rgba(37,18,64,0.95) 100%)`,
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: 'blur(12px)',
          padding: '0 32px',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', height: 64 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: C.bgDeep,
              }}>₦</div>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                  background: `linear-gradient(90deg, ${C.gold}, #ffe082)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  NEON PALACE
                </p>
                <p style={{ margin: 0, fontSize: 9, letterSpacing: 2.5, color: C.textMuted, fontWeight: 600 }}>
                  FINANCE DASHBOARD
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(168,137,247,0.15)', border: '1px solid rgba(168,137,247,0.4)', borderRadius: 8, padding: '4px 12px' }}>
                <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>DEMO STAFF PORTAL</span>
              </div>
            </div>

            {/* Range selector */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
              {['Today','7D','30D','YTD'].map(r => (
                <button key={r} className="range-btn"
                  onClick={() => setRange(r)}
                  style={{
                    padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                    background: range === r ? C.gold : 'transparent',
                    color: range === r ? C.bgDeep : C.textMuted,
                    transition: 'all 0.2s',
                  }}>{r}</button>
              ))}
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block',
                  animation: spinning ? 'spin 0.6s linear infinite' : undefined,
                  fontSize: 14,
                }}>🔄</span>
                <span>Just now</span>
              </div>
              <button className="action-btn" onClick={handleRefresh} style={{
                padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: 'rgba(244,196,48,0.08)', color: C.gold, cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'opacity 0.2s',
              }}>↻ Refresh</button>
              <button className="action-btn" style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                color: C.bgDeep, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'opacity 0.2s',
              }}>⬇ Export</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px 0' }}>

          {/* ── KPI CARDS ── */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <KpiCard label="Total Revenue" value={2847500} color={C.gold}
              change="12.4%" changeUp sparkData={REVENUE_DATA.slice(-8)} delay={0} />
            <KpiCard label="Total Deposits" value={4120000} color={C.teal}
              change="5.7%" changeUp sparkData={[310,280,340,295,360,330,390,355]} delay={100} />
            <KpiCard label="Total Withdrawals" value={1272500} color={C.orange}
              change="3.2%" changeUp={false} sparkData={[120,140,115,160,130,155,125,145]} delay={200} />
            <KpiCard label="Daily Profit" value={284750} color={C.green}
              change="8.1%" changeUp sparkData={[80,95,72,110,88,105,92,115]} delay={300} />
            <KpiCard label="Platform Balance" value={8472000} color={C.purple}
              change="2.9%" changeUp sparkData={[820,845,832,860,848,875,862,890]} delay={400} />
          </div>

          {/* ── MAIN CHART ── */}
          <div style={{
            background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '24px 24px 16px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                  color: C.text }}>Revenue & Profit Overview</h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>
                  Last 30 days • All amounts in USD
                </p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>Peak Revenue</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.gold }}>$460K</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>Avg Daily</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.teal }}>$313K</p>
                </div>
              </div>
            </div>
            <RevenueChart progress={chartProgress} />
          </div>

          {/* ── TWO COLUMNS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* LEFT: Deposit/Withdrawal Breakdown */}
            <div style={{
              background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
              border: `1px solid ${C.border}`, borderRadius: 20, padding: 24,
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700,
                fontFamily: 'Outfit, sans-serif', color: C.text }}>
                💰 Deposit / Withdrawal Breakdown
              </h3>

              {/* Donut Chart */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 24 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: conicGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${C.gold}33`,
                  }}>
                    <div style={{
                      width: 76, height: 76, borderRadius: '50%',
                      background: C.bgCard,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.gold }}>68%</p>
                      <p style={{ margin: 0, fontSize: 9, color: C.textMuted }}>Deposits</p>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: 'Deposits', val: '$4.12M', pct: 68, color: C.gold },
                    { label: 'Withdrawals', val: '$1.27M', pct: 32, color: C.teal },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.val} ({item.pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(240,232,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                          width: `${barProgress * item.pct}%`,
                          transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: C.textMuted,
                letterSpacing: 1, textTransform: 'uppercase' }}>Payment Methods</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'rgba(240,232,255,0.04)',
                    border: `1px solid ${C.borderFaint}`,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pm.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: C.text }}>{pm.name}</span>
                    <div style={{ width: 80, height: 4, background: 'rgba(240,232,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: pm.color,
                        width: `${barProgress * pm.pct}%`,
                        transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pm.color, minWidth: 34, textAlign: 'right' }}>
                      {pm.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Risk Alerts */}
            <div style={{
              background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
              border: `1px solid ${C.border}`, borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif', color: C.text }}>Risk Alerts</h3>
                </div>
                <div style={{
                  background: C.red, color: '#fff', borderRadius: 20,
                  padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  animation: activeAlerts.some(a => a.level === 'HIGH') ? 'pulse 2s infinite' : undefined,
                }}>
                  {activeAlerts.length} Active
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RISK_ALERTS.map((alert, i) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: dismissedAlerts.includes(i) ? 'rgba(240,232,255,0.02)' : alert.bg,
                    border: `1px solid ${dismissedAlerts.includes(i) ? C.borderFaint : alert.color + '44'}`,
                    borderRadius: 12,
                    opacity: dismissedAlerts.includes(i) ? 0.35 : 1,
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{alert.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: 1,
                            color: alert.color, padding: '1px 6px', borderRadius: 4,
                            border: `1px solid ${alert.color}66`,
                          }}>{alert.level}</span>
                          <span style={{ fontSize: 10, color: C.textMuted }}>{alert.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.4 }}>{alert.msg}</p>
                      </div>
                      <button className="dismiss-btn"
                        onClick={() => setDismissedAlerts(prev => [...prev, i])}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: C.textMuted, fontSize: 14, padding: '2px 6px',
                          borderRadius: 4, flexShrink: 0,
                          transition: 'background 0.2s',
                        }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── TRANSACTION TABLE ── */}
          <div style={{
            background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgSurface} 100%)`,
            border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif', color: C.text }}>Transaction History</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textMuted }}>
                  Showing {filteredTxns.length} transactions
                </p>
              </div>
              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
                {['All','Deposit','Withdrawal','Bonus','Adjustment'].map(f => (
                  <button key={f} className="filter-tab"
                    onClick={() => setTxnFilter(f)}
                    style={{
                      padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      background: txnFilter === f ? C.bgSurface : 'transparent',
                      color: txnFilter === f ? C.gold : C.textMuted,
                      transition: 'all 0.2s',
                    }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.borderFaint}` }}>
                    {['TXN ID','Player','Type','Amount','Method','KYC','Risk','IP','Status','Time'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 10px',
                        fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
                        color: C.textMuted, textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map((txn, i) => (
                    <tr key={txn.id} className="txn-row"
                      style={{
                        borderBottom: `1px solid ${C.borderFaint}`,
                        transition: 'background 0.15s',
                        background: 'transparent',
                        cursor: 'pointer',
                        animationDelay: `${i * 40}ms`,
                      }}>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: C.textMuted,
                        fontFamily: 'monospace' }}>{txn.id}</td>
                      <td style={{ padding: '9px 10px', fontSize: 12, fontWeight: 600, color: C.text }}>
                        {txn.player}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                          color: typeColor(txn.type),
                          background: typeColor(txn.type) + '22',
                        }}>{txn.type}</span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, fontWeight: 700, 
                        color: txn.amount > 0 ? C.green : C.red }}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 12, color: C.textMuted }}>
                        {txn.method}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          color: txn.kycLevel === 3 ? C.green : txn.kycLevel === 2 ? C.gold : C.red,
                          background: txn.kycLevel === 3 ? 'rgba(34,197,94,0.15)' : txn.kycLevel === 2 ? 'rgba(244,196,48,0.15)' : 'rgba(239,68,68,0.15)',
                        }}>L{txn.kycLevel}</span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          color: txn.riskScore > 30 ? C.red : txn.riskScore > 15 ? C.orange : C.green,
                          background: txn.riskScore > 30 ? 'rgba(239,68,68,0.15)' : txn.riskScore > 15 ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
                        }}>{txn.riskScore}</span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>
                        {txn.ip}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                          color: statusColor(txn.status),
                          background: statusColor(txn.status) + '22',
                        }}>{txn.status}</span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: 11, color: C.textMuted }}>
                        {txn.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {[1,2,3,4,5].map(p => (
                <div key={p} style={{
                  width: p === 1 ? 24 : 8, height: 8, borderRadius: 4,
                  background: p === 1 ? C.gold : 'rgba(240,232,255,0.15)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>

          {/* ── ANALYTICS BOTTOM ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Average Deposit', value: '$342', icon: '💳', color: C.gold, sub: 'per transaction', trend: '+4.2%', up: true },
              { label: 'Avg Withdrawal Time', value: '4.2 min', icon: '⚡', color: C.teal, sub: 'processing speed', trend: '-12%', up: true },
              { label: 'Conversion Rate', value: '23.4%', icon: '📈', color: C.green, sub: 'visitor to player', trend: '+1.8%', up: true },
              { label: 'Active Bonuses', value: '1,247', icon: '🎁', color: C.purple, sub: 'currently running', trend: '+89', up: true },
            ].map((card, i) => (
              <AnalyticsCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                sub={card.sub}
                trend={card.trend}
                up={card.up}
                delay={600 + i * 100}
              />
            ))}
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.borderFaint}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted }}>
              © 2026 Neon Palace Gaming Ltd. • Finance Module v3.1.0 • All data is illustrative
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['GGR Report', 'Player Analysis', 'Compliance', 'Audit Log'].map(link => (
                <span key={link} style={{ fontSize: 11, color: C.textMuted, cursor: 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3 }}>{link}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
