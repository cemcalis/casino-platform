'use client';

import { ReactNode } from 'react';
import { LC } from './theme';

interface LobbyCardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}

/** Shared card shell used across the lobby platform pages for consistent depth/border. */
export default function LobbyCard({ children, style, accent }: LobbyCardProps) {
  return (
    <div
      style={{
        background: LC.card,
        border: `1px solid ${accent ? `${accent}44` : LC.cardBorder}`,
        borderRadius: 16,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function LobbySectionTitle({ children, accent }: { children: ReactNode; accent?: string }) {
  return (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: accent ?? LC.gold,
        marginBottom: 18,
      }}
    >
      {children}
    </h2>
  );
}
