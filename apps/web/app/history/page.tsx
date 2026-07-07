'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CasinoShell } from '@casino/ui';
import { gameApi } from '../../lib/api-game';
import type { GameHistoryItem, GameHistoryResponse } from '../../lib/api-game';

/* ─── Design tokens ────────────────────────────────────────────── */
const T = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  green: '#22c55e',
  red: '#ef4444',
  text: '#f0eaf8',
  textDim: '#7a7090',
  font: "'Outfit', sans-serif",
};

/* ─── Helpers ───────────────────────────────────────────────────── */
type FilterPeriod = '7d' | '30d' | 'all';

const PAGE_SIZE = 15;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtCoins(val: string | number) {
  return Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function computeMultiplier(bet: string, win: string) {
  const b = parseFloat(bet);
  if (b === 0) return 0;
  return parseFloat(win) / b;
}

function isWithinDays(iso: string, days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

/* ─── Stat mini-card ────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: '1 1 140px',
        background: `linear-gradient(135deg, ${T.card} 0%, ${T.surface} 100%)`,
        border: `1px solid ${T.cardBorder}`,
        borderTop: `2px solid ${color}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '0.03em' }}>{value}</div>
    </div>
  );
}

/* ─── Filter pill ───────────────────────────────────────────────── */
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 22px',
        borderRadius: 100,
        border: active ? `1px solid ${T.purple}` : `1px solid ${T.cardBorder}`,
        background: active ? `linear-gradient(90deg, ${T.purple}cc, ${T.gold}66)` : T.card,
        color: active ? '#fff' : T.textDim,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.07em',
        cursor: 'pointer',
        fontFamily: T.font,
        transition: 'all 0.18s',
        boxShadow: active ? `0 0 16px ${T.purple}44` : 'none',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Result badge ──────────────────────────────────────────────── */
function ResultBadge({ bet, win }: { bet: string; win: string }) {
  const net = parseFloat(win) - parseFloat(bet);
  const positive = net > 0;
  return (
    <span
      style={{
        padding: '3px 9px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: positive ? '#22c55e22' : '#ef444422',
        color: positive ? T.green : T.red,
        whiteSpace: 'nowrap',
      }}
    >
      {positive ? '+' : ''}
      {fmtCoins(net)}
    </span>
  );
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
        padding: '70px 24px',
      }}
    >
      <div style={{ fontSize: 56 }}></div>
      <div
        style={{
          fontSize: 15,
          color: T.textDim,
          letterSpacing: '0.06em',
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        No spins yet — play your first game!
      </div>
      <Link
        href="/"
        style={{
          padding: '11px 30px',
          background: `linear-gradient(90deg, ${T.purple}, ${T.gold}cc)`,
          borderRadius: 10,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textDecoration: 'none',
          boxShadow: `0 4px 20px ${T.purple}55`,
        }}
      >
         GO TO LOBBY
      </Link>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GameHistoryItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>('all');

  const loadPage = useCallback(
    (page: number) => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError(null);

      gameApi
        .getHistory(token, page, PAGE_SIZE)
        .then((data: GameHistoryResponse) => {
          setSessions(data.sessions);
          setPagination({
            page: data.pagination.page,
            totalPages: data.pagination.totalPages,
            total: data.pagination.total,
          });
        })
        .catch(() => setError('Unable to load history.'))
        .finally(() => setLoading(false));
    },
    [router],
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  /* Filtered client-side subset */
  const filtered = sessions.filter((s) => {
    if (filter === '7d') return isWithinDays(s.createdAt, 7);
    if (filter === '30d') return isWithinDays(s.createdAt, 30);
    return true;
  });

  /* Compute stats from all sessions */
  const totalSpins = sessions.length;
  const totalWagered = sessions.reduce((acc, s) => acc + parseFloat(s.betAmount), 0);
  const totalWon = sessions.reduce((acc, s) => acc + parseFloat(s.winAmount), 0);
  const netResult = totalWon - totalWagered;

  return (
    <CasinoShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        * { box-sizing: border-box; }
        .hist-row:hover { background: rgba(124,58,237,0.08) !important; }
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
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: T.goldBright,
              textDecoration: 'none',
              letterSpacing: '0.12em',
              textShadow: `0 0 16px ${T.gold}88`,
            }}
          >
             NEON PALACE
          </Link>

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
            gap: 28,
            animation: 'fadeIn 0.5s ease',
          }}
        >
          {/* Page title */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: '0 0 4px',
                fontSize: 'clamp(22px, 4vw, 38px)',
                fontWeight: 900,
                letterSpacing: '0.12em',
                background: `linear-gradient(90deg, ${T.goldBright} 0%, ${T.cyan} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MY HISTORY
            </h1>
            <div style={{ fontSize: 12, color: T.textDim, letterSpacing: '0.08em' }}>
              {pagination.total > 0 ? `${pagination.total} total spins` : 'Your spin records'}
            </div>
          </div>

          {/* ── 4 stat mini-cards ───────────────────────────────── */}
          {!loading && !error && sessions.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                width: '100%',
                maxWidth: 860,
                justifyContent: 'center',
              }}
            >
              <StatCard label="TOTAL SPINS" value={totalSpins.toLocaleString()} icon="" color={T.cyan} />
              <StatCard label="WAGERED" value={`${fmtCoins(totalWagered)} VC`} icon="" color={T.textDim} />
              <StatCard label="WON" value={`${fmtCoins(totalWon)} VC`} icon="" color={T.gold} />
              <StatCard
                label="NET"
                value={`${netResult >= 0 ? '+' : ''}${fmtCoins(netResult)} VC`}
                icon={netResult >= 0 ? '' : ''}
                color={netResult >= 0 ? T.green : T.red}
              />
            </div>
          )}

          {/* ── Filter bar ──────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FilterPill active={filter === '7d'} onClick={() => setFilter('7d')}>
              Last 7 Days
            </FilterPill>
            <FilterPill active={filter === '30d'} onClick={() => setFilter('30d')}>
              Last 30 Days
            </FilterPill>
            <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
              All Time
            </FilterPill>
          </div>

          {/* ── Loading ─────────────────────────────────────────── */}
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
              LOADING HISTORY...
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────── */}
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

          {/* ── Table card ──────────────────────────────────────── */}
          {!loading && !error && (
            <div
              style={{
                width: '100%',
                maxWidth: 860,
                background: `linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`,
                borderRadius: 18,
                border: `1px solid ${T.cardBorder}`,
                overflow: 'hidden',
                boxShadow: `0 8px 48px #00000088`,
              }}
            >
              {/* Table head */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr 90px 90px 100px 100px',
                  padding: '12px 20px',
                  background: '#0a001a',
                  borderBottom: `1px solid ${T.cardBorder}`,
                  fontSize: 11,
                  color: T.textDim,
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                <span>DATE</span>
                <span>GAME</span>
                <span style={{ textAlign: 'right' }}>BET</span>
                <span style={{ textAlign: 'right' }}>MULT</span>
                <span style={{ textAlign: 'right' }}>WIN</span>
                <span style={{ textAlign: 'right' }}>RESULT</span>
              </div>

              {/* Empty state */}
              {filtered.length === 0 && <EmptyState />}

              {/* Rows */}
              {filtered.map((s, i) => {
                const win = parseFloat(s.winAmount);
                const bet = parseFloat(s.betAmount);
                const multiplier = computeMultiplier(s.betAmount, s.winAmount);
                const isWin = win >= bet;
                const isBigWin = multiplier >= 10;
                const net = win - bet;

                let rowBorderColor = 'transparent';
                if (isBigWin) rowBorderColor = T.goldBright;
                else if (isWin && win > 0) rowBorderColor = T.green;
                else rowBorderColor = `${T.red}55`;

                return (
                  <div
                    key={s.id}
                    className="hist-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '130px 1fr 90px 90px 100px 100px',
                      padding: '11px 20px',
                      borderTop: i > 0 ? `1px solid ${T.cardBorder}55` : undefined,
                      borderLeft: `3px solid ${rowBorderColor}`,
                      backgroundColor: isBigWin
                        ? `${T.goldBright}08`
                        : isWin && win > 0
                        ? `${T.green}06`
                        : `${T.red}04`,
                      alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Date */}
                    <span style={{ fontSize: 11, color: T.textDim }}>{formatDate(s.createdAt)}</span>

                    {/* Game */}
                    <span
                      style={{
                        fontSize: 13,
                        color: T.text,
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.gameType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>

                    {/* Bet */}
                    <span style={{ textAlign: 'right', fontSize: 13, color: T.textDim }}>
                      {fmtCoins(s.betAmount)}
                    </span>

                    {/* Multiplier */}
                    <span
                      style={{
                        textAlign: 'right',
                        fontSize: 12,
                        fontWeight: isBigWin ? 800 : 500,
                        color: isBigWin ? T.goldBright : T.textDim,
                      }}
                    >
                      {isBigWin && <span style={{ marginRight: 3 }}></span>}
                      {multiplier.toFixed(2)}x
                    </span>

                    {/* Win */}
                    <span
                      style={{
                        textAlign: 'right',
                        fontSize: 13,
                        fontWeight: isBigWin ? 800 : 600,
                        color: isBigWin ? T.goldBright : win > 0 ? T.green : T.textDim,
                      }}
                    >
                      {fmtCoins(s.winAmount)}
                    </span>

                    {/* Result badge */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <ResultBadge bet={s.betAmount} win={s.winAmount} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────── */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => loadPage(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                style={{
                  padding: '9px 22px',
                  background: T.card,
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 9,
                  color: pagination.page <= 1 ? T.textDim : T.text,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  fontFamily: T.font,
                  opacity: pagination.page <= 1 ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
              >
                ← PREVIOUS
              </button>
              <span style={{ fontSize: 12, color: T.textDim, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                PAGE {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => loadPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                style={{
                  padding: '9px 22px',
                  background: T.card,
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 9,
                  color: pagination.page >= pagination.totalPages ? T.textDim : T.text,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  fontFamily: T.font,
                  opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
              >
                NEXT →
              </button>
            </div>
          )}

          {/* ── Provably fair note ──────────────────────────────── */}
          {!loading && !error && sessions.length > 0 && (
            <p
              style={{
                fontSize: 11,
                color: T.textDim,
                letterSpacing: '0.08em',
                textAlign: 'center',
                margin: 0,
              }}
            >
              SEED + NONCE VISIBLE FOR PROVABLY FAIR VERIFICATION — VIRTUAL CURRENCY ONLY
            </p>
          )}
        </main>
      </div>
    </CasinoShell>
  );
}
