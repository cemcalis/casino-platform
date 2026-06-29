'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CasinoShell } from '@casino/ui';
import { gameApi } from '../../lib/api-game';
import type { GameHistoryItem, GameHistoryResponse } from '../../lib/api-game';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function NetBadge({ bet, win }: { bet: string; win: string }) {
  const net = parseFloat(win) - parseFloat(bet);
  const positive = net >= 0;
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        backgroundColor: positive ? '#2e7d3233' : '#c6282822',
        color: positive ? '#4caf50' : '#ff6b6b',
      }}
    >
      {positive ? '+' : ''}{net.toLocaleString('en-US', { maximumFractionDigits: 0 })}
    </span>
  );
}

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<GameHistoryItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback((page: number) => {
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
        setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
      })
      .catch(() => setError('Unable to load history.'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

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
            gap: 'var(--np-space-4)',
            padding: '0 var(--np-space-6)',
            height: '64px',
            borderBottom: '1px solid var(--np-border-subtle)',
            backgroundColor: 'var(--np-bg-surface)',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: 'var(--np-text-secondary)',
              textDecoration: 'none',
              fontSize: 'var(--np-text-sm)',
              letterSpacing: 'var(--np-tracking-wider)',
            }}
          >
            ← DASHBOARD
          </Link>
          <span
            style={{
              fontSize: 'var(--np-text-lg)',
              fontWeight: 'var(--np-font-extrabold)',
              color: 'var(--np-gold)',
              letterSpacing: 'var(--np-tracking-display)',
            }}
          >
            SPIN HISTORY
          </span>
          {pagination.total > 0 && (
            <span style={{ fontSize: 'var(--np-text-xs)', color: 'var(--np-text-muted)', letterSpacing: 'var(--np-tracking-wider)' }}>
              {pagination.total} TOTAL
            </span>
          )}
        </header>

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--np-space-8) var(--np-space-4)',
            gap: 'var(--np-space-4)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '860px',
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
                gridTemplateColumns: '140px 80px 80px 80px 1fr',
                padding: 'var(--np-space-3) var(--np-space-5)',
                backgroundColor: '#1a0a2e',
                fontSize: 'var(--np-text-xs)',
                color: 'var(--np-text-muted)',
                letterSpacing: 'var(--np-tracking-wider)',
                fontWeight: 700,
              }}
            >
              <span>TIME</span>
              <span style={{ textAlign: 'right' }}>BET</span>
              <span style={{ textAlign: 'right' }}>WIN</span>
              <span style={{ textAlign: 'center' }}>NET</span>
              <span style={{ textAlign: 'right' }}>SEED (PROVABLY FAIR)</span>
            </div>

            {loading && (
              <div style={{ padding: 'var(--np-space-10)', textAlign: 'center', color: 'var(--np-text-muted)', fontSize: 'var(--np-text-sm)', letterSpacing: 'var(--np-tracking-wider)' }}>
                LOADING...
              </div>
            )}

            {error && (
              <div style={{ padding: 'var(--np-space-10)', textAlign: 'center', color: '#ff6b6b', fontSize: 'var(--np-text-sm)' }}>
                {error}
              </div>
            )}

            {!loading && !error && sessions.length === 0 && (
              <div style={{ padding: 'var(--np-space-10)', textAlign: 'center', color: 'var(--np-text-muted)', fontSize: 'var(--np-text-sm)', letterSpacing: 'var(--np-tracking-wider)' }}>
                NO SPINS YET — HEAD TO{' '}
                <Link href="/games/neon-palace" style={{ color: 'var(--np-gold)', textDecoration: 'none' }}>
                  NEON PALACE
                </Link>{' '}
                AND PLAY!
              </div>
            )}

            {sessions.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 80px 80px 80px 1fr',
                  padding: 'var(--np-space-3) var(--np-space-5)',
                  borderTop: i > 0 ? '1px solid var(--np-border-subtle)' : undefined,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 'var(--np-text-xs)', color: 'var(--np-text-muted)' }}>
                  {formatDate(s.createdAt)}
                </span>
                <span style={{ textAlign: 'right', fontSize: 'var(--np-text-sm)', color: 'var(--np-text-secondary)' }}>
                  {parseFloat(s.betAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <span style={{ textAlign: 'right', fontSize: 'var(--np-text-sm)', color: parseFloat(s.winAmount) > 0 ? 'var(--np-gold)' : 'var(--np-text-muted)' }}>
                  {parseFloat(s.winAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <NetBadge bet={s.betAmount} win={s.winAmount} />
                </div>
                <span
                  style={{
                    textAlign: 'right',
                    fontSize: '10px',
                    color: 'var(--np-text-muted)',
                    fontFamily: 'monospace',
                    letterSpacing: '0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={`${s.serverSeed} | nonce: ${s.nonce}`}
                >
                  {s.serverSeed.slice(0, 16)}…#{s.nonce}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 'var(--np-space-3)', alignItems: 'center' }}>
              <button
                onClick={() => loadPage(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--np-bg-surface)',
                  border: '1px solid var(--np-border-subtle)',
                  borderRadius: '8px',
                  color: pagination.page <= 1 ? 'var(--np-text-muted)' : 'var(--np-text-secondary)',
                  fontSize: 'var(--np-text-xs)',
                  letterSpacing: 'var(--np-tracking-wider)',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← PREV
              </button>
              <span style={{ fontSize: 'var(--np-text-xs)', color: 'var(--np-text-muted)', letterSpacing: 'var(--np-tracking-wider)' }}>
                PAGE {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => loadPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--np-bg-surface)',
                  border: '1px solid var(--np-border-subtle)',
                  borderRadius: '8px',
                  color: pagination.page >= pagination.totalPages ? 'var(--np-text-muted)' : 'var(--np-text-secondary)',
                  fontSize: 'var(--np-text-xs)',
                  letterSpacing: 'var(--np-tracking-wider)',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                NEXT →
              </button>
            </div>
          )}

          <p style={{ fontSize: 'var(--np-text-xs)', color: 'var(--np-text-muted)', letterSpacing: 'var(--np-tracking-wider)', textAlign: 'center' }}>
            SEED + NONCE VISIBLE FOR PROVABLY FAIR VERIFICATION &mdash; VIRTUAL CURRENCY ONLY
          </p>
        </main>
      </div>
    </CasinoShell>
  );
}
