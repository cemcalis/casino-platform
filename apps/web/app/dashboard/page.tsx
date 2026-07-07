'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, type UserProfile, type WalletBalance } from '../../lib/api-user';
import { authClient } from '../../lib/auth-client';
import { apiClient, ApiError } from '../../lib/api-client';
import { bonusApi } from '../../lib/api-bonus';

interface PlayerStats {
  totalSpins: number;
  totalBet: string;
  totalWon: string;
  netResult: string;
  biggestWin: string;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-yellow-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Username edit state
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Daily bonus state
  const [bonusClaiming, setBonusClaiming] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const [bonusNextAt, setBonusNextAt] = useState<Date | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      userApi.getProfile(token),
      userApi.getWallet(token),
      apiClient.get<PlayerStats>('/users/me/stats', token),
    ])
      .then(([p, w, s]) => {
        setProfile(p);
        setWallet(w);
        setStats(s);
      })
      .catch(() => {
        sessionStorage.removeItem('accessToken');
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await authClient.logout().catch(() => {});
    sessionStorage.removeItem('accessToken');
    router.push('/login');
  }

  function startEdit() {
    setNewUsername(profile?.username ?? '');
    setEditError('');
    setEditing(true);
  }

  async function saveUsername() {
    const token = sessionStorage.getItem('accessToken');
    if (!token || !newUsername.trim()) return;

    setEditSaving(true);
    setEditError('');
    try {
      const updated = await apiClient.patch<UserProfile>('/users/me', { username: newUsername.trim() }, token);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update username');
    } finally {
      setEditSaving(false);
    }
  }

  async function claimBonus() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    setBonusClaiming(true);
    setBonusMessage('');
    setBonusNextAt(null);
    try {
      const res = await bonusApi.claimDaily(token);
      setWallet((w) => (w ? { ...w, balance: res.balance } : w));
      setBonusMessage(' +1,000 coins claimed!');
      setBonusNextAt(new Date(res.nextClaimAt));
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const data = err.data as { nextClaimAt?: string } | undefined;
        if (data?.nextClaimAt) setBonusNextAt(new Date(data.nextClaimAt));
        setBonusMessage('Already claimed today');
      } else {
        setBonusMessage('Could not claim bonus — try again');
      }
    } finally {
      setBonusClaiming(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  const netNum = stats ? parseFloat(stats.netResult) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        {profile && (
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-300">Profile</h2>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors uppercase tracking-widest"
                >
                  Edit Username
                </button>
              )}
            </div>
            <dl className="space-y-2">
              <div className="flex justify-between items-center">
                <dt className="text-gray-400">Username</dt>
                {editing ? (
                  <dd className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white w-40 focus:outline-none focus:border-yellow-400"
                      maxLength={32}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') setEditing(false); }}
                    />
                    <button
                      onClick={saveUsername}
                      disabled={editSaving}
                      className="text-xs text-green-400 hover:text-green-300 disabled:opacity-50"
                    >
                      {editSaving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </dd>
                ) : (
                  <dd className="font-medium">{profile.username}</dd>
                )}
              </div>
              {editError && (
                <div className="text-red-400 text-xs text-right">{editError}</div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-400">Email</dt>
                <dd className="font-medium">{profile.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Role</dt>
                <dd className="font-medium capitalize">{profile.role.toLowerCase()}</dd>
              </div>
            </dl>
          </div>
        )}

        {wallet && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Wallet</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-400">{wallet.balance}</span>
              <span className="text-gray-400">coins</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Last updated {new Date(wallet.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Daily Bonus</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={claimBonus}
              disabled={bonusClaiming || bonusNextAt !== null}
              className="w-full py-3 rounded-lg font-bold text-lg bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 transition-colors"
            >
              {bonusClaiming ? 'Claiming…' : 'Claim 1,000 Coins'}
            </button>
            {bonusMessage && (
              <p className={`text-sm text-center ${bonusMessage.startsWith('') ? 'text-green-400' : 'text-gray-400'}`}>
                {bonusMessage}
              </p>
            )}
            {bonusNextAt && (
              <p className="text-xs text-center text-gray-500">
                Next bonus available at {bonusNextAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </p>
            )}
          </div>
        </div>

        {stats && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">All-Time Stats</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Total Spins" value={stats.totalSpins.toLocaleString()} />
              <StatCard label="Total Bet" value={parseFloat(stats.totalBet).toLocaleString('en-US', { maximumFractionDigits: 0 })} />
              <StatCard label="Total Won" value={parseFloat(stats.totalWon).toLocaleString('en-US', { maximumFractionDigits: 0 })} accent />
              <StatCard
                label="Net Result"
                value={(netNum >= 0 ? '+' : '') + netNum.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                accent={netNum >= 0}
              />
              <StatCard label="Biggest Win" value={parseFloat(stats.biggestWin).toLocaleString('en-US', { maximumFractionDigits: 0 })} accent />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-300">
            ← Lobby
          </Link>
          <Link href="/wallet" className="hover:text-gray-300">
            Cashier
          </Link>
          <Link href="/history" className="hover:text-gray-300">
            Spin History
          </Link>
          <Link href="/leaderboard" className="hover:text-gray-300">
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
