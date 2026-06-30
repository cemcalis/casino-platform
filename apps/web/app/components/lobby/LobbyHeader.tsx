'use client';

import { useRouter } from 'next/navigation';
import { LC } from './theme';

interface LobbyHeaderProps {
  eyebrow?: string;
  title: string;
  rightLabel?: string;
  rightHref?: string;
}

/** Sticky top nav shared by every lobby platform page (Profile, Tournaments,
 * Notifications, Settings, Search) — keeps "back to lobby" + branding consistent. */
export default function LobbyHeader({ eyebrow, title, rightLabel, rightHref }: LobbyHeaderProps) {
  const router = useRouter();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: `${LC.surface}e0`,
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${LC.cardBorder}`,
        padding: '0 20px',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            color: LC.textDim,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: 1,
            padding: '8px 10px',
            borderRadius: 8,
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = LC.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = LC.textDim; }}
        >
          ← LOBBY
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
          {eyebrow && (
            <div style={{ fontSize: 9, color: LC.gold, letterSpacing: 3, fontWeight: 700 }}>
              {eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: 2,
              background: `linear-gradient(90deg, ${LC.gold}, ${LC.goldBright})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '60vw',
            }}
          >
            {title}
          </div>
        </div>

        {rightLabel ? (
          <button
            onClick={() => rightHref && router.push(rightHref)}
            style={{
              background: 'none',
              border: 'none',
              color: LC.textDim,
              cursor: rightHref ? 'pointer' : 'default',
              fontSize: 12,
              letterSpacing: 1,
              flexShrink: 0,
              padding: '8px 10px',
            }}
          >
            {rightLabel}
          </button>
        ) : (
          <div style={{ width: 64, flexShrink: 0 }} />
        )}
      </div>
    </nav>
  );
}
