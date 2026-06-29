'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, type UserProfile, type WalletBalance } from '../../lib/api-user';
import { authClient } from '../../lib/auth-client';
import { apiClient } from '../../lib/api-client';

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
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Profile</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-400">Username</dt>
                <dd className="font-medium">{profile.username}</dd>
              </div>
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
