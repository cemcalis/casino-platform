'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LobbyHeader from '../components/lobby/LobbyHeader';
import LobbyCard, { LobbySectionTitle } from '../components/lobby/LobbyCard';
import { LC, LOBBY_BASE_CSS } from '../components/lobby/theme';

// ── Demo-safe mock data ──────────────────────────────────────────────────────
interface Tournament {
  id: string;
  name: string;
  game: string;
  status: 'live' | 'upcoming' | 'ended';
  prizePool: string;
  entrants: number;
  endsIn?: string;
  startsIn?: string;
  accent: string;
}

const TOURNAMENTS: Tournament[] = [
  { id: 'T-501', name: 'Neon Palace Showdown', game: 'Neon Palace', status: 'live', prizePool: '50,000 VCOIN', entrants: 842, endsIn: '4h 12m', accent: LC.gold },
  { id: 'T-502', name: 'Cyber Roulette Rush', game: 'Cyber Roulette', status: 'live', prizePool: '20,000 VCOIN', entrants: 311, endsIn: '1h 03m', accent: LC.cyan },
  { id: 'T-503', name: 'Dragon Fortune Clash', game: 'Dragon Fortune', status: 'upcoming', prizePool: '35,000 VCOIN', entrants: 0, startsIn: '6h 30m', accent: LC.magenta },
  { id: 'T-504', name: 'Mega Moolah Marathon', game: 'Mega Moolah', status: 'upcoming', prizePool: '100,000 VCOIN', entrants: 0, startsIn: '1d 4h', accent: LC.purple },
  { id: 'T-498', name: 'Gonzo Quest Gauntlet', game: "Gonzo's Quest", status: 'ended', prizePool: '25,000 VCOIN', entrants: 1204, accent: LC.textDim },
  { id: 'T-497', name: 'Book of Dead Blitz', game: 'Book of Dead', status: 'ended', prizePool: '18,000 VCOIN', entrants: 905, accent: LC.textDim },
];

const LEADERBOARD = [
  { rank: 1, name: 'velvet_king', score: '128,400 pts', prize: '15,000 VCOIN', medal: '🥇' },
  { rank: 2, name: 'neon_phoenix', score: '112,900 pts', prize: '8,000 VCOIN', medal: '🥈' },
  { rank: 3, name: 'vortex_x', score: '98,250 pts', prize: '4,000 VCOIN', medal: '🥉' },
  { rank: 4, name: 'ace_king99', score: '87,600 pts', prize: '2,000 VCOIN', medal: '' },
  { rank: 5, name: 'cyber_rider', score: '79,140 pts', prize: '1,000 VCOIN', medal: '' },
];

const FILTERS = ['All', 'Live', 'Upcoming', 'Ended'] as const;
type Filter = (typeof FILTERS)[number];

function StatusBadge({ status }: { status: Tournament['status'] }) {
  const map = {
    live: { bg: 'rgba(0,230,118,0.12)', color: LC.green, label: '● LIVE' },
    upcoming: { bg: 'rgba(244,196,48,0.12)', color: LC.gold, label: 'UPCOMING' },
    ended: { bg: 'rgba(255,255,255,0.06)', color: LC.textDim, label: 'ENDED' },
  }[status];
  return (
    <span style={{ background: map.bg, color: map.color, fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, letterSpacing: 1 }}>
      {map.label}
    </span>
  );
}

export default function TournamentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (filter === 'All') return TOURNAMENTS;
    return TOURNAMENTS.filter((t) => t.status === filter.toLowerCase());
  }, [filter]);

  function toggleJoin(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: LC.bg, fontFamily: "'Outfit', sans-serif", color: LC.text }}>
      <style>{LOBBY_BASE_CSS}</style>
      <LobbyHeader eyebrow="COMPETE & WIN" title="TOURNAMENTS" rightLabel="VIP CLUB →" rightHref="/vip" />

      <div
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${LC.gold}22 0%, transparent 70%)`,
          padding: '48px 20px 32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 12,
            background: `linear-gradient(135deg, #e5e4e2 0%, ${LC.gold} 50%, #cd7f32 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Weekly Spin Tournaments
        </h1>
        <p style={{ fontSize: 14, color: LC.textDim, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Compete against other players for VCOIN prize pools. No entry fee, no real money — just bragging rights and bonus coins.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: `1px solid ${filter === f ? LC.gold : LC.cardBorder}`,
                background: filter === f ? `${LC.gold}1a` : 'transparent',
                color: filter === f ? LC.gold : LC.textDim,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tournament grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: LC.textDim }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚔️</div>
            No {filter !== 'All' ? filter.toLowerCase() : ''} tournaments right now — check back soon.
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                background: LC.card,
                border: `1px solid ${t.accent}44`,
                borderRadius: 16,
                padding: 22,
                position: 'relative',
                opacity: t.status === 'ended' ? 0.65 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <StatusBadge status={t.status} />
                <span style={{ fontSize: 10, color: LC.textFaint }}>{t.id}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{t.name}</h3>
              <p style={{ fontSize: 12, color: LC.textDim, marginBottom: 16 }}>{t.game}</p>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: LC.textFaint, letterSpacing: 1, marginBottom: 2 }}>PRIZE POOL</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.accent }}>{t.prizePool}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: LC.textFaint, letterSpacing: 1, marginBottom: 2 }}>ENTRANTS</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{t.entrants.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: LC.textFaint, letterSpacing: 1, marginBottom: 2 }}>
                    {t.status === 'upcoming' ? 'STARTS IN' : t.status === 'live' ? 'ENDS IN' : 'STATUS'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {t.status === 'upcoming' ? t.startsIn : t.status === 'live' ? t.endsIn : 'Final'}
                  </div>
                </div>
              </div>

              {t.status !== 'ended' ? (
                <button
                  onClick={() => toggleJoin(t.id)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: joined.has(t.id) ? `1px solid ${LC.green}` : 'none',
                    background: joined.has(t.id) ? 'transparent' : `linear-gradient(135deg, ${t.accent}, ${LC.gold})`,
                    color: joined.has(t.id) ? LC.green : '#0d0618',
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {joined.has(t.id) ? '✓ JOINED' : 'JOIN TOURNAMENT'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/leaderboard')}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: `1px solid ${LC.cardBorder}`,
                    background: 'transparent',
                    color: LC.textDim,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  VIEW RESULTS
                </button>
              )}
            </div>
          ))}
        </div>
        )}

        {/* Live leaderboard preview */}
        <LobbyCard accent={LC.gold}>
          <LobbySectionTitle>Neon Palace Showdown — Live Standings</LobbySectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEADERBOARD.map((row) => (
              <div
                key={row.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: row.rank <= 3 ? 'rgba(244,196,48,0.06)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ fontSize: 16, width: 28, textAlign: 'center' }}>{row.medal || `#${row.rank}`}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{row.name}</span>
                <span style={{ fontSize: 12, color: LC.textDim, width: 110, textAlign: 'right' }}>{row.score}</span>
                <span style={{ fontSize: 12, color: LC.gold, fontWeight: 800, width: 110, textAlign: 'right' }}>{row.prize}</span>
              </div>
            ))}
          </div>
        </LobbyCard>
      </div>
    </div>
  );
}
