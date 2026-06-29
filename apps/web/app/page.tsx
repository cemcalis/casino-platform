'use client';

import { useState } from 'react';
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

const MOCK_GAMES = [
  { id: 'neon-palace-slots', name: 'Neon Palace Slots',  category: 'SLOTS',   rtpPercent: 96.5, badgeText: 'HOT' },
  { id: 'cyber-roulette',    name: 'Cyber Roulette',     category: 'TABLE',   rtpPercent: 97.3 },
  { id: 'gold-rush-crash',   name: 'Gold Rush Crash',    category: 'CRASH',   rtpPercent: 97.0, badgeText: 'NEW' },
  { id: 'royal-blackjack',   name: 'Royal Blackjack',    category: 'TABLE',   rtpPercent: 99.5 },
  { id: 'dice-fever',        name: 'Dice Fever',         category: 'DICE',    rtpPercent: 98.0 },
  { id: 'instant-gems',      name: 'Instant Gems',       category: 'INSTANT', rtpPercent: 95.0 },
] as const;

const MOCK_HISTORY: HistoryEntry[] = [
  { roundId: 'round-001abc', bet: '50',  outcome: 'WIN',  payout: '250',  timestamp: new Date(Date.now() - 60_000) },
  { roundId: 'round-002xyz', bet: '100', outcome: 'LOSS', payout: '0',    timestamp: new Date(Date.now() - 120_000) },
  { roundId: 'round-003qrs', bet: '25',  outcome: 'WIN',  payout: '75',   timestamp: new Date(Date.now() - 180_000) },
  { roundId: 'round-004mnp', bet: '50',  outcome: 'LOSS', payout: '0',    timestamp: new Date(Date.now() - 240_000) },
  { roundId: 'round-005def', bet: '200', outcome: 'WIN',  payout: '1000', timestamp: new Date(Date.now() - 300_000) },
];

export default function LobbyPage() {
  const [settings, setSettings] = useState({
    musicVolume:    60,
    sfxVolume:      80,
    ambientVolume:  40,
    animationsEnabled: true,
  });

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
      <BalancePanel balance="12,500.00" currency="VCOIN" />
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
            <HistoryPanel entries={MOCK_HISTORY} maxRows={5} />

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
