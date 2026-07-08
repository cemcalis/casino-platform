'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

interface Player {
  id: string;
  email: string;
  username: string;
  isBanned: boolean;
  bannedAt: string | null;
  lastLogin: string | null;
  createdAt: string;
  balance: string;
}

interface PlayerDetail extends Player {
  role: string;
  totalBet: string;
  totalWon: string;
  totalSpins: number;
  vipTier: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ─── Mock adapter — used when no token / API unavailable ─────────────────────
const MOCK_PLAYERS: Player[] = [
  { id: 'mock-1', email: 'ace@example.com', username: 'ace_king99', isBanned: false, bannedAt: null, lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2025-01-15T00:00:00Z', balance: '12480.00' },
  { id: 'mock-2', email: 'rose@example.com', username: 'midnight_rose', isBanned: false, bannedAt: null, lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-02-20T00:00:00Z', balance: '3240.00' },
  { id: 'mock-3', email: 'vortex@example.com', username: 'vortex_x', isBanned: true, bannedAt: '2026-05-01T00:00:00Z', lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(), createdAt: '2025-03-10T00:00:00Z', balance: '0.00' },
  { id: 'mock-4', email: 'knight@example.com', username: 'dark_knight', isBanned: false, bannedAt: null, lastLogin: new Date(Date.now() - 1800000).toISOString(), createdAt: '2025-04-05T00:00:00Z', balance: '540.00' },
  { id: 'mock-5', email: 'storm@example.com', username: 'silver_storm', isBanned: false, bannedAt: null, lastLogin: new Date(Date.now() - 900000).toISOString(), createdAt: '2025-05-18T00:00:00Z', balance: '8910.00' },
  { id: 'mock-6', email: 'phoenix@example.com', username: 'neon_phoenix', isBanned: false, bannedAt: null, lastLogin: new Date(Date.now() - 120000).toISOString(), createdAt: '2025-06-01T00:00:00Z', balance: '21000.00' },
];

function mockDetail(p: Player): PlayerDetail {
  const bet = parseFloat(p.balance) * 20;
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const thresholds = [0, 1000, 10000, 50000];
  const tierIdx = thresholds.filter(t => bet >= t).length - 1;
  return { ...p, role: 'PLAYER', totalBet: bet.toFixed(2), totalWon: (bet * 0.962).toFixed(2), totalSpins: Math.floor(bet / 50), vipTier: tiers[tierIdx] ?? 'Bronze' };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function relativeTime(iso: string | null) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function fmt(n: string) {
  return parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const VIP_COLOR: Record<string, string> = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#f4c430', Platinum: '#e5e4e2' };

// ─── Drawer ───────────────────────────────────────────────────────────────────
function PlayerDrawer({ player, onClose, onBanToggle }: {
  player: PlayerDetail;
  onClose: () => void;
  onBanToggle: (id: string, ban: boolean) => Promise<void>;
}) {
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  async function handleBanToggle() {
    setActing(true);
    setError('');
    try {
      await onBanToggle(player.id, !player.isBanned);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActing(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#1a0d30', borderLeft: '1px solid rgba(244,196,48,0.2)',
        zIndex: 201, overflowY: 'auto', padding: 28,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f0e8ff' }}>{player.username}</div>
            <div style={{ fontSize: 13, color: '#a08bc0', marginTop: 4 }}>{player.email}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a08bc0', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
            background: player.isBanned ? '#ff2d7820' : '#4ade8020',
            color: player.isBanned ? '#ff2d78' : '#4ade80',
            border: `1px solid ${player.isBanned ? '#ff2d7840' : '#4ade8040'}`,
          }}>
            {player.isBanned ? 'BANNED' : 'ACTIVE'}
          </span>
          <span style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: `${VIP_COLOR[player.vipTier] ?? '#cd7f32'}22`,
            color: VIP_COLOR[player.vipTier] ?? '#cd7f32',
            border: `1px solid ${VIP_COLOR[player.vipTier] ?? '#cd7f32'}44`,
          }}>
            {player.vipTier}
          </span>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Balance', value: `${fmt(player.balance)} VCOIN`, color: '#4ade80' },
            { label: 'Total Bet', value: `${fmt(player.totalBet)} VCOIN`, color: '#f4c430' },
            { label: 'Total Won', value: `${fmt(player.totalWon)} VCOIN`, color: '#00d4c8' },
            { label: 'Total Spins', value: player.totalSpins.toLocaleString(), color: '#a855f7' },
          ].map(s => (
            <div key={s.label} style={{ background: '#251240', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(240,232,255,0.07)' }}>
              <div style={{ fontSize: 11, color: '#a08bc0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div style={{ background: '#251240', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid rgba(240,232,255,0.07)' }}>
          {[
            { label: 'Last Login', value: relativeTime(player.lastLogin) },
            { label: 'Joined', value: new Date(player.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
            { label: 'Role', value: player.role },
            ...(player.isBanned && player.bannedAt ? [{ label: 'Banned At', value: new Date(player.bannedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }] : []),
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(240,232,255,0.05)' }}>
              <span style={{ fontSize: 13, color: '#a08bc0' }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#f0e8ff', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#ff2d78', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {/* Ban / Unban */}
        <button
          onClick={handleBanToggle}
          disabled={acting}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: acting ? 'not-allowed' : 'pointer', border: 'none', opacity: acting ? 0.6 : 1,
            background: player.isBanned
              ? 'linear-gradient(135deg, #4ade80, #22c55e)'
              : 'linear-gradient(135deg, #ff2d78, #cc1155)',
            color: '#fff',
          }}
        >
          {acting ? '…' : player.isBanned ? 'Unban Player' : 'Ban Player'}
        </button>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlayersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlayerDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem('accessToken');
    setToken(t);
  }, []);

  const fetchPlayers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      if (!token) { setUseMock(true); throw new Error('no token'); }
      const params = new URLSearchParams({ page: String(page), pageSize: '20', search, status: statusFilter });
      const res = await fetch(`${API}/users/admin/players?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { players: Player[]; pagination: Pagination };
      setPlayers(data.players);
      setPagination(data.pagination);
      setUseMock(false);
    } catch {
      // Fall back to mock data filtered client-side
      setUseMock(true);
      let filtered = MOCK_PLAYERS;
      if (search) filtered = filtered.filter(p => p.username.includes(search) || p.email.includes(search));
      if (statusFilter === 'banned') filtered = filtered.filter(p => p.isBanned);
      if (statusFilter === 'active') filtered = filtered.filter(p => !p.isBanned);
      setPlayers(filtered);
      setPagination({ page: 1, pageSize: 20, total: filtered.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter]);

  useEffect(() => { fetchPlayers(1); }, [fetchPlayers]);

  async function openDrawer(player: Player) {
    setDrawerLoading(true);
    try {
      if (useMock || !token) {
        setSelected(mockDetail(player));
        return;
      }
      const res = await fetch(`${API}/users/admin/players/${player.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setSelected(await res.json() as PlayerDetail);
    } catch {
      setSelected(mockDetail(player));
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleBanToggle(id: string, ban: boolean) {
    if (useMock || !token) {
      // Update mock state
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, isBanned: ban, bannedAt: ban ? new Date().toISOString() : null } : p));
      setSelected(prev => prev && prev.id === id ? { ...prev, isBanned: ban, bannedAt: ban ? new Date().toISOString() : null } : prev);
      return;
    }
    const action = ban ? 'ban' : 'unban';
    const res = await fetch(`${API}/users/admin/players/${id}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error((await res.json() as { message?: string }).message ?? 'Failed');
    const updated = await res.json() as { id: string; isBanned: boolean; bannedAt: string | null };
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    setSelected(prev => prev && prev.id === id ? { ...prev, ...updated } : prev);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0618; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0d0618; } ::-webkit-scrollbar-thumb { background: #3d2060; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0d0618', color: '#f0e8ff', fontFamily: 'Inter, sans-serif', padding: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <a href="/admin" style={{ color: '#a08bc0', fontSize: 13, textDecoration: 'none' }}>← Dashboard</a>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0e8ff' }}>Player Management</h1>
            <p style={{ color: '#a08bc0', fontSize: 13, marginTop: 4 }}>
              {useMock ? ' Mock data — API unavailable or not authenticated' : `${pagination.total.toLocaleString()} total players`}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a08bc0' }}></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search username or email…"
              style={{ width: '100%', background: '#251240', border: '1px solid rgba(240,232,255,0.1)', borderRadius: 10, padding: '10px 12px 10px 36px', color: '#f0e8ff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['', 'All'], ['active', 'Active'], ['banned', 'Banned']].map(([val, label]) => (
              <button key={val} onClick={() => setStatusFilter(val)}
                style={{
                  padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: statusFilter === val ? '#f4c430' : 'rgba(240,232,255,0.07)',
                  color: statusFilter === val ? '#0d0618' : '#a08bc0',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(240,232,255,0.07)' }}>
                  {['Username', 'Email', 'Balance', 'Status', 'Last Login', 'Joined', 'Actions'].map(col => (
                    <th key={col} style={{ padding: '12px 20px', textAlign: 'left', color: '#a08bc0', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#a08bc0' }}>Loading…</td></tr>
                ) : players.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#a08bc0' }}>No players found</td></tr>
                ) : players.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'rgba(240,232,255,0.02)' : 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,196,48,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(240,232,255,0.02)' : 'transparent')}>
                    <td style={{ padding: '13px 20px', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{p.username}</td>
                    <td style={{ padding: '13px 20px', color: '#a08bc0', fontSize: 13, whiteSpace: 'nowrap' }}>{p.email}</td>
                    <td style={{ padding: '13px 20px', color: '#4ade80', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{fmt(p.balance)} VC</td>
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                        background: p.isBanned ? '#ff2d7820' : '#4ade8020',
                        color: p.isBanned ? '#ff2d78' : '#4ade80',
                      }}>
                        {p.isBanned ? 'BANNED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', color: '#a08bc0', fontSize: 13, whiteSpace: 'nowrap' }}>{relativeTime(p.lastLogin)}</td>
                    <td style={{ padding: '13px 20px', color: '#a08bc0', fontSize: 13, whiteSpace: 'nowrap' }}>{new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openDrawer(p)}
                          disabled={drawerLoading}
                          style={{ background: 'rgba(0,212,200,0.12)', border: '1px solid rgba(0,212,200,0.3)', color: '#00d4c8', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                          View
                        </button>
                        <button
                          onClick={async () => {
                            try { await handleBanToggle(p.id, !p.isBanned); } catch {}
                          }}
                          style={{ background: p.isBanned ? 'rgba(74,222,128,0.1)' : 'rgba(255,45,120,0.1)', border: `1px solid ${p.isBanned ? 'rgba(74,222,128,0.3)' : 'rgba(255,45,120,0.3)'}`, color: p.isBanned ? '#4ade80' : '#ff2d78', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                          {p.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(240,232,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a08bc0', fontSize: 13 }}>Page {pagination.page} of {pagination.totalPages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => fetchPlayers(pagination.page - 1)} disabled={pagination.page <= 1}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(240,232,255,0.07)', color: '#f0e8ff', fontWeight: 600 }}>←</button>
                <button onClick={() => fetchPlayers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(240,232,255,0.07)', color: '#f0e8ff', fontWeight: 600 }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <PlayerDrawer
          player={selected}
          onClose={() => setSelected(null)}
          onBanToggle={handleBanToggle}
        />
      )}
    </>
  );
}
