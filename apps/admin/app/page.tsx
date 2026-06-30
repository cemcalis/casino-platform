'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KpiCard {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: string;
  changePositive: boolean;
  color: string;
  icon: string;
  live?: boolean;
}

interface Game {
  name: string;
  players: number;
  revenue: string;
  rtp: string;
  status: string;
  hot?: boolean;
}

interface Session {
  initials: string;
  username: string;
  game: string;
  bet: string;
  duration: string;
  color: string;
}

interface Player {
  id: string;
  username: string;
  flag: string;
  balance: string;
  totalBet: string;
  status: 'Active' | 'VIP' | 'Suspended';
}

interface ActivityItem {
  type: 'login' | 'win' | 'deposit' | 'withdrawal' | 'flag';
  message: string;
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const GAMES: Game[] = [
  { name: 'Neon Palace Slots', players: 3842, revenue: '$84,291', rtp: '96.8%', status: 'Active', hot: true },
  { name: 'Cyber Roulette', players: 2194, revenue: '$61,450', rtp: '97.1%', status: 'Active' },
  { name: 'Gold Rush Crash', players: 1987, revenue: '$55,820', rtp: '95.9%', status: 'Active' },
  { name: 'Royal Blackjack', players: 1654, revenue: '$48,310', rtp: '99.2%', status: 'Active' },
  { name: 'Dice Fever', players: 1203, revenue: '$32,100', rtp: '96.4%', status: 'Active' },
  { name: 'Instant Gems', players: 984, revenue: '$24,750', rtp: '95.5%', status: 'Maintenance' },
  { name: 'Dragon Fortune', players: 876, revenue: '$21,880', rtp: '97.3%', status: 'Active' },
  { name: 'Lucky Sevens', players: 741, revenue: '$18,200', rtp: '96.1%', status: 'Active' },
];

const SESSIONS: Session[] = [
  { initials: 'AK', username: 'ace_king99', game: 'Neon Palace Slots', bet: '$250', duration: '42m', color: '#f4c430' },
  { initials: 'MR', username: 'midnight_rose', game: 'Cyber Roulette', bet: '$500', duration: '1h 12m', color: '#00d4c8' },
  { initials: 'VX', username: 'vortex_x', game: 'Gold Rush Crash', bet: '$1,200', duration: '18m', color: '#ff2d78' },
  { initials: 'DK', username: 'dark_knight', game: 'Royal Blackjack', bet: '$800', duration: '2h 5m', color: '#a855f7' },
  { initials: 'SS', username: 'silver_storm', game: 'Dice Fever', bet: '$150', duration: '33m', color: '#00d4c8' },
  { initials: 'NP', username: 'neon_phoenix', game: 'Dragon Fortune', bet: '$350', duration: '55m', color: '#f4c430' },
  { initials: 'QR', username: 'quantum_rush', game: 'Neon Palace Slots', bet: '$100', duration: '1h 28m', color: '#ff2d78' },
  { initials: 'LB', username: 'lucky_blaze', game: 'Lucky Sevens', bet: '$200', duration: '7m', color: '#a855f7' },
  { initials: 'CR', username: 'cyber_rider', game: 'Cyber Roulette', bet: '$600', duration: '48m', color: '#f4c430' },
  { initials: 'VK', username: 'velvet_king', game: 'Royal Blackjack', bet: '$2,000', duration: '3h 10m', color: '#00d4c8' },
  { initials: 'FB', username: 'fire_bolt', game: 'Gold Rush Crash', bet: '$450', duration: '22m', color: '#ff2d78' },
  { initials: 'ZX', username: 'zenith_x', game: 'Dragon Fortune', bet: '$750', duration: '1h 40m', color: '#a855f7' },
];

const PLAYERS: Player[] = [
  { id: '#P-00192', username: 'ace_king99', flag: '🇺🇸', balance: '$12,480', totalBet: '$284,100', status: 'VIP' },
  { id: '#P-00204', username: 'midnight_rose', flag: '🇬🇧', balance: '$3,240', totalBet: '$98,400', status: 'Active' },
  { id: '#P-00218', username: 'vortex_x', flag: '🇩🇪', balance: '$8,910', totalBet: '$167,800', status: 'VIP' },
  { id: '#P-00231', username: 'dark_knight', flag: '🇫🇷', balance: '$540', totalBet: '$45,200', status: 'Active' },
  { id: '#P-00245', username: 'silver_storm', flag: '🇧🇷', balance: '$0', totalBet: '$12,300', status: 'Suspended' },
  { id: '#P-00259', username: 'neon_phoenix', flag: '🇯🇵', balance: '$21,000', totalBet: '$398,500', status: 'VIP' },
  { id: '#P-00267', username: 'quantum_rush', flag: '🇦🇺', balance: '$1,890', totalBet: '$67,400', status: 'Active' },
  { id: '#P-00281', username: 'lucky_blaze', flag: '🇨🇦', balance: '$420', totalBet: '$23,100', status: 'Active' },
  { id: '#P-00294', username: 'cyber_rider', flag: '🇰🇷', balance: '$5,600', totalBet: '$112,900', status: 'Active' },
  { id: '#P-00301', username: 'velvet_king', flag: '🇦🇪', balance: '$48,200', totalBet: '$892,000', status: 'VIP' },
];

const ACTIVITY: ActivityItem[] = [
  { type: 'win', message: 'ace_king99 won $4,820 on Neon Palace Slots', time: '12s ago' },
  { type: 'deposit', message: 'velvet_king deposited $10,000', time: '45s ago' },
  { type: 'login', message: 'neon_phoenix logged in from 🇯🇵 Tokyo', time: '1m ago' },
  { type: 'withdrawal', message: 'midnight_rose requested $2,500 withdrawal', time: '2m ago' },
  { type: 'win', message: 'vortex_x won $12,400 on Gold Rush Crash', time: '3m ago' },
  { type: 'flag', message: 'silver_storm flagged for suspicious activity', time: '4m ago' },
  { type: 'deposit', message: 'dark_knight deposited $1,000', time: '5m ago' },
  { type: 'login', message: 'cyber_rider logged in from 🇰🇷 Seoul', time: '6m ago' },
  { type: 'win', message: 'quantum_rush won $880 on Royal Blackjack', time: '8m ago' },
  { type: 'withdrawal', message: 'lucky_blaze requested $500 withdrawal', time: '9m ago' },
  { type: 'deposit', message: 'fire_bolt deposited $3,000', time: '11m ago' },
  { type: 'login', message: 'zenith_x logged in from 🇮🇳 Mumbai', time: '13m ago' },
  { type: 'win', message: 'velvet_king won $28,000 on Royal Blackjack', time: '15m ago' },
  { type: 'flag', message: 'unknown_user flagged for bot behavior', time: '18m ago' },
  { type: 'deposit', message: 'new_player joined and deposited $200', time: '22m ago' },
];

const CHART_DATA = [
  { day: 'Mon', value: 180000 },
  { day: 'Tue', value: 220000 },
  { day: 'Wed', value: 195000 },
  { day: 'Thu', value: 260000 },
  { day: 'Fri', value: 240000 },
  { day: 'Sat', value: 285000 },
  { day: 'Sun', value: 284000 },
];

const MAX_CHART = 300000;

const KPI_CARDS: KpiCard[] = [
  { label: 'Total Players', value: 48291, change: '+12.3%', changePositive: true, color: '#f4c430', icon: '👥' },
  { label: 'Online Now', value: 1847, change: 'LIVE', changePositive: true, color: '#00d4c8', icon: '🟢', live: true },
  { label: 'Revenue Today', value: 284750, prefix: '$', change: '+8.1%', changePositive: true, color: '#ff2d78', icon: '💰' },
  { label: 'Platform RTP', value: 96.2, suffix: '%', change: 'Stable', changePositive: true, color: '#a855f7', icon: '🎯' },
];

function useCountUp(target: number, duration = 1800, delay = 0, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(parseFloat((eased * target).toFixed(decimals)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay, decimals]);
  return count;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCounter({ card, delay }: { card: KpiCard; delay: number }) {
  const decimals = card.suffix === '%' ? 1 : 0;
  const count = useCountUp(card.value, 1800, delay, decimals);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const fmt = (n: number) => {
    if (card.suffix === '%') return n.toFixed(1);
    if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return n.toString();
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#251240',
        borderRadius: 16,
        padding: '24px',
        border: `1px solid ${hovered ? card.color : 'rgba(244,196,48,0.1)'}`,
        boxShadow: hovered ? `0 0 30px ${card.color}33` : '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        cursor: 'default',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#a08bc0', fontSize: 13, fontWeight: 500, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{card.label}</p>
          <h2 style={{ color: '#f0e8ff', fontSize: 32, fontWeight: 700, margin: '8px 0 0', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
            {card.prefix}{fmt(count)}{card.suffix}
          </h2>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${card.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          border: `1px solid ${card.color}44`,
        }}>
          {card.icon}
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        {card.live && (
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#00d4c8', animation: 'pulse 1.5s infinite' }} />
        )}
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: card.changePositive ? (card.live ? '#00d4c8' : '#4ade80') : '#ff2d78',
          background: card.changePositive ? (card.live ? '#00d4c822' : '#4ade8022') : '#ff2d7822',
          padding: '2px 8px', borderRadius: 6,
        }}>
          {card.change}
        </span>
        {!card.live && <span style={{ color: '#a08bc0', fontSize: 12 }}>vs yesterday</span>}
      </div>
    </div>
  );
}

function BarChart({ animated }: { animated: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = MAX_CHART;

  return (
    <div style={{ padding: '24px', background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ color: '#f0e8ff', fontSize: 18, fontWeight: 700, margin: 0 }}>Revenue (Last 7 Days)</h3>
          <p style={{ color: '#a08bc0', fontSize: 13, margin: '4px 0 0' }}>Daily platform revenue in USD</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1W', '1M', '3M'].map((t, i) => (
            <button key={t} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: i === 0 ? '#f4c430' : 'rgba(240,232,255,0.07)',
              color: i === 0 ? '#0d0618' : '#a08bc0', fontWeight: 600, fontSize: 13,
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '0 8px' }}>
        {CHART_DATA.map((d, i) => {
          const pct = d.value / maxVal;
          const isHov = hoveredIdx === i;
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}
              onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              {isHov && (
                <div style={{ background: '#0d0618', border: '1px solid #f4c430', borderRadius: 8, padding: '4px 10px', color: '#f4c430', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  ${(d.value / 1000).toFixed(0)}k
                </div>
              )}
              <div style={{ width: '100%', position: 'relative', height: `${pct * 100}%`, minHeight: 4, borderRadius: '6px 6px 0 0', overflow: 'hidden', cursor: 'pointer', transition: 'filter 0.2s', filter: isHov ? 'brightness(1.3)' : 'none' }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: animated ? '100%' : '0%',
                  background: 'linear-gradient(180deg, #f4c430 0%, #ff8c00 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s`,
                  boxShadow: isHov ? '0 0 20px #f4c43088' : 'none',
                }} />
              </div>
              <span style={{ color: '#a08bc0', fontSize: 12, fontWeight: 500 }}>{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const map: Record<ActivityItem['type'], { icon: string; color: string }> = {
    login: { icon: '🔐', color: '#00d4c8' },
    win: { icon: '🏆', color: '#f4c430' },
    deposit: { icon: '💳', color: '#4ade80' },
    withdrawal: { icon: '💸', color: '#ff8c00' },
    flag: { icon: '🚩', color: '#ff2d78' },
  };
  const { icon, color } = map[type];
  return (
    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
      {icon}
    </div>
  );
}

function StatusChip({ status }: { status: Player['status'] }) {
  const map: Record<Player['status'], { bg: string; color: string }> = {
    Active: { bg: '#4ade8022', color: '#4ade80' },
    VIP: { bg: '#f4c43022', color: '#f4c430' },
    Suspended: { bg: '#ff2d7822', color: '#ff2d78' },
  };
  const { bg, color } = map[status];
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [chartAnimated, setChartAnimated] = useState(false);
  const [playerFilter, setPlayerFilter] = useState<'All' | 'Active' | 'VIP' | 'Suspended'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredGameRow, setHoveredGameRow] = useState<number | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setChartAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  const navItems = ['Dashboard', 'Players', 'Games', 'Finance', 'Bonuses', 'Reports', 'Settings'];

  const filteredPlayers = PLAYERS.filter(p => {
    const matchFilter = playerFilter === 'All' || p.status === playerFilter;
    const matchSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0618; font-family: 'Inter', sans-serif; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(0,212,200,0.6); }
          50% { opacity: 0.7; transform: scale(1.2); box-shadow: 0 0 0 6px rgba(0,212,200,0); }
        }
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,45,120,0.6); }
          50% { box-shadow: 0 0 0 6px rgba(255,45,120,0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d0618; }
        ::-webkit-scrollbar-thumb { background: #3d2060; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #f4c430; }
      `}</style>

      {/* Root wrapper */}
      <div style={{
        minHeight: '100vh',
        background: '#0d0618',
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,18,64,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,212,200,0.05) 0%, transparent 40%)',
        fontFamily: "'Inter', sans-serif",
        color: '#f0e8ff',
        position: 'relative',
      }}>
        {/* Dot pattern */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(244,196,48,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(13,6,24,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(244,196,48,0.15)',
          padding: '0 32px',
          height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '0.05em', background: 'linear-gradient(135deg, #f4c430, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
              ♠ NEON PALACE ADMIN
            </div>
            {/* Nav items */}
            <div style={{ display: 'flex', gap: 4 }}>
              {navItems.map(item => (
                <button key={item} onClick={() => { if (item === 'Players') { router.push('/admin/players'); return; } if (item === 'Reports') { router.push('/admin/reports'); return; } if (item === 'Bonuses') { router.push('/admin/bonuses'); return; } setActiveNav(item); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeNav === item ? '#f4c430' : '#a08bc0',
                  fontSize: 14, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                  fontFamily: "'Inter', sans-serif",
                  position: 'relative',
                  transition: 'color 0.2s',
                  borderBottom: activeNav === item ? '2px solid #f4c430' : '2px solid transparent',
                }}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* LIVE badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.4)', borderRadius: 8, padding: '4px 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2d78', display: 'inline-block', animation: 'blink 1.2s infinite' }} />
              <span style={{ color: '#ff2d78', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>LIVE</span>
            </div>

            {/* Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifOpen(!notifOpen)}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,232,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid rgba(240,232,255,0.1)', transition: 'background 0.2s' }}>
                🔔
              </div>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff2d78', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseRed 2s infinite' }}>7</span>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 48, right: 0, background: '#1a0d30', border: '1px solid rgba(244,196,48,0.2)', borderRadius: 12, padding: 12, width: 260, zIndex: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                  {['New VIP player joined', 'Large withdrawal $15k', 'Suspicious login detected', 'System RTP report ready', 'Maintenance window at 3AM', 'New game deployment', 'Daily revenue milestone'].map((n, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 8, color: '#f0e8ff', fontSize: 13, borderBottom: i < 6 ? '1px solid rgba(240,232,255,0.05)' : 'none', cursor: 'pointer' }}>
                      <span style={{ color: '#f4c430', marginRight: 8 }}>●</span>{n}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(240,232,255,0.05)', border: '1px solid rgba(240,232,255,0.1)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f4c430, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0d0618' }}>SA</div>
              <div>
                <div style={{ color: '#f0e8ff', fontSize: 13, fontWeight: 600 }}>System Admin</div>
                <div style={{ color: '#a08bc0', fontSize: 11 }}>Super Admin</div>
              </div>
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main style={{ padding: '32px', maxWidth: 1600, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Page title */}
          <div style={{ marginBottom: 28, animation: 'slideUp 0.5s ease forwards' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
              Dashboard Overview
            </h1>
            <p style={{ color: '#a08bc0', fontSize: 14, marginTop: 4 }}>
              Welcome back, System Admin • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {KPI_CARDS.map((card, i) => (
              <KpiCounter key={card.label} card={card} delay={i * 120} />
            ))}
          </div>

          {/* ── REVENUE CHART ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28, animation: 'slideUp 0.6s ease 0.3s both' }}>
            <BarChart animated={chartAnimated} />
          </div>

          {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, marginBottom: 28 }}>

            {/* TOP GAMES TABLE */}
            <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,0.1)', overflow: 'hidden', animation: 'slideUp 0.6s ease 0.4s both' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Top Games</h3>
                  <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Ranked by active players</p>
                </div>
                <button style={{ background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.3)', color: '#f4c430', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>View All</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Game', 'Players', 'Revenue', 'RTP', 'Status'].map(col => (
                        <th key={col} style={{ padding: '12px 24px', textAlign: 'left', color: '#a08bc0', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          {col} <span style={{ opacity: 0.5 }}>↕</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {GAMES.map((g, i) => (
                      <tr key={g.name}
                        onMouseEnter={() => setHoveredGameRow(i)}
                        onMouseLeave={() => setHoveredGameRow(null)}
                        style={{ background: hoveredGameRow === i ? 'rgba(244,196,48,0.07)' : i % 2 === 0 ? 'rgba(240,232,255,0.02)' : 'transparent', transition: 'background 0.2s', cursor: 'pointer' }}>
                        <td style={{ padding: '13px 24px', color: '#f0e8ff', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                          {g.name}
                          {g.hot && <span style={{ background: '#ff2d78', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.08em' }}>HOT</span>}
                        </td>
                        <td style={{ padding: '13px 24px', color: '#00d4c8', fontWeight: 600, fontSize: 14 }}>{g.players.toLocaleString()}</td>
                        <td style={{ padding: '13px 24px', color: '#f4c430', fontWeight: 600, fontSize: 14 }}>{g.revenue}</td>
                        <td style={{ padding: '13px 24px', color: '#f0e8ff', fontSize: 14 }}>{g.rtp}</td>
                        <td style={{ padding: '13px 24px' }}>
                          <span style={{ background: g.status === 'Active' ? '#4ade8022' : '#ff8c0022', color: g.status === 'Active' ? '#4ade80' : '#ff8c00', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: '0.05em' }}>{g.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIVE SESSIONS PANEL */}
            <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(0,212,200,0.15)', overflow: 'hidden', animation: 'slideUp 0.6s ease 0.5s both', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Live Sessions</h3>
                  <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>12 active connections</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4c8', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: '#00d4c8', fontSize: 12, fontWeight: 600 }}>LIVE</span>
                </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: 440 }}>
                {SESSIONS.map((s, i) => (
                  <div key={s.username} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(240,232,255,0.05)',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,200,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}33`, border: `1px solid ${s.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: s.color, flexShrink: 0 }}>
                      {s.initials}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#f0e8ff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.username}</div>
                      <div style={{ color: '#a08bc0', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.game}</div>
                    </div>
                    {/* Bet + duration */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: '#f4c430', fontWeight: 700, fontSize: 13 }}>{s.bet}</div>
                      <div style={{ color: '#a08bc0', fontSize: 11 }}>{s.duration}</div>
                    </div>
                    {/* Action */}
                    <button style={{ background: 'rgba(240,232,255,0.07)', border: '1px solid rgba(240,232,255,0.1)', color: '#f0e8ff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>View</button>
                    {/* Pulse */}
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4c8', flexShrink: 0, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.2}s` }} />
                  </div>
                ))}
                {/* Fade at bottom */}
                <div style={{ position: 'sticky', bottom: 0, height: 40, background: 'linear-gradient(to top, #251240, transparent)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* ── RECENT PLAYERS + ACTIVITY FEED ───────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

            {/* RECENT PLAYERS TABLE */}
            <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,0.1)', overflow: 'hidden', animation: 'slideUp 0.6s ease 0.6s both' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Recent Players</h3>
                    <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Player accounts overview</p>
                  </div>
                  <button style={{ background: 'linear-gradient(135deg, #f4c430, #ff8c00)', border: 'none', color: '#0d0618', fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}>+ Add Player</button>
                </div>
                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a08bc0', fontSize: 14 }}>🔍</span>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search players..."
                      style={{ width: '100%', background: 'rgba(240,232,255,0.05)', border: '1px solid rgba(240,232,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 36px', color: '#f0e8ff', fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['All', 'Active', 'VIP', 'Suspended'] as const).map(f => (
                      <button key={f} onClick={() => setPlayerFilter(f)} style={{
                        padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Inter', sans-serif",
                        background: playerFilter === f ? (f === 'VIP' ? '#f4c430' : f === 'Suspended' ? '#ff2d78' : f === 'Active' ? '#4ade80' : '#f4c430') : 'rgba(240,232,255,0.07)',
                        color: playerFilter === f ? '#0d0618' : '#a08bc0',
                        transition: 'all 0.2s',
                      }}>{f}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['ID', 'Username', 'Country', 'Balance', 'Total Bet', 'Status', 'Action'].map(col => (
                        <th key={col} style={{ padding: '12px 20px', textAlign: 'left', color: '#a08bc0', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#a08bc0', fontSize: 14 }}>No players found</td></tr>
                    ) : (
                      filteredPlayers.map((p, i) => (
                        <tr key={p.id}
                          onMouseEnter={() => setHoveredRow(i)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{ background: hoveredRow === i ? 'rgba(244,196,48,0.05)' : i % 2 === 0 ? 'rgba(240,232,255,0.02)' : 'transparent', transition: 'background 0.2s', cursor: 'pointer' }}>
                          <td style={{ padding: '13px 20px', color: '#a08bc0', fontSize: 13, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{p.id}</td>
                          <td style={{ padding: '13px 20px', color: '#f0e8ff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{p.username}</td>
                          <td style={{ padding: '13px 20px', fontSize: 18, whiteSpace: 'nowrap' }}>{p.flag}</td>
                          <td style={{ padding: '13px 20px', color: '#4ade80', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{p.balance}</td>
                          <td style={{ padding: '13px 20px', color: '#f4c430', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{p.totalBet}</td>
                          <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}><StatusChip status={p.status} /></td>
                          <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={{ background: 'rgba(0,212,200,0.12)', border: '1px solid rgba(0,212,200,0.3)', color: '#00d4c8', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>View</button>
                              <button style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>Ban</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#a08bc0', fontSize: 13 }}>Showing {filteredPlayers.length} of {PLAYERS.length} players</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, '...', 48].map((p, i) => (
                    <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Inter', sans-serif", background: p === 1 ? '#f4c430' : 'rgba(240,232,255,0.07)', color: p === 1 ? '#0d0618' : '#a08bc0' }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIVITY FEED */}
            <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(0,212,200,0.1)', overflow: 'hidden', animation: 'slideUp 0.6s ease 0.7s both', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Activity Feed</h3>
                  <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Real-time platform events</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4c8', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: '#00d4c8', fontSize: 12, fontWeight: 600 }}>Live</span>
                </div>
              </div>
              <div ref={activityRef} style={{ overflowY: 'auto', flex: 1, maxHeight: 560, position: 'relative' }}>
                {ACTIVITY.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: '1px solid rgba(240,232,255,0.04)',
                    animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                    cursor: 'default',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,200,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <ActivityIcon type={item.type} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f0e8ff', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{item.message}</p>
                      <span style={{ color: '#6b5a8a', fontSize: 11, marginTop: 3, display: 'block' }}>{item.time}</span>
                    </div>
                  </div>
                ))}
                {/* Fade at bottom */}
                <div style={{ position: 'sticky', bottom: 0, height: 48, background: 'linear-gradient(to top, #251240, transparent)', pointerEvents: 'none' }} />
              </div>
              {/* Load more */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(240,232,255,0.07)' }}>
                <button style={{ width: '100%', background: 'rgba(0,212,200,0.1)', border: '1px solid rgba(0,212,200,0.25)', color: '#00d4c8', fontWeight: 600, fontSize: 13, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,200,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,200,0.1)')}>
                  Load More Events
                </button>
              </div>
            </div>
          </div>

          {/* ── FOOTER ────────────────────────────────────────────────────── */}
          <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, background: 'linear-gradient(135deg, #f4c430, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>♠ NEON PALACE</span>
              <span style={{ color: '#6b5a8a', fontSize: 13 }}>Admin Panel v2.4.1</span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Documentation', 'API Status', 'Support', 'Changelog'].map(link => (
                <a key={link} href="#" style={{ color: '#6b5a8a', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f4c430')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = '#6b5a8a')}>
                  {link}
                </a>
              ))}
            </div>
            <div style={{ color: '#6b5a8a', fontSize: 12 }}>
              © 2026 Neon Palace Gaming. All rights reserved.
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
