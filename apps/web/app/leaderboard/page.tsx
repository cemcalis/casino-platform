'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CasinoShell } from '@casino/ui';
import { leaderboardApi } from '../../lib/api-leaderboard';
import type { LeaderboardEntry } from '../../lib/api-leaderboard';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaderboardApi
      .getTopPlayers('neon-palace', 20)
      .then(setEntries)
      .catch(() => setError('Unable to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

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
        {/* Header */}
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
              LEADERBOARD
            </span>
          </div>
        </header>

        {/* Content */}
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
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'var(--np-bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--np-border-subtle)',
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 140px 100px',
                padding: 'var(--np-space-3) var(--np-space-5)',
                backgroundColor: '#1a0a2e',
                fontSize: 'var(--np-text-xs)',
                color: 'var(--np-text-muted)',
                letterSpacing: 'var(--np-tracking-wider)',
                fontWeight: 'var(--np-font-semibold)',
              }}
            >
              <span>RANK</span>
              <span>PLAYER</span>
              <span style={{ textAlign: 'right' }}>TOTAL WON</span>
              <span style={{ textAlign: 'right' }}>SPINS</span>
            </div>

            {loading && (
              <div
                style={{
                  padding: 'var(--np-space-10)',
                  textAlign: 'center',
                  color: 'var(--np-text-muted)',
                  fontSize: 'var(--np-text-sm)',
                  letterSpacing: 'var(--np-tracking-wider)',
                }}
              >
                LOADING...
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 'var(--np-space-10)',
                  textAlign: 'center',
                  color: '#ff6b6b',
                  fontSize: 'var(--np-text-sm)',
                }}
              >
                {error}
              </div>
            )}

            {!loading && !error && entries.length === 0 && (
              <div
                style={{
                  padding: 'var(--np-space-10)',
                  textAlign: 'center',
                  color: 'var(--np-text-muted)',
                  fontSize: 'var(--np-text-sm)',
                  letterSpacing: 'var(--np-tracking-wider)',
                }}
              >
                NO GAMES PLAYED YET — BE THE FIRST ON THE BOARD!
              </div>
            )}

            {entries.map((entry, i) => (
              <div
                key={entry.userId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 140px 100px',
                  padding: 'var(--np-space-3) var(--np-space-5)',
                  borderTop: i > 0 ? '1px solid var(--np-border-subtle)' : undefined,
                  backgroundColor: entry.rank <= 3 ? `rgba(244,196,48,${0.04 - entry.rank * 0.01})` : undefined,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: entry.rank <= 3 ? '18px' : 'var(--np-text-sm)',
                    color: entry.rank <= 3 ? 'var(--np-gold)' : 'var(--np-text-muted)',
                    fontWeight: 'var(--np-font-bold)',
                  }}
                >
                  {MEDAL[entry.rank] ?? `#${entry.rank}`}
                </span>
                <span
                  style={{
                    fontSize: 'var(--np-text-sm)',
                    color: 'var(--np-text-primary)',
                    fontWeight: entry.rank <= 3 ? 'var(--np-font-semibold)' : undefined,
                    letterSpacing: 'var(--np-tracking-wider)',
                  }}
                >
                  {entry.username}
                </span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 'var(--np-text-sm)',
                    color: 'var(--np-gold)',
                    fontWeight: 'var(--np-font-semibold)',
                    letterSpacing: 'var(--np-tracking-wider)',
                  }}
                >
                  {parseFloat(entry.totalWon).toLocaleString('en-US', { maximumFractionDigits: 0 })} VC
                </span>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: 'var(--np-text-sm)',
                    color: 'var(--np-text-secondary)',
                    letterSpacing: 'var(--np-tracking-wider)',
                  }}
                >
                  {entry.totalSpins.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 'var(--np-text-xs)',
              color: 'var(--np-text-muted)',
              letterSpacing: 'var(--np-tracking-wider)',
              textAlign: 'center',
            }}
          >
            NEON PALACE SLOTS &mdash; TOP 20 ALL-TIME &mdash; VIRTUAL CURRENCY ONLY
          </p>
        </main>
      </div>
    </CasinoShell>
  );
}
