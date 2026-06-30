'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../../lib/api-user';
import type { LedgerEntry } from '../../lib/api-user';

const C = {
  bg: '#07030f',
  surface: '#120820',
  card: '#1a0c30',
  cardBorder: '#2d1558',
  gold: '#f4c430',
  teal: '#00d4c8',
  magenta: '#ff2d78',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#9d8ec0',
  green: '#00ff88',
  red: '#ff4466',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function entryLabel(entry: LedgerEntry): string {
  const ref = entry.referenceId;
  if (ref === 'daily-bonus' || ref === 'daily_bonus') return 'Daily Bonus';
  if (ref === 'welcome-bonus' || ref === 'welcome_bonus') return 'Welcome Bonus';
  if (ref === 'cashback-bonus') return 'Cashback Bonus';
  if (ref?.startsWith('spin_')) return 'Game Spin';
  if (entry.type === 'CREDIT') return 'Credit';
  return 'Debit';
}

function entryIcon(entry: LedgerEntry): string {
  const ref = entry.referenceId;
  if (ref === 'daily-bonus' || ref === 'daily_bonus') return '🎁';
  if (ref === 'welcome-bonus' || ref === 'welcome_bonus') return '🎉';
  if (ref === 'cashback-bonus') return '💰';
  if (ref?.startsWith('spin_') && entry.type === 'CREDIT') return '🏆';
  if (ref?.startsWith('spin_') && entry.type === 'DEBIT') return '🎰';
  return entry.type === 'CREDIT' ? '↑' : '↓';
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<string | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bonusState, setBonusState] = useState<'idle' | 'claiming' | 'claimed' | 'error'>('idle');
  const [bonusError, setBonusError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('accessToken');
    if (!t) { router.replace('/login'); return; }
    setToken(t);
    Promise.all([userApi.getWallet(t), userApi.getLedger(t, 1, 20)])
      .then(([wallet, ledger]) => {
        setBalance(wallet.balance);
        setEntries(ledger.entries);
        setTotalPages(ledger.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => { router.replace('/login'); });
  }, [router]);

  const loadPage = useCallback((p: number) => {
    if (!token) return;
    userApi.getLedger(token, p, 20).then((ledger) => {
      setEntries(ledger.entries);
      setTotalPages(ledger.pagination.totalPages);
      setPage(p);
    });
  }, [token]);

  const claimBonus = async () => {
    if (!token || bonusState !== 'idle') return;
    setBonusState('claiming');
    try {
      const res = await userApi.claimDailyBonus(token);
      setBalance(res.balance);
      setBonusState('claimed');
      loadPage(1);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? '';
      setBonusError(msg.includes('already') ? 'Already claimed today — come back tomorrow!' : 'Claim failed');
      setBonusState('error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.gold, fontSize: 18, letterSpacing: 3 }}>LOADING…</div>
      </div>
    );
  }

  const credits = entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + parseFloat(e.amount), 0);
  const debits = entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text, padding: '24px 16px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ maxWidth: 900, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/')} style={{
          background: 'none', border: 'none', color: C.textDim, cursor: 'pointer',
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 1,
        }}>
          ← LOBBY
        </button>
        <div style={{ fontSize: 22, fontWeight: 900, background: `linear-gradient(90deg,${C.gold},#ff8c00)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          CASHIER
        </div>
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 14, letterSpacing: 1,
        }}>
          DASHBOARD →
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Balance card */}
        <div style={{
          background: `linear-gradient(135deg, #2a0060 0%, #1a0040 50%, #0d0020 100%)`,
          border: `1px solid ${C.gold}44`, borderRadius: 20, padding: '32px 40px',
          boxShadow: `0 0 60px ${C.purple}22, 0 20px 60px rgba(0,0,0,0.6)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}22, transparent 70%)` }} />
          <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 4, fontWeight: 700, marginBottom: 8 }}>TOTAL BALANCE</div>
          <div style={{
            fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, color: C.gold,
            textShadow: `0 0 30px ${C.gold}66`, lineHeight: 1, marginBottom: 4,
          }}>
            {parseFloat(balance ?? '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 14, color: C.textDim, letterSpacing: 2, fontWeight: 600 }}>VCOIN</div>

          <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginBottom: 4 }}>CREDITED (PAGE)</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>+{credits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginBottom: 4 }}>DEBITED (PAGE)</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>-{debits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        {/* Daily Bonus */}
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 16, padding: '24px 28px',
          boxShadow: bonusState === 'claimed' ? `0 0 30px ${C.gold}33` : 'none',
          transition: 'box-shadow 0.5s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Daily Bonus</div>
              <div style={{ fontSize: 13, color: C.textDim }}>
                {bonusState === 'claimed'
                  ? '500 VCOIN added to your balance!'
                  : bonusState === 'error'
                  ? bonusError
                  : 'Claim 500 free VCOIN every day. Resets at midnight.'}
              </div>
            </div>
            <button
              onClick={claimBonus}
              disabled={bonusState !== 'idle'}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none', cursor: bonusState === 'idle' ? 'pointer' : 'not-allowed',
                background: bonusState === 'claimed'
                  ? `linear-gradient(135deg, ${C.green}, #00aa55)`
                  : bonusState === 'error'
                  ? `linear-gradient(135deg, ${C.red}88, #aa224488)`
                  : bonusState === 'claiming'
                  ? `${C.gold}88`
                  : `linear-gradient(135deg, ${C.gold}, #ff8c00)`,
                color: bonusState === 'idle' ? '#0d0618' : '#fff',
                fontSize: 14, fontWeight: 900, letterSpacing: 2,
                transition: 'all 0.3s',
                opacity: bonusState === 'claiming' ? 0.7 : 1,
              }}
            >
              {bonusState === 'claiming' ? 'CLAIMING…' : bonusState === 'claimed' ? '✓ CLAIMED' : bonusState === 'error' ? 'UNAVAILABLE' : 'CLAIM 500 VCOIN'}
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Play Neon Palace', icon: '🎰', action: () => router.push('/games/neon-palace'), color: C.purple },
            { label: 'Leaderboard', icon: '🏆', action: () => router.push('/leaderboard'), color: C.gold },
            { label: 'Spin History', icon: '📋', action: () => router.push('/history'), color: C.teal },
            { label: 'Dashboard', icon: '👤', action: () => router.push('/dashboard'), color: C.magenta },
          ].map(({ label, icon, action, color }) => (
            <button key={label} onClick={action} style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              color: C.text, fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}11`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.background = C.card; }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Transaction history */}
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: 1 }}>TRANSACTION HISTORY</div>
            <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1 }}>PAGE {page} / {totalPages}</div>
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: C.textDim }}>No transactions yet</div>
          ) : (
            entries.map((entry, i) => (
              <div key={entry.id} style={{
                padding: '14px 24px',
                borderBottom: i < entries.length - 1 ? `1px solid ${C.cardBorder}44` : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: entry.type === 'CREDIT' ? `${C.green}22` : `${C.red}22`,
                  border: `1px solid ${entry.type === 'CREDIT' ? C.green : C.red}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {entryIcon(entry)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{entryLabel(entry)}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{formatDate(entry.createdAt)}</div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 800,
                    color: entry.type === 'CREDIT' ? C.green : C.red,
                  }}>
                    {entry.type === 'CREDIT' ? '+' : '-'}{parseFloat(entry.amount).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>
                    bal: {parseFloat(entry.balanceAfter).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.cardBorder}`, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button
                onClick={() => loadPage(page - 1)} disabled={page <= 1}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.cardBorder}`,
                  background: 'transparent', color: page <= 1 ? C.textDim : C.text,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}
              >← PREV</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => loadPage(p)} style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: `1px solid ${p === page ? C.gold : C.cardBorder}`,
                    background: p === page ? `${C.gold}22` : 'transparent',
                    color: p === page ? C.gold : C.textDim,
                    cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 800 : 600,
                  }}>{p}</button>
                );
              })}
              <button
                onClick={() => loadPage(page + 1)} disabled={page >= totalPages}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.cardBorder}`,
                  background: 'transparent', color: page >= totalPages ? C.textDim : C.text,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}
              >NEXT →</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
