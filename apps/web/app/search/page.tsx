'use client';

import { AppIcon } from '../components/icons';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LobbyHeader from '../components/lobby/LobbyHeader';
import { LC, LOBBY_BASE_CSS } from '../components/lobby/theme';

// ── Demo-safe mock search index ──────────────────────────────────────────────
type ResultKind = 'game' | 'promotion' | 'page';

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  accent: string;
  tags: string[];
}

const INDEX: SearchResult[] = [
  { id: 'neon-palace', kind: 'game', title: 'Neon Palace', subtitle: 'Slots · Forge Studio · RTP 96.5%', href: '/games/neon-palace', icon: 'slots', accent: LC.gold, tags: ['slot', 'hot', 'neon'] },
  { id: 'blackjack-pro', kind: 'game', title: 'Blackjack Pro', subtitle: 'Table · Neon Originals · RTP 99.5%', href: '/games/blackjack-pro', icon: 'cards', accent: LC.green, tags: ['table', 'cards'] },
  { id: 'cyber-roulette', kind: 'game', title: 'Cyber Roulette', subtitle: 'Table · Forge Studio · RTP 97.3%', href: '/games/cyber-roulette', icon: 'wheel', accent: LC.cyan, tags: ['table', 'roulette'] },
  { id: 'mega-moolah', kind: 'game', title: 'Mega Savanna', subtitle: 'Jackpot · Neon Originals · RTP 96.0%', href: '/games/mega-moolah', icon: 'money', accent: '#f97316', tags: ['jackpot', 'slot'] },
  { id: 'gonzo-quest', kind: 'game', title: "Golden Conquest", subtitle: 'Slots · Neon Originals · RTP 96.0%', href: '/games/gonzo-quest', icon: '', accent: '#84cc16', tags: ['slot', 'adventure'] },
  { id: 'book-of-dead', kind: 'game', title: 'Tome of Anubis', subtitle: 'Slots · Forge Studio · RTP 96.21%', href: '/games/book-of-dead', icon: '', accent: '#d4a848', tags: ['slot', 'egypt'] },
  { id: 'baccarat', kind: 'game', title: 'Baccarat', subtitle: 'Table · Live Forge · RTP 98.94%', href: '/games/baccarat', icon: '', accent: LC.gold, tags: ['table', 'cards'] },
  { id: 'video-poker', kind: 'game', title: 'Video Poker', subtitle: 'Table · Neon Originals · RTP 99.5%', href: '/games/video-poker', icon: '', accent: LC.cyan, tags: ['table', 'cards'] },
  { id: 'welcome-bonus', kind: 'promotion', title: 'Welcome Bonus', subtitle: '100% up to 1,000 VCOIN + 200 free spins', href: '/promotions', icon: 'spark', accent: LC.gold, tags: ['bonus', 'new player'] },
  { id: 'weekly-reload', kind: 'promotion', title: 'Weekly Reload', subtitle: '50% reload every Monday', href: '/promotions', icon: 'refresh', accent: LC.cyan, tags: ['bonus', 'weekly'] },
  { id: 'vip-cashback', kind: 'promotion', title: 'VIP Cashback', subtitle: '20% weekly cashback for VIP Gold+', href: '/promotions', icon: 'crown', accent: LC.purple, tags: ['vip', 'cashback'] },
  { id: 'wallet', kind: 'page', title: 'Wallet', subtitle: 'Deposit, withdraw, and view transactions', href: '/wallet', icon: 'card', accent: LC.green, tags: ['cashier', 'balance'] },
  { id: 'vip-club', kind: 'page', title: 'VIP Club', subtitle: 'Loyalty tiers and exclusive perks', href: '/vip', icon: 'crown', accent: LC.purple, tags: ['loyalty', 'tiers'] },
  { id: 'tournaments', kind: 'page', title: 'Tournaments', subtitle: 'Compete for VCOIN prize pools', href: '/tournaments', icon: 'swords', accent: LC.magenta, tags: ['compete', 'leaderboard'] },
  { id: 'leaderboard', kind: 'page', title: 'Leaderboard', subtitle: 'Top players this week', href: '/leaderboard', icon: 'medal', accent: LC.gold, tags: ['ranking'] },
  { id: 'history', kind: 'page', title: 'History', subtitle: 'Your past spins and transactions', href: '/history', icon: 'scroll', accent: LC.textDim, tags: ['spins', 'log'] },
];

const KIND_LABEL: Record<ResultKind, string> = { game: 'Game', promotion: 'Promotion', page: 'Page' };
const KIND_FILTERS = ['All', 'Games', 'Promotions', 'Pages'] as const;
type KindFilter = (typeof KIND_FILTERS)[number];

const TRENDING = ['Neon Palace', 'Mega Savanna', 'Cyber Roulette', 'VIP Club'];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('All');

  const results = useMemo(() => {
    let pool = INDEX;
    if (kindFilter !== 'All') {
      const kind = kindFilter === 'Games' ? 'game' : kindFilter === 'Promotions' ? 'promotion' : 'page';
      pool = pool.filter((r) => r.kind === kind);
    }
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q))
    );
  }, [query, kindFilter]);

  return (
    <div style={{ minHeight: '100vh', background: LC.bg, fontFamily: "'Outfit', sans-serif", color: LC.text }}>
      <style>{LOBBY_BASE_CSS}</style>
      <LobbyHeader eyebrow="FIND ANYTHING" title="SEARCH" rightLabel="LOBBY →" rightHref="/" />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: LC.textDim }}></span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, promotions, pages..."
            style={{
              width: '100%',
              background: LC.card,
              border: `1px solid ${LC.cardBorder}`,
              borderRadius: 14,
              padding: '14px 16px 14px 44px',
              color: LC.text,
              fontSize: 15,
              fontFamily: "'Outfit', sans-serif",
              outline: 'none',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {KIND_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setKindFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: `1px solid ${kindFilter === f ? LC.gold : LC.cardBorder}`,
                background: kindFilter === f ? `${LC.gold}1a` : 'transparent',
                color: kindFilter === f ? LC.gold : LC.textDim,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {!query && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: LC.textFaint, letterSpacing: 1, marginBottom: 10 }}>TRENDING</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1px solid ${LC.cardBorder}`,
                    background: 'rgba(255,255,255,0.03)',
                    color: LC.textDim,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div style={{ fontSize: 12, color: LC.textDim, marginBottom: 12 }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: LC.textDim }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}></div>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => router.push(r.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: LC.card,
                  border: `1px solid ${LC.cardBorder}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = LC.cardBorder; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${r.accent}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 19,
                    flexShrink: 0,
                  }}
                >
                  <AppIcon name={r.icon} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: LC.text }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: LC.textDim, marginTop: 2 }}>{r.subtitle}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: r.accent,
                    background: `${r.accent}1a`,
                    padding: '3px 9px',
                    borderRadius: 20,
                    letterSpacing: 0.5,
                    flexShrink: 0,
                  }}
                >
                  {KIND_LABEL[r.kind]}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
