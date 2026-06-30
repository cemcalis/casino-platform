'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CasinoShell,
  CasinoLobbyLayout,
  BalancePanel,
  GameCard,
  JackpotBanner,
  HistoryPanel,
  SettingsPanel,
} from '@casino/ui';
import type { HistoryEntry } from '@casino/ui';
import Link from 'next/link';
import { userApi } from '../lib/api-user';
import { authClient } from '../lib/auth-client';
import { gameApi } from '../lib/api-game';

const MOCK_GAMES = [
  { id: 'neon-palace-slots', slug: 'neon-palace',    name: 'Neon Palace Slots',  category: 'SLOTS',   rtpPercent: 96.5, badgeText: 'HOT',  live: true },
  { id: 'cyber-roulette',    slug: 'cyber-roulette', name: 'Cyber Roulette',     category: 'TABLE',   rtpPercent: 97.3,                    live: false },
  { id: 'gold-rush-crash',   slug: 'gold-rush-crash',name: 'Gold Rush Crash',    category: 'CRASH',   rtpPercent: 97.0, badgeText: 'NEW',  live: false },
  { id: 'royal-blackjack',   slug: 'royal-blackjack',name: 'Royal Blackjack',    category: 'TABLE',   rtpPercent: 99.5,                    live: false },
  { id: 'dice-fever',        slug: 'dice-fever',     name: 'Dice Fever',         category: 'DICE',    rtpPercent: 98.0,                    live: false },
  { id: 'instant-gems',      slug: 'instant-gems',   name: 'Instant Gems',       category: 'INSTANT', rtpPercent: 95.0,                    live: false },
] as const;

interface AuthState {
  token: string;
  username: string;
  balance: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState({
    musicVolume:    60,
    sfxVolume:      80,
    ambientVolume:  40,
    animationsEnabled: true,
  });

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([userApi.getProfile(token), userApi.getWallet(token)])
      .then(([profile, wallet]) => {
        setAuth({
          token,
          username: profile.username,
          balance: parseFloat(wallet.balance).toLocaleString('en-US', { maximumFractionDigits: 0 }),
        });
      })
      .catch(() => {
        sessionStorage.removeItem('accessToken');
      });

    gameApi
      .getHistory(token)
      .then((data) => {
        setHistory(
          data.sessions.slice(0, 5).map((s) => ({
            roundId: s.serverSeed,
            bet: s.betAmount,
            outcome: parseFloat(s.winAmount) > 0 ? ('WIN' as const) : ('LOSS' as const),
            payout: parseFloat(s.winAmount).toFixed(0),
            timestamp: new Date(s.createdAt),
          })),
        );
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await authClient.logout();
    } catch {
      // clear session regardless
    }
    sessionStorage.removeItem('accessToken');
    setAuth(null);
    setHistory([]);
  }

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--np-space-6)',
        height: '64px',
      }}
    >
      <span
        style={{
          fontSize: 'var(--np-text-xl)',
          fontWeight: 'var(--np-font-extrabold)',
          color: 'var(--np-gold)',
          letterSpacing: 'var(--np-tracking-display)',
        }}
      >
        NEON PALACE
      </span>

      {auth ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--np-space-4)' }}>
          <BalancePanel balance={auth.balance} currency="VCOIN" />
          <span
            style={{
              fontSize: 'var(--np-text-sm)',
              color: 'var(--np-text-secondary)',
              letterSpacing: 'var(--np-tracking-wider)',
            }}
          >
            {auth.username}
          </span>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid var(--np-border-subtle)',
              borderRadius: '8px',
              color: 'var(--np-text-secondary)',
              fontSize: 'var(--np-text-xs)',
              letterSpacing: 'var(--np-tracking-wider)',
              cursor: 'pointer',
            }}
          >
            DASHBOARD
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid var(--np-border-subtle)',
              borderRadius: '8px',
              color: 'var(--np-text-muted)',
              fontSize: 'var(--np-text-xs)',
              letterSpacing: 'var(--np-tracking-wider)',
              cursor: 'pointer',
            }}
          >
            SIGN OUT
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--np-space-3)' }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '6px 18px',
              backgroundColor: 'transparent',
              border: '1px solid var(--np-border-subtle)',
              borderRadius: '8px',
              color: 'var(--np-text-secondary)',
              fontSize: 'var(--np-text-xs)',
              letterSpacing: 'var(--np-tracking-wider)',
              cursor: 'pointer',
            }}
          >
            SIGN IN
          </button>
          <button
            onClick={() => router.push('/register')}
            style={{
              padding: '6px 18px',
              backgroundColor: 'var(--np-gold)',
              border: 'none',
              borderRadius: '8px',
              color: '#0d0618',
              fontSize: 'var(--np-text-xs)',
              fontWeight: 'var(--np-font-bold)',
              letterSpacing: 'var(--np-tracking-wider)',
              cursor: 'pointer',
            }}
          >
            JOIN FREE
          </button>
        </div>
      )}
    </div>
  );

  const hero = (
    <div style={{ padding: 'var(--np-space-6) var(--np-space-6) 0' }}>
      <JackpotBanner amount="2,500,000" currency="VCOIN" label="PROGRESSIVE JACKPOT" />
    </div>
  );

  const footer = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--np-space-4)',
        color: 'var(--np-text-muted)',
        fontSize: 'var(--np-text-xs)',
      }}
    >
      <span>NEON PALACE &mdash; Social Casino &mdash; No Real-Money Gambling</span>
      <Link
        href="/leaderboard"
        style={{
          color: 'var(--np-gold)',
          textDecoration: 'none',
          fontSize: 'var(--np-text-xs)',
          letterSpacing: 'var(--np-tracking-wider)',
        }}
      >
        LEADERBOARD
      </Link>
    </div>
  );

  return (
    <CasinoShell>
      <CasinoLobbyLayout header={header} hero={hero} footer={footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--np-space-8)' }}>

          {/* Game Grid */}
          <section aria-labelledby="games-heading">
            <h2
              id="games-heading"
              style={{
                margin: '0 0 var(--np-space-4)',
                fontSize: 'var(--np-text-lg)',
                fontWeight: 'var(--np-font-semibold)',
                color: 'var(--np-text-primary)',
                letterSpacing: 'var(--np-tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              Games
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--np-space-4)',
              }}
            >
              {MOCK_GAMES.map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  name={game.name}
                  category={game.category}
                  rtpPercent={game.rtpPercent}
                  badgeText={'badgeText' in game ? game.badgeText : undefined}
                  onClick={() => router.push(`/games/${game.slug}`)}
                />
              ))}
            </div>
          </section>

          {/* Bottom panels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--np-space-6)',
              alignItems: 'start',
            }}
          >
            <HistoryPanel entries={history} maxRows={5} />

            <SettingsPanel
              musicVolume={settings.musicVolume}
              sfxVolume={settings.sfxVolume}
              ambientVolume={settings.ambientVolume}
              animationsEnabled={settings.animationsEnabled}
              onMusicVolumeChange={(v) => setSettings((s) => ({ ...s, musicVolume: v }))}
              onSfxVolumeChange={(v) => setSettings((s) => ({ ...s, sfxVolume: v }))}
              onAmbientVolumeChange={(v) => setSettings((s) => ({ ...s, ambientVolume: v }))}
              onAnimationsToggle={(v) => setSettings((s) => ({ ...s, animationsEnabled: v }))}
            />
          </div>
        </div>
      </CasinoLobbyLayout>
    </CasinoShell>
  );
}
