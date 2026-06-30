'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LobbyHeader from '../components/lobby/LobbyHeader';
import LobbyCard, { LobbySectionTitle } from '../components/lobby/LobbyCard';
import { LC, LOBBY_BASE_CSS } from '../components/lobby/theme';

// ── Demo-safe mock data ──────────────────────────────────────────────────────
const PROFILE = {
  username: 'NeonRider_88',
  email: 'n••••r88@email.com',
  joined: 'March 12, 2024',
  avatar: '🦊',
  vipTier: 'Gold',
  vipColor: LC.gold,
  country: '🇺🇸 United States',
};

const AVATARS = ['🦊', '🐉', '🦁', '🐯', '🦅', '🐺', '🦈', '🃏'];

const STATS = [
  { label: 'Total Spins', value: '12,480', color: LC.text },
  { label: 'Total Wagered', value: '842,100 VCOIN', color: LC.text },
  { label: 'Total Won', value: '796,420 VCOIN', color: LC.green },
  { label: 'Biggest Win', value: '24,750 VCOIN', color: LC.gold },
  { label: 'Win Rate', value: '47.2%', color: LC.cyan },
  { label: 'Sessions', value: '318', color: LC.text },
];

const ACHIEVEMENTS = [
  { icon: '🏆', title: 'High Roller', desc: 'Wagered over 500,000 VCOIN', unlocked: true },
  { icon: '🔥', title: 'Hot Streak', desc: 'Won 5 spins in a row', unlocked: true },
  { icon: '🎰', title: 'Slot Explorer', desc: 'Played 10 different games', unlocked: true },
  { icon: '💎', title: 'Diamond Hands', desc: 'Reach Diamond VIP tier', unlocked: false },
  { icon: '🌙', title: 'Night Owl', desc: 'Play between 2–4 AM', unlocked: true },
  { icon: '🎯', title: 'Jackpot Hunter', desc: 'Hit a progressive jackpot', unlocked: false },
];

const QUICK_LINKS = [
  { icon: '💰', label: 'Wallet', href: '/wallet' },
  { icon: '👑', label: 'VIP Club', href: '/vip' },
  { icon: '📜', label: 'History', href: '/history' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(PROFILE.avatar);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: LC.bg, fontFamily: "'Outfit', sans-serif", color: LC.text }}>
      <style>{LOBBY_BASE_CSS}</style>
      <LobbyHeader eyebrow="PLAYER" title="PROFILE" rightLabel="SETTINGS →" rightHref="/settings" />

      {/* Hero / identity */}
      <div
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${LC.purple}33 0%, transparent 70%)`,
          padding: '48px 20px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${LC.gold}, ${LC.purple})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              margin: '0 auto',
              border: `3px solid ${PROFILE.vipColor}`,
              boxShadow: `0 0 40px ${PROFILE.vipColor}55`,
            }}
          >
            {avatar}
          </div>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            title="Change avatar"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: LC.card,
              border: `1px solid ${LC.cardBorder}`,
              color: LC.textDim,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ✎
          </button>

          {pickerOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: LC.card,
                border: `1px solid ${LC.cardBorder}`,
                borderRadius: 14,
                padding: 10,
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                width: 220,
                zIndex: 20,
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              }}
            >
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAvatar(a); setPickerOpen(false); }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: a === avatar ? `2px solid ${LC.gold}` : '1px solid transparent',
                    background: 'rgba(255,255,255,0.04)',
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, marginBottom: 6 }}>
          {PROFILE.username}
        </h1>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: LC.textDim }}>
          <span style={{ color: PROFILE.vipColor, fontWeight: 800, letterSpacing: 1 }}>👑 {PROFILE.vipTier} TIER</span>
          <span>·</span>
          <span>{PROFILE.country}</span>
          <span>·</span>
          <span>Member since {PROFILE.joined}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {QUICK_LINKS.map((q) => (
            <button
              key={q.label}
              onClick={() => router.push(q.href)}
              style={{
                background: LC.card,
                border: `1px solid ${LC.cardBorder}`,
                borderRadius: 14,
                padding: '16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: LC.text,
                fontFamily: "'Outfit', sans-serif",
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = LC.gold; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = LC.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: 20 }}>{q.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Account info + Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 20 }} className="lobby-grid-2">
          <LobbyCard>
            <LobbySectionTitle>Account Info</LobbySectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Username', PROFILE.username],
                ['Email', PROFILE.email],
                ['Country', PROFILE.country],
                ['Member Since', PROFILE.joined],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                  <span style={{ color: LC.textDim }}>{label}</span>
                  <span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </LobbyCard>

          <LobbyCard>
            <LobbySectionTitle>Lifetime Stats</LobbySectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              {STATS.map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: LC.textFaint, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </LobbyCard>
        </div>

        {/* Achievements */}
        <LobbyCard>
          <LobbySectionTitle accent={LC.cyan}>Achievements</LobbySectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.title}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: '14px',
                  borderRadius: 12,
                  background: a.unlocked ? 'rgba(0,212,200,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${a.unlocked ? `${LC.cyan}33` : LC.cardBorder}`,
                  opacity: a.unlocked ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: LC.textDim, marginTop: 2 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </LobbyCard>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .lobby-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
