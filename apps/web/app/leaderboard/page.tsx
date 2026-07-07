'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CasinoShell } from '@casino/ui';
import { leaderboardApi } from '../../lib/api-leaderboard';
import type { LeaderboardEntry } from '../../lib/api-leaderboard';

/* ─── Design tokens ────────────────────────────────────────────── */
const T = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  silver: '#a8b2c0',
  bronze: '#cd7f32',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  green: '#22c55e',
  text: '#f0eaf8',
  textDim: '#7a7090',
  font: "'Outfit', sans-serif",
};

/* ─── Helpers ───────────────────────────────────────────────────── */
type Period = 'weekly' | 'monthly' | 'alltime';

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function fmtCoins(val: string | number) {
  return Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/* ─── Pulse dot ─────────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: T.green,
          boxShadow: `0 0 6px ${T.green}`,
          animation: 'livePulse 1.4s ease-in-out infinite',
          display: 'inline-block',
        }}
      />
      <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}`}</style>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: '0.08em' }}>LIVE</span>
    </span>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────── */
function Avatar({ initials, size = 44, color = T.purple }: { initials: string; size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}55 0%, ${color}22 100%)`,
        border: `2px solid ${color}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.34,
        fontWeight: 800,
        color: T.text,
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Podium ────────────────────────────────────────────────────── */
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const first = entries.find((e) => e.rank === 1);
  const second = entries.find((e) => e.rank === 2);
  const third = entries.find((e) => e.rank === 3);

  const order = [second, first, third];
  const heights = [100, 136, 80];
  const colors = [T.silver, T.goldBright, T.bronze];
  const medals = ['', '', ''];
  const labels = ['2nd', '1st', '3rd'];

  if (!first) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        padding: '32px 24px 0',
        width: '100%',
        maxWidth: 640,
      }}
    >
      {order.map((entry, idx) => {
        if (!entry) return <div key={idx} style={{ width: 160 }} />;
        const color = colors[idx];
        return (
          <div
            key={entry.userId}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              flex: 1,
            }}
          >
            {/* Avatar + medal */}
            <div style={{ position: 'relative' }}>
              <Avatar initials={getInitials(entry.username)} size={idx === 1 ? 68 : 54} color={color} />
              <span
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  fontSize: idx === 1 ? 20 : 16,
                }}
              >
                {medals[idx]}
              </span>
            </div>
            {/* Username */}
            <div
              style={{
                fontSize: idx === 1 ? 14 : 12,
                fontWeight: 700,
                color: color,
                letterSpacing: '0.05em',
                maxWidth: 110,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              {entry.username}
            </div>
            {/* Coin amount */}
            <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '0.04em', textAlign: 'center' }}>
               {fmtCoins(entry.totalWon)}
            </div>
            {/* Podium block */}
            <div
              style={{
                width: '100%',
                height: heights[idx],
                background: `linear-gradient(180deg, ${color}33 0%, ${color}11 100%)`,
                border: `1px solid ${color}55`,
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: idx === 1 ? 28 : 22,
                fontWeight: 900,
                color: color,
                letterSpacing: '0.02em',
              }}
            >
              {labels[idx]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Row colors ────────────────────────────────────────────────── */
function rankBorderColor(rank: number) {
  if (rank === 1) return T.goldBright;
  if (rank === 2) return T.silver;
  if (rank === 3) return T.bronze;
  return 'transparent';
}

function rankRowBg(rank: number, i: number) {
  if (rank === 1) return 'rgba(244,196,48,0.07)';
  if (rank === 2) return 'rgba(168,178,192,0.05)';
  if (rank === 3) return 'rgba(205,127,50,0.05)';
  return i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
}

/* ─── Empty state ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '60px 24px',
      }}
    >
      {/* CSS slot machine art */}
      <div
        style={{
          width: 80,
          height: 90,
          background: `linear-gradient(160deg, ${T.card} 0%, #1e0035 100%)`,
          border: `2px solid ${T.cardBorder}`,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          boxShadow: `0 0 24px ${T.purple}33`,
        }}
      >
        <div style={{ fontSize: 28 }}></div>
        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: '0.1em' }}>SPIN!</div>
      </div>
      <div style={{ fontSize: 15, color: T.textDim, letterSpacing: '0.06em', textAlign: 'center' }}>
        NO WINNERS YET — BE THE FIRST ON THE BOARD!
      </div>
      <Link
        href="/"
        style={{
          padding: '10px 28px',
          background: `linear-gradient(90deg, ${T.purple}, ${T.gold})`,
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textDecoration: 'none',
        }}
      >
        PLAY NOW
      </Link>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('alltime');

  useEffect(() => {
    leaderboardApi
      .getTopPlayers('neon-palace', 20)
      .then(setEntries)
      .catch(() => setError('Unable to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { id: Period; label: string }[] = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'alltime', label: 'All-Time' },
  ];

  return (
    <CasinoShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: T.bg,
          color: T.text,
          fontFamily: T.font,
        }}
      >
        {/* ── Sticky navbar ─────────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 64,
            background: `linear-gradient(90deg, ${T.surface}f8 0%, #0a0015f8 100%)`,
            borderBottom: `1px solid ${T.cardBorder}`,
            backdropFilter: 'blur(12px)',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: T.goldBright,
              textDecoration: 'none',
              letterSpacing: '0.12em',
              textShadow: `0 0 16px ${T.gold}88`,
              flexShrink: 0,
            }}
          >
             NEON PALACE
          </Link>

          {/* Period tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: `${T.card}cc`,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 10,
              padding: 4,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                style={{
                  padding: '6px 18px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  fontFamily: T.font,
                  transition: 'all 0.18s',
                  background: period === tab.id
                    ? `linear-gradient(90deg, ${T.purple}, ${T.gold}99)`
                    : 'transparent',
                  color: period === tab.id ? '#fff' : T.textDim,
                  boxShadow: period === tab.id ? `0 0 12px ${T.purple}55` : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Back to lobby */}
          <Link
            href="/"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.textDim,
              textDecoration: 'none',
              letterSpacing: '0.08em',
              padding: '6px 16px',
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
          >
            ← LOBBY
          </Link>
        </header>

        {/* ── Main content ────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 16px 60px',
            gap: 32,
            animation: 'fadeIn 0.5s ease',
          }}
        >
          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: 900,
                letterSpacing: '0.12em',
                background: `linear-gradient(90deg, ${T.goldBright} 0%, ${T.gold} 60%, ${T.cyan} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              LEADERBOARD
            </h1>
            <LiveDot />
          </div>

          {/* Loading spinner */}
          {loading && (
            <div
              style={{
                padding: '80px 24px',
                textAlign: 'center',
                color: T.textDim,
                fontSize: 13,
                letterSpacing: '0.1em',
                animation: 'shimmer 1.2s ease infinite',
              }}
            >
              LOADING RANKINGS...
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                color: '#ff6b6b',
                fontSize: 14,
                background: '#ff1f1f11',
                border: '1px solid #ff6b6b33',
                borderRadius: 12,
                maxWidth: 400,
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Podium */}
              {entries.length >= 3 && <Podium entries={entries} />}

              {/* Table card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 760,
                  background: `linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`,
                  borderRadius: 18,
                  border: `1px solid ${T.cardBorder}`,
                  overflow: 'hidden',
                  boxShadow: `0 8px 48px #00000088, 0 0 0 1px ${T.cardBorder}`,
                }}
              >
                {/* Table head */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 52px 1fr 130px 130px 90px',
                    padding: '12px 20px',
                    background: '#0a001a',
                    borderBottom: `1px solid ${T.cardBorder}`,
                    fontSize: 11,
                    color: T.textDim,
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                  }}
                >
                  <span>RANK</span>
                  <span>AVT</span>
                  <span>PLAYER</span>
                  <span style={{ textAlign: 'right' }}>BIGGEST WIN</span>
                  <span style={{ textAlign: 'right' }}>TOTAL WON</span>
                  <span style={{ textAlign: 'right' }}>SPINS</span>
                </div>

                {/* Empty state */}
                {entries.length === 0 && <EmptyState />}

                {/* Rows */}
                {entries.map((entry, i) => {
                  const borderColor = rankBorderColor(entry.rank);
                  const bg = rankRowBg(entry.rank, i);
                  return (
                    <div
                      key={entry.userId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '52px 52px 1fr 130px 130px 90px',
                        padding: '11px 20px',
                        borderTop: i > 0 ? `1px solid ${T.cardBorder}55` : undefined,
                        borderLeft: `3px solid ${borderColor}`,
                        backgroundColor: bg,
                        alignItems: 'center',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Rank */}
                      <span
                        style={{
                          fontSize: entry.rank <= 3 ? 20 : 13,
                          color: entry.rank <= 3 ? borderColor : T.textDim,
                          fontWeight: 800,
                        }}
                      >
                        {entry.rank <= 3
                          ? ['', '', ''][entry.rank - 1]
                          : `#${entry.rank}`}
                      </span>
                      {/* Avatar */}
                      <Avatar
                        initials={getInitials(entry.username)}
                        size={36}
                        color={entry.rank <= 3 ? borderColor : T.purple}
                      />
                      {/* Username */}
                      <span
                        style={{
                          fontSize: 13,
                          color: T.text,
                          fontWeight: entry.rank <= 3 ? 700 : 500,
                          letterSpacing: '0.04em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.username}
                      </span>
                      {/* Biggest win — use totalWon as proxy since API doesn't expose it */}
                      <span
                        style={{
                          textAlign: 'right',
                          fontSize: 13,
                          color: T.gold,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        }}
                      >
                         {fmtCoins(entry.totalWon)}
                      </span>
                      {/* Total won */}
                      <span
                        style={{
                          textAlign: 'right',
                          fontSize: 13,
                          color: entry.rank <= 3 ? borderColor : T.textDim,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {fmtCoins(entry.totalWon)} VC
                      </span>
                      {/* Spins */}
                      <span
                        style={{
                          textAlign: 'right',
                          fontSize: 12,
                          color: T.textDim,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {entry.totalSpins.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* "Your Position" card / CTA */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 760,
                  background: `linear-gradient(135deg, ${T.purple}22 0%, ${T.gold}11 100%)`,
                  border: `1px solid ${T.purple}55`,
                  borderRadius: 14,
                  padding: '20px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '0.1em', marginBottom: 6 }}>
                    YOUR POSITION
                  </div>
                  <div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>
                    Keep spinning to climb the ranks!
                  </div>
                </div>
                <Link
                  href="/"
                  style={{
                    padding: '11px 28px',
                    background: `linear-gradient(90deg, ${T.purple} 0%, ${T.gold}cc 100%)`,
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    boxShadow: `0 4px 20px ${T.purple}55`,
                    whiteSpace: 'nowrap',
                  }}
                >
                   PLAY NOW
                </Link>
              </div>

              {/* Footer note */}
              <p
                style={{
                  fontSize: 11,
                  color: T.textDim,
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                NEON PALACE SLOTS — TOP 20 ALL-TIME — VIRTUAL CURRENCY ONLY
              </p>
            </>
          )}
        </main>
      </div>
    </CasinoShell>
  );
}
