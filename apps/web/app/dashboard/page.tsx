'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, type UserProfile, type WalletBalance } from '../../lib/api-user';
import { authClient } from '../../lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([userApi.getProfile(token), userApi.getWallet(token)])
      .then(([p, w]) => {
        setProfile(p);
        setWallet(w);
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

        <p className="text-center text-gray-500 text-sm">
          <Link href="/login" className="hover:text-gray-300">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
