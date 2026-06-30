'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface GameMeta {
  name: string;
  category: string;
  rtpPercent: number;
  description: string;
  releaseHint: string;
  accentColor: string;
  icon: string;
  features: { label: string; value: string }[];
}

const GAME_REGISTRY: Record<string, GameMeta> = {
  'cyber-roulette': {
    name: 'Cyber Roulette',
    category: 'TABLE',
    rtpPercent: 97.3,
    description:
      'High-stakes European Roulette in a cyberpunk city. Place your bets across neon-lit numbers as the city hums with electricity. Single-zero wheel, authentic physics, live leaderboards.',
    releaseHint: 'Q3 2026',
    accentColor: '#00e5ff',
    icon: '🎡',
    features: [
      { label: 'Wheel', value: 'European Single-Zero' },
      { label: 'Min Bet', value: '10 VCOIN' },
      { label: 'Max Bet', value: '50,000 VCOIN' },
    ],
  },
  'gold-rush-crash': {
    name: 'Gold Rush Crash',
    category: 'CRASH',
    rtpPercent: 97.0,
    description:
      'Watch the multiplier rocket skyward — cash out before the crash! The higher you hold, the bigger the reward. Provably fair outcomes, real-time multiplier chart, instant settlements.',
    releaseHint: 'Q3 2026',
    accentColor: '#f4c430',
    icon: '🚀',
    features: [
      { label: 'Max Multiplier', value: '1,000×' },
      { label: 'Auto Cash-Out', value: 'Supported' },
      { label: 'Live Chat', value: 'In-game' },
    ],
  },
  'royal-blackjack': {
    name: 'Royal Blackjack',
    category: 'TABLE',
    rtpPercent: 99.5,
    description:
      'Classic 21 with a royal twist. The highest RTP in the palace — pure strategy, low house edge. Supports split, double-down, and insurance with Vegas-rule precision.',
    releaseHint: 'Q4 2026',
    accentColor: '#a855f7',
    icon: '🃏',
    features: [
      { label: 'Decks', value: '6-Deck Shoe' },
      { label: 'Dealer Hits', value: 'Soft 17' },
      { label: 'Side Bets', value: 'Perfect Pairs' },
    ],
  },
  'dice-fever': {
    name: 'Dice Fever',
    category: 'DICE',
    rtpPercent: 98.0,
    description:
      'Roll the virtual dice and predict the outcome. Bet over/under with variable targets — the narrower your range, the higher the multiplier. Provably fair, instant results.',
    releaseHint: 'Q4 2026',
    accentColor: '#22c55e',
    icon: '🎲',
    features: [
      { label: 'Win Chance', value: '1% – 98%' },
      { label: 'Max Win', value: '9,900×' },
      { label: 'Fairness', value: 'Provably Fair' },
    ],
  },
  'instant-gems': {
    name: 'Instant Gems',
    category: 'INSTANT',
    rtpPercent: 95.0,
    description:
      'Scratch the surface, reveal your fortune. Match three gems to unlock multipliers, bonus rounds, and jackpot tiles. Instant win mechanics — no spinning, no waiting.',
    releaseHint: 'Q2 2026',
    accentColor: '#ec4899',
    icon: '💎',
    features: [
      { label: 'Cards per Play', value: '1 or 3' },
      { label: 'Top Prize', value: '5,000× Bet' },
      { label: 'Bonus Tile', value: 'Gem Cascade' },
    ],
  },
};

export default function ComingSoonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const game = GAME_REGISTRY[slug];

  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setNotified(true);
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-2xl font-bold">Game not found</p>
        <Link href="/" className="text-yellow-400 hover:text-yellow-300 text-sm underline">
          ← Back to Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-white text-sm tracking-widest transition-colors"
        >
          ← NEON PALACE
        </button>
        <button
          onClick={() => router.push('/games/neon-palace')}
          className="text-xs tracking-widest px-4 py-2 rounded-lg font-bold transition-all"
          style={{
            background: `linear-gradient(135deg, #f4c430, #e6a817)`,
            color: '#0d0618',
          }}
        >
          PLAY LIVE →
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-10">
        {/* Icon + glow */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full blur-3xl opacity-30"
            style={{
              width: '200px',
              height: '200px',
              background: game.accentColor,
            }}
          />
          <div
            className="relative z-10 w-28 h-28 rounded-2xl flex items-center justify-center text-6xl"
            style={{
              background: 'linear-gradient(135deg, #1a0e2e, #12091f)',
              border: `1px solid ${game.accentColor}40`,
              boxShadow: `0 0 40px ${game.accentColor}30`,
            }}
          >
            {game.icon}
          </div>
        </div>

        {/* Title block */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-xs font-bold tracking-widest px-3 py-1 rounded-full"
              style={{
                background: `${game.accentColor}20`,
                color: game.accentColor,
                border: `1px solid ${game.accentColor}40`,
              }}
            >
              {game.category}
            </span>
            <span className="text-xs text-gray-500 tracking-widest">{game.rtpPercent.toFixed(1)}% RTP</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight">{game.name}</h1>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #f4c43020, #f4c43008)',
              border: '1px solid #f4c43040',
              color: '#f4c430',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#f4c430' }}
            />
            COMING SOON &mdash; {game.releaseHint}
          </div>

          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">{game.description}</p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {game.features.map((f) => (
            <div
              key={f.label}
              className="rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, #1a0e2e80, #12091f80)',
                border: `1px solid ${game.accentColor}20`,
              }}
            >
              <div
                className="text-sm font-bold mb-1"
                style={{ color: game.accentColor }}
              >
                {f.value}
              </div>
              <div className="text-xs text-gray-500 tracking-wider uppercase">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Notify form */}
        <div
          className="w-full rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, #1a0e2e, #12091f)',
            border: '1px solid #2a1f3d',
          }}
        >
          {notified ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-2xl">✓</span>
              <p className="text-sm font-semibold" style={{ color: game.accentColor }}>
                You&apos;re on the list!
              </p>
              <p className="text-xs text-gray-500">We&apos;ll notify you when {game.name} goes live.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-white mb-1">Get notified at launch</p>
              <p className="text-xs text-gray-500 mb-4">
                Be the first to play and earn a 500 VCOIN launch bonus.
              </p>
              <form onSubmit={handleNotify} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${game.accentColor}, ${game.accentColor}cc)`,
                    color: '#0d0618',
                  }}
                >
                  NOTIFY ME
                </button>
              </form>
            </>
          )}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl text-sm tracking-widest border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
          >
            ← LOBBY
          </button>
          <button
            onClick={() => router.push('/games/neon-palace')}
            className="flex-1 py-3 rounded-xl text-sm tracking-widest font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #f4c430, #e6a817)',
              color: '#0d0618',
            }}
          >
            PLAY NEON PALACE
          </button>
        </div>

        <p className="text-xs text-gray-700 text-center">
          NEON PALACE &mdash; Social Casino &mdash; No Real-Money Gambling
        </p>
      </main>
    </div>
  );
}
