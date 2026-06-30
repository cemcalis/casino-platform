'use client';

import { useMemo, useState } from 'react';
import LobbyHeader from '../components/lobby/LobbyHeader';
import { LC, LOBBY_BASE_CSS } from '../components/lobby/theme';

// ── Demo-safe mock data ──────────────────────────────────────────────────────
type NotifType = 'win' | 'bonus' | 'tournament' | 'vip' | 'system';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'N-1', type: 'win', title: 'Big Win!', message: 'You won 4,820 VCOIN on Neon Palace Slots.', time: '5m ago', read: false },
  { id: 'N-2', type: 'tournament', title: 'Tournament Starting Soon', message: 'Neon Palace Showdown starts in 30 minutes — join now.', time: '22m ago', read: false },
  { id: 'N-3', type: 'bonus', title: 'Daily Bonus Ready', message: 'Your 1,000 VCOIN daily bonus is ready to claim.', time: '1h ago', read: false },
  { id: 'N-4', type: 'vip', title: 'VIP Tier Progress', message: "You're 18,500 VCOIN away from Platinum tier.", time: '3h ago', read: true },
  { id: 'N-5', type: 'system', title: 'Scheduled Maintenance', message: 'Brief maintenance window tonight at 3:00 AM UTC.', time: '6h ago', read: true },
  { id: 'N-6', type: 'win', title: 'Free Spins Triggered', message: 'You unlocked 8 free spins on Gonzo\'s Quest.', time: '1d ago', read: true },
  { id: 'N-7', type: 'bonus', title: 'Weekly Cashback Credited', message: '7% cashback (1,240 VCOIN) added to your wallet.', time: '2d ago', read: true },
  { id: 'N-8', type: 'tournament', title: 'Tournament Results', message: 'Gonzo Quest Gauntlet ended — you placed #14.', time: '3d ago', read: true },
];

const TYPE_META: Record<NotifType, { icon: string; color: string; label: string }> = {
  win: { icon: '🏆', color: LC.gold, label: 'Win' },
  bonus: { icon: '🎁', color: LC.green, label: 'Bonus' },
  tournament: { icon: '⚔️', color: LC.magenta, label: 'Tournament' },
  vip: { icon: '👑', color: LC.purple, label: 'VIP' },
  system: { icon: '⚙️', color: LC.cyan, label: 'System' },
};

const FILTERS = ['All', 'Unread', 'Win', 'Bonus', 'Tournament', 'VIP', 'System'] as const;
type FilterType = (typeof FILTERS)[number];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterType>('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (filter === 'All') return notifications;
    if (filter === 'Unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => TYPE_META[n.type].label === filter);
  }, [notifications, filter]);

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div style={{ minHeight: '100vh', background: LC.bg, fontFamily: "'Outfit', sans-serif", color: LC.text }}>
      <style>{LOBBY_BASE_CSS}</style>
      <LobbyHeader eyebrow={`${unreadCount} UNREAD`} title="NOTIFICATIONS" rightLabel="SETTINGS →" rightHref="/settings" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Notifications</h1>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            style={{
              background: 'transparent',
              border: `1px solid ${LC.cardBorder}`,
              color: unreadCount === 0 ? LC.textFaint : LC.gold,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Mark all as read
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: `1px solid ${filter === f ? LC.gold : LC.cardBorder}`,
                background: filter === f ? `${LC.gold}1a` : 'transparent',
                color: filter === f ? LC.gold : LC.textDim,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: LC.textDim }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
              No notifications here.
            </div>
          ) : (
            filtered.map((n) => {
              const meta = TYPE_META[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: n.read ? LC.card : `${meta.color}0f`,
                    border: `1px solid ${n.read ? LC.cardBorder : `${meta.color}44`}`,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `${meta.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{n.title}</span>
                      <span style={{ fontSize: 10, color: LC.textFaint, flexShrink: 0 }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: LC.textDim, marginTop: 4, lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 4 }} />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: LC.textFaint,
                      cursor: 'pointer',
                      fontSize: 14,
                      flexShrink: 0,
                      padding: 2,
                    }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
