'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyRow { day: string; bets: number; wins: number; ggr: number; sessions: number }
interface GameRow { gameType: string; bets: number; wins: number; ggr: number; sessions: number; rtp: string }
interface PlayerRow { userId: string; username: string; bets: number; wins: number; ggr: number; sessions: number }
interface Summary { totalBets: string; totalWins: string; ggr: string; ngr: string; rtp: string; totalSessions: number; totalWallets: number }
interface ReportData { summary: Summary; daily: DailyRow[]; games: GameRow[]; players: PlayerRow[]; from: string; to: string }

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_DAILY: DailyRow[] = [
  { day: '2026-06-24', bets: 182400, wins: 175000, ggr: 7400, sessions: 3120 },
  { day: '2026-06-25', bets: 219800, wins: 210200, ggr: 9600, sessions: 3840 },
  { day: '2026-06-26', bets: 196300, wins: 187900, ggr: 8400, sessions: 3410 },
  { day: '2026-06-27', bets: 258700, wins: 248100, ggr: 10600, sessions: 4520 },
  { day: '2026-06-28', bets: 243900, wins: 233800, ggr: 10100, sessions: 4270 },
  { day: '2026-06-29', bets: 287400, wins: 275000, ggr: 12400, sessions: 5010 },
  { day: '2026-06-30', bets: 284200, wins: 272200, ggr: 12000, sessions: 4960 },
];
const DEMO_GAMES: GameRow[] = [
  { gameType: 'neon-palace-slots', bets: 843200, wins: 815900, ggr: 27300, sessions: 14820, rtp: '96.76' },
  { gameType: 'cyber-roulette',    bets: 614500, wins: 596300, ggr: 18200, sessions: 10940, rtp: '97.04' },
  { gameType: 'gold-rush-crash',   bets: 558000, wins: 535000, ggr: 23000, sessions: 9870,  rtp: '95.88' },
  { gameType: 'royal-blackjack',   bets: 483100, wins: 478700, ggr: 4400,  sessions: 8420,  rtp: '99.09' },
  { gameType: 'dice-fever',        bets: 321000, wins: 308400, ggr: 12600, sessions: 5630,  rtp: '96.07' },
  { gameType: 'instant-gems',      bets: 247500, wins: 236400, ggr: 11100, sessions: 4280,  rtp: '95.51' },
];
const DEMO_PLAYERS: PlayerRow[] = [
  { userId: '1', username: 'velvet_king',   bets: 892000, wins: 851200, ggr: 40800, sessions: 4820 },
  { userId: '2', username: 'neon_phoenix',  bets: 398500, wins: 380100, ggr: 18400, sessions: 2160 },
  { userId: '3', username: 'ace_king99',    bets: 284100, wins: 270900, ggr: 13200, sessions: 1540 },
  { userId: '4', username: 'vortex_x',      bets: 167800, wins: 159500, ggr: 8300,  sessions: 910  },
  { userId: '5', username: 'cyber_rider',   bets: 112900, wins: 107500, ggr: 5400,  sessions: 620  },
  { userId: '6', username: 'midnight_rose', bets: 98400,  wins: 93700,  ggr: 4700,  sessions: 540  },
  { userId: '7', username: 'quantum_rush',  bets: 67400,  wins: 64200,  ggr: 3200,  sessions: 370  },
  { userId: '8', username: 'dark_knight',   bets: 45200,  wins: 43100,  ggr: 2100,  sessions: 250  },
  { userId: '9', username: 'lucky_blaze',   bets: 23100,  wins: 22000,  ggr: 1100,  sessions: 130  },
  { userId: '10', username: 'silver_storm', bets: 12300,  wins: 11700,  ggr: 600,   sessions: 70   },
];
const DEMO_SUMMARY: Summary = {
  totalBets: '1672700.00', totalWins: '1602300.00', ggr: '70400.00',
  ngr: '59840.00', rtp: '95.79', totalSessions: 29130, totalWallets: 48291,
};
const DEMO_DATA: ReportData = {
  summary: DEMO_SUMMARY, daily: DEMO_DAILY,
  games: DEMO_GAMES, players: DEMO_PLAYERS,
  from: '2026-06-24T00:00:00.000Z', to: '2026-06-30T23:59:59.999Z',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

function fmt(n: number | string, dec = 0): string {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function vcoin(n: number | string, dec = 0): string {
  return `${fmt(n, dec)} VC`;
}

function formatGameName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function exportCsv(data: ReportData) {
  const rows = [
    ['Date', 'Total Bets (VC)', 'Total Wins (VC)', 'GGR (VC)', 'Sessions'],
    ...data.daily.map(r => [r.day, r.bets, r.wins, r.ggr, r.sessions]),
    [],
    ['Game', 'Bets (VC)', 'Wins (VC)', 'GGR (VC)', 'RTP %', 'Sessions'],
    ...data.games.map(r => [formatGameName(r.gameType), r.bets, r.wins, r.ggr, r.rtp, r.sessions]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `finance-report-${data.from.split('T')[0]}-to-${data.to.split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color, icon, warn }: { label: string; value: string; sub?: string; color: string; icon: string; warn?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: '#251240', borderRadius: 16, padding: 24, border: `1px solid ${hov ? color : 'rgba(244,196,48,0.1)'}`, boxShadow: hov ? `0 0 30px ${color}33` : '0 4px 24px rgba(0,0,0,0.4)', transition: 'all 0.3s', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#a08bc0', fontSize: 12, fontWeight: 500, margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
          <h2 style={{ color: warn ? '#ff2d78' : '#f0e8ff', fontSize: 28, fontWeight: 700, margin: '8px 0 0', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>{value}</h2>
          {sub && <p style={{ color: '#a08bc0', fontSize: 12, margin: '6px 0 0' }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `1px solid ${color}44`, flexShrink: 0, marginLeft: 12 }}>{icon}</div>
      </div>
    </div>
  );
}

function MiniLineChart({ data, color }: { data: { day: string; value: number }[]; color: string }) {
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const W = 300; const H = 120;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (W - 20) + 10;
    const y = H - 20 - ((d.value - min) / range) * (H - 40);
    return `${x},${y}`;
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts.join(' ')} />
      <polygon fill="url(#areaGrad)" points={`10,${H - 20} ${pts.join(' ')} ${(data.length - 1) / (data.length - 1) * (W - 20) + 10},${H - 20}`} />
      {data.map((d, i) => {
        const [x, y] = pts[i]!.split(',').map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={hovIdx === i ? 6 : 4} fill={hovIdx === i ? color : '#251240'} stroke={color} strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} />
            {hovIdx === i && (
              <g>
                <rect x={x - 54} y={y - 36} width={108} height={28} rx={6} fill="#0d0618" stroke={color} strokeWidth="1" />
                <text x={x} y={y - 18} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
                  {fmt(d.value)} VC • {d.day.slice(5)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function RtpMeter({ rtp }: { rtp: number }) {
  const color = rtp >= 97 ? '#ff2d78' : rtp >= 96 ? '#f4c430' : '#4ade80';
  const label = rtp >= 97 ? 'HIGH — Monitor' : rtp >= 95 ? 'Normal' : 'LOW — Alert';
  return (
    <div style={{ padding: '20px 24px', background: '#1a0d30', borderRadius: 12, border: `1px solid ${color}44` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#a08bc0', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Platform RTP</span>
        <span style={{ color, fontSize: 12, fontWeight: 700, background: `${color}22`, padding: '2px 10px', borderRadius: 6 }}>{label}</span>
      </div>
      <div style={{ fontSize: 42, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{rtp.toFixed(2)}%</div>
      <div style={{ marginTop: 12, background: 'rgba(240,232,255,0.08)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(rtp, 100)}%`, height: '100%', background: `linear-gradient(90deg, #4ade80, ${color})`, borderRadius: 8, transition: 'width 1s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ color: '#6b5a8a', fontSize: 11 }}>90%</span>
        <span style={{ color: '#6b5a8a', fontSize: 11 }}>100%</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(toISODate(sevenDaysAgo));
  const [toDate, setToDate] = useState(toISODate(today));
  const [data, setData] = useState<ReportData>(DEMO_DATA);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeNav] = useState('Reports');
  const [notifOpen, setNotifOpen] = useState(false);
  const [gameSort, setGameSort] = useState<'bets' | 'ggr' | 'rtp' | 'sessions'>('bets');
  const [playerSort, setPlayerSort] = useState<'bets' | 'ggr' | 'sessions'>('bets');
  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const fetchReport = useCallback(async (from: string, to: string) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reports/finance?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && mountedRef.current) {
        const json = await res.json() as ReportData;
        setData(json);
        setIsDemo(false);
      }
    } catch { /* keep demo data */ }
    finally { if (mountedRef.current) setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(fromDate, toDate); }, [fetchReport, fromDate, toDate]);

  const navItems = ['Dashboard', 'Players', 'Games', 'Finance', 'Reports', 'Settings'];
  const s = data.summary;
  const ggrNum = parseFloat(s.ggr);
  const rtpNum = parseFloat(s.rtp);
  const sortedGames = [...data.games].sort((a, b) => b[gameSort === 'rtp' ? 'wins' : gameSort] - a[gameSort === 'rtp' ? 'wins' : gameSort]);
  const sortedPlayers = [...data.players].sort((a, b) => b[playerSort] - a[playerSort]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0618; font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(0,212,200,0.6)} 50%{opacity:.7;transform:scale(1.2);box-shadow:0 0 0 6px rgba(0,212,200,0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(255,45,120,.6)} 50%{box-shadow:0 0 0 6px rgba(255,45,120,0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d0618; }
        ::-webkit-scrollbar-thumb { background: #3d2060; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #f4c430; }
        input[type=date] { color-scheme: dark; }
        @media (max-width: 1000px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0d0618', backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(37,18,64,.8) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(0,212,200,.05) 0%,transparent 40%)', fontFamily: "'Inter',sans-serif", color: '#f0e8ff', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,rgba(244,196,48,.08) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,6,24,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(244,196,48,.15)', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 32px rgba(0,0,0,.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '.05em', background: 'linear-gradient(135deg,#f4c430,#ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>♠ NEON PALACE ADMIN</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {navItems.map(item => (
                <button key={item} onClick={() => {
                  if (item === 'Players') { router.push('/admin/players'); return; }
                  if (item === 'Dashboard') { router.push('/admin'); return; }
                  if (item === 'Reports') return;
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeNav === item ? '#f4c430' : '#a08bc0', fontSize: 14, fontWeight: 600, padding: '6px 14px', borderRadius: 8, fontFamily: "'Inter',sans-serif", transition: 'color .2s', borderBottom: activeNav === item ? '2px solid #f4c430' : '2px solid transparent' }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,45,120,.15)', border: '1px solid rgba(255,45,120,.4)', borderRadius: 8, padding: '4px 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2d78', display: 'inline-block', animation: 'blink 1.2s infinite' }} />
              <span style={{ color: '#ff2d78', fontSize: 12, fontWeight: 700, letterSpacing: '.1em' }}>LIVE</span>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifOpen(!notifOpen)}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,232,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid rgba(240,232,255,.1)' }}>🔔</div>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff2d78', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseRed 2s infinite' }}>3</span>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 48, right: 0, background: '#1a0d30', border: '1px solid rgba(244,196,48,.2)', borderRadius: 12, padding: 12, width: 260, zIndex: 200, boxShadow: '0 16px 40px rgba(0,0,0,.6)' }}>
                  {['Daily revenue report ready', 'RTP spike on Royal Blackjack', 'Weekly export available'].map((n, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 8, color: '#f0e8ff', fontSize: 13, borderBottom: i < 2 ? '1px solid rgba(240,232,255,.05)' : 'none', cursor: 'pointer' }}>
                      <span style={{ color: '#f4c430', marginRight: 8 }}>●</span>{n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(240,232,255,.05)', border: '1px solid rgba(240,232,255,.1)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f4c430,#ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0d0618' }}>SA</div>
              <div><div style={{ color: '#f0e8ff', fontSize: 13, fontWeight: 600 }}>System Admin</div><div style={{ color: '#a08bc0', fontSize: 11 }}>Super Admin</div></div>
            </div>
          </div>
        </nav>

        <main style={{ padding: '32px', maxWidth: 1600, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 28, animation: 'slideUp .5s ease forwards', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit',sans-serif", margin: 0 }}>Financial Reports</h1>
              <p style={{ color: '#a08bc0', fontSize: 14, marginTop: 4 }}>
                Revenue analytics, GGR/NGR breakdown, RTP monitoring
                {isDemo && <span style={{ marginLeft: 12, background: '#f4c43022', color: '#f4c430', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>DEMO DATA</span>}
              </p>
            </div>
            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#251240', border: '1px solid rgba(244,196,48,.2)', borderRadius: 12, padding: '8px 16px' }}>
                <span style={{ color: '#a08bc0', fontSize: 13 }}>From</span>
                <input type="date" value={fromDate} max={toDate} onChange={e => setFromDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0e8ff', fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer' }} />
                <span style={{ color: '#a08bc0', fontSize: 13 }}>To</span>
                <input type="date" value={toDate} min={fromDate} max={toISODate(today)} onChange={e => setToDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0e8ff', fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer' }} />
                {loading && <div style={{ width: 14, height: 14, border: '2px solid #f4c43044', borderTopColor: '#f4c430', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
              </div>
              <button onClick={() => exportCsv(data)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f4c430,#ff8c00)', border: 'none', color: '#0d0618', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                ⬇ Export CSV
              </button>
            </div>
          </div>

          {/* KPI ROW 1 */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap', animation: 'slideUp .5s ease .1s both' }}>
            <MetricCard label="Total Bets" value={`${fmt(parseFloat(s.totalBets))} VC`} sub={`${fmt(s.totalSessions)} spins`} color="#00d4c8" icon="🎲" />
            <MetricCard label="Total Wins Paid" value={`${fmt(parseFloat(s.totalWins))} VC`} color="#a855f7" icon="🏆" />
            <MetricCard label="Gross Gaming Revenue" value={`${fmt(ggrNum)} VC`} sub={`${((ggrNum / parseFloat(s.totalBets)) * 100).toFixed(2)}% margin`} color="#f4c430" icon="💰" />
            <MetricCard label="Net Gaming Revenue" value={`${fmt(parseFloat(s.ngr))} VC`} sub="After 15% operator cost" color="#4ade80" icon="📈" />
          </div>

          {/* KPI ROW 2 */}
          <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 28, animation: 'slideUp .5s ease .2s both' }}>
            {/* Chart */}
            <div style={{ background: '#251240', borderRadius: 16, padding: 24, border: '1px solid rgba(244,196,48,.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Daily GGR</h3>
                  <p style={{ color: '#a08bc0', fontSize: 13, margin: '4px 0 0' }}>Gross Gaming Revenue per day</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ label: 'Bets', color: '#00d4c8' }, { label: 'GGR', color: '#f4c430' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                      <span style={{ color: '#a08bc0', fontSize: 12 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dual line chart */}
              <div style={{ position: 'relative' }}>
                <MiniLineChart data={data.daily.map(d => ({ day: d.day, value: d.bets }))} color="#00d4c8" />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  <MiniLineChart data={data.daily.map(d => ({ day: d.day, value: d.ggr }))} color="#f4c430" />
                </div>
              </div>
              {/* Bar chart underneath */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, height: 60, alignItems: 'flex-end' }}>
                {data.daily.map((d, i) => {
                  const maxBet = Math.max(...data.daily.map(x => x.bets));
                  const pct = maxBet > 0 ? (d.bets / maxBet) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: `${pct * 100}%`, background: 'linear-gradient(180deg,#00d4c8,#0099aa)', borderRadius: '4px 4px 0 0', minHeight: 4, opacity: 0.7 }} />
                      <span style={{ color: '#6b5a8a', fontSize: 10 }}>{d.day.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RTP + Deposits/Withdrawals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <RtpMeter rtp={rtpNum} />
              <div style={{ background: '#251240', borderRadius: 16, padding: 20, border: '1px solid rgba(244,196,48,.1)', flex: 1 }}>
                <h3 style={{ color: '#f0e8ff', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Financial KPIs</h3>
                {[
                  { label: 'Active Wallets', value: fmt(s.totalWallets), color: '#00d4c8' },
                  { label: 'Total Sessions', value: fmt(s.totalSessions), color: '#a855f7' },
                  { label: 'Avg Bet / Session', value: vcoin(s.totalSessions > 0 ? parseFloat(s.totalBets) / s.totalSessions : 0, 1), color: '#f4c430' },
                  { label: 'Avg GGR / Session', value: vcoin(s.totalSessions > 0 ? ggrNum / s.totalSessions : 0, 2), color: '#4ade80' },
                  { label: 'GGR Margin', value: `${((ggrNum / parseFloat(s.totalBets)) * 100).toFixed(2)}%`, color: '#ff8c00' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(240,232,255,.05)' }}>
                    <span style={{ color: '#a08bc0', fontSize: 13 }}>{row.label}</span>
                    <span style={{ color: row.color, fontSize: 13, fontWeight: 700 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GAME PERFORMANCE TABLE */}
          <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,.1)', overflow: 'hidden', marginBottom: 24, animation: 'slideUp .5s ease .3s both' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Game Performance</h3>
                <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Revenue breakdown by game</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['bets', 'ggr', 'rtp', 'sessions'] as const).map(col => (
                  <button key={col} onClick={() => setGameSort(col)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: gameSort === col ? '#f4c430' : 'rgba(240,232,255,.07)', color: gameSort === col ? '#0d0618' : '#a08bc0', transition: 'all .2s' }}>
                    {col === 'rtp' ? 'RTP' : col.charAt(0).toUpperCase() + col.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Game', 'Total Bets (VC)', 'Total Wins (VC)', 'GGR (VC)', 'RTP %', 'Sessions', 'Margin'].map(col => (
                      <th key={col} style={{ padding: '12px 20px', textAlign: 'left', color: '#a08bc0', fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedGames.map((g, i) => {
                    const margin = g.bets > 0 ? ((g.ggr / g.bets) * 100) : 0;
                    const rtpN = parseFloat(g.rtp);
                    const rtpColor = rtpN >= 98 ? '#ff2d78' : rtpN >= 96 ? '#f4c430' : '#4ade80';
                    return (
                      <tr key={g.gameType} style={{ background: i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent', transition: 'background .2s', cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,196,48,.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent')}>
                        <td style={{ padding: '13px 20px', color: '#f0e8ff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{formatGameName(g.gameType)}</td>
                        <td style={{ padding: '13px 20px', color: '#00d4c8', fontWeight: 600, fontSize: 14 }}>{fmt(g.bets)}</td>
                        <td style={{ padding: '13px 20px', color: '#a855f7', fontWeight: 600, fontSize: 14 }}>{fmt(g.wins)}</td>
                        <td style={{ padding: '13px 20px', color: '#f4c430', fontWeight: 700, fontSize: 14 }}>{fmt(g.ggr)}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ color: rtpColor, fontWeight: 700, fontSize: 14 }}>{g.rtp}%</span>
                        </td>
                        <td style={{ padding: '13px 20px', color: '#f0e8ff', fontSize: 14 }}>{fmt(g.sessions)}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ background: 'rgba(240,232,255,.08)', borderRadius: 4, height: 6, width: 60, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(margin * 10, 100)}%`, height: '100%', background: '#f4c430', borderRadius: 4 }} />
                            </div>
                            <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 600 }}>{margin.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP PLAYER SPENDERS */}
          <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(168,85,247,.15)', overflow: 'hidden', animation: 'slideUp .5s ease .4s both' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Top Player Spenders</h3>
                <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Highest volume players in the period</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['bets', 'ggr', 'sessions'] as const).map(col => (
                  <button key={col} onClick={() => setPlayerSort(col)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: playerSort === col ? '#a855f7' : 'rgba(240,232,255,.07)', color: playerSort === col ? '#fff' : '#a08bc0', transition: 'all .2s' }}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Player', 'Total Bets (VC)', 'Total Wins (VC)', 'GGR Contribution (VC)', 'Sessions'].map(col => (
                      <th key={col} style={{ padding: '12px 20px', textAlign: 'left', color: '#a08bc0', fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((p, i) => (
                    <tr key={p.userId} style={{ background: i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent', transition: 'background .2s', cursor: 'default' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent')}>
                      <td style={{ padding: '13px 20px', color: i < 3 ? '#f4c430' : '#6b5a8a', fontWeight: 700, fontSize: 14 }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td style={{ padding: '13px 20px', color: '#f0e8ff', fontWeight: 600, fontSize: 14 }}>{p.username}</td>
                      <td style={{ padding: '13px 20px', color: '#00d4c8', fontWeight: 600, fontSize: 14 }}>{fmt(p.bets)}</td>
                      <td style={{ padding: '13px 20px', color: '#a855f7', fontWeight: 600, fontSize: 14 }}>{fmt(p.wins)}</td>
                      <td style={{ padding: '13px 20px', color: '#f4c430', fontWeight: 700, fontSize: 14 }}>{fmt(p.ggr)}</td>
                      <td style={{ padding: '13px 20px', color: '#f0e8ff', fontSize: 14 }}>{fmt(p.sessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(240,232,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14, background: 'linear-gradient(135deg,#f4c430,#ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>♠ NEON PALACE</span>
              <span style={{ color: '#6b5a8a', fontSize: 13 }}>Admin Panel v2.4.1</span>
            </div>
            <div style={{ color: '#6b5a8a', fontSize: 12 }}>© 2026 Neon Palace Gaming. All rights reserved.</div>
          </footer>
        </main>
      </div>
    </>
  );
}
