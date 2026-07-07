'use client';

import React from 'react';

/**
 * Shared inline SVG icon set — the product never uses emojis (see design
 * rule). All icons inherit currentColor unless a fill is passed.
 */

export interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const base = (size: number, style?: React.CSSProperties): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  style: { flexShrink: 0, ...style },
  'aria-hidden': true,
});

export function CoinIcon({ size = 16, style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="12" r="10" fill="url(#coinG)" stroke="#a16207" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="6.4" fill="none" stroke="#a16207" strokeWidth="1.1" opacity="0.7" />
      <path d="M12 8.2v7.6M9.8 10.1c0-1 1-1.6 2.2-1.6s2.2.6 2.2 1.5c0 2.4-4.4 1.6-4.4 3.9 0 1 1 1.6 2.2 1.6s2.2-.6 2.2-1.5" stroke="#7c4a03" strokeWidth="1.3" strokeLinecap="round" />
      <defs>
        <linearGradient id="coinG" x1="4" y1="3" x2="20" y2="21">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f4c430" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SlotsIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.7" />
      <path d="M8.5 4v16M15.5 4v16" stroke={color} strokeWidth="1.4" />
      <circle cx="5.8" cy="12" r="1.3" fill={color} />
      <circle cx="12" cy="12" r="1.3" fill={color} />
      <circle cx="18.2" cy="12" r="1.3" fill={color} />
    </svg>
  );
}

export function CardsIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3" y="6" width="11" height="15" rx="2" transform="rotate(-8 3 6)" stroke={color} strokeWidth="1.7" />
      <rect x="10" y="4" width="11" height="15" rx="2" transform="rotate(8 10 4)" stroke={color} strokeWidth="1.7" />
      <path d="M15.6 9.2c.8-1 2.4-.7 2.7.5.2 1-.7 1.9-2 3-1-.6-2.2-1.2-2.4-2.2-.2-1.2 1.2-1.9 1.7-1.3z" fill={color} />
    </svg>
  );
}

export function LiveIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="12" r="3" fill={color} />
      <path d="M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.8 4.8a10.2 10.2 0 000 14.4M19.2 4.8a10.2 10.2 0 010 14.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function JackpotIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M5 9.5C5 6 8 4 12 4s7 2 7 5.5c0 2.4-1.5 4-3.4 4.8l.9 5.2H7.5l.9-5.2C6.5 13.5 5 11.9 5 9.5z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 8v4M10.2 9.2c0-.6.8-1 1.8-1s1.8.4 1.8 1c0 1.5-3.6 1-3.6 2.5 0 .6.8 1 1.8 1s1.8-.4 1.8-1" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function TrophyIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M8 4h8v6a4 4 0 01-8 0V4z" stroke={color} strokeWidth="1.7" />
      <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 14v3M8.5 20h7M10 17h4v3h-4z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CrownIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 8l4 4 4-6 4 6 4-4v9H4V8z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 19h16" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function HeadsetIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M5 13a7 7 0 0114 0" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4" y="13" width="4" height="6" rx="1.6" stroke={color} strokeWidth="1.6" />
      <rect x="16" y="13" width="4" height="6" rx="1.6" stroke={color} strokeWidth="1.6" />
      <path d="M18 19v1a2 2 0 01-2 2h-3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 11l8-7 8 7v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 20v-9z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.5 21v-6h5v6" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function GiftIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="4" y="9" width="16" height="4" stroke={color} strokeWidth="1.6" />
      <rect x="5.5" y="13" width="13" height="8" stroke={color} strokeWidth="1.6" />
      <path d="M12 9v12M12 9C10 9 7.6 8.4 7.6 6.4 7.6 5 8.7 4 10 4c2 0 2 3 2 5zm0 0c2 0 4.4-.6 4.4-2.6C16.4 5 15.3 4 14 4c-2 0-2 3-2 5z" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function WalletIcon({ size = 20, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3" y="6" width="18" height="14" rx="2.5" stroke={color} strokeWidth="1.7" />
      <path d="M3 9.5h13" stroke={color} strokeWidth="1.5" />
      <circle cx="16.8" cy="14.8" r="1.3" fill={color} />
    </svg>
  );
}

export function DiceIcon({ size = 18, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" stroke={color} strokeWidth="1.7" />
      <circle cx="8.7" cy="8.7" r="1.3" fill={color} />
      <circle cx="15.3" cy="8.7" r="1.3" fill={color} />
      <circle cx="12" cy="12" r="1.3" fill={color} />
      <circle cx="8.7" cy="15.3" r="1.3" fill={color} />
      <circle cx="15.3" cy="15.3" r="1.3" fill={color} />
    </svg>
  );
}

/* ── Semantic glyph system ─────────────────────────────────────────────────
 * Data-driven pages store `icon: '<name>'` and render <AppIcon name={...} />.
 * Stroke-based 24×24 paths; color inherits currentColor.
 */

const GLYPH_PATHS: Record<string, React.ReactNode> = {
  slots: <><rect x="3" y="4" width="18" height="16" rx="2.5" strokeWidth="1.7" /><path d="M8.5 4v16M15.5 4v16" strokeWidth="1.4" /><circle cx="5.8" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="18.2" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  gift: <><rect x="4" y="9" width="16" height="4" strokeWidth="1.6" /><rect x="5.5" y="13" width="13" height="8" strokeWidth="1.6" /><path d="M12 9v12M12 9c-2 0-4.4-.6-4.4-2.6C7.6 5 8.7 4 10 4c2 0 2 3 2 5zm0 0c2 0 4.4-.6 4.4-2.6C16.4 5 15.3 4 14 4c-2 0-2 3-2 5z" strokeWidth="1.5" /></>,
  money: <><ellipse cx="12" cy="7" rx="7.5" ry="3" strokeWidth="1.6" /><path d="M4.5 7v10c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V7M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" strokeWidth="1.6" /></>,
  trophy: <><path d="M8 4h8v6a4 4 0 01-8 0V4z" strokeWidth="1.7" /><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 14v3M8.5 20h7M10 17h4v3h-4z" strokeWidth="1.6" /></>,
  crown: <><path d="M4 8l4 4 4-6 4 6 4-4v9H4V8z" strokeWidth="1.7" /><path d="M4 19h16" strokeWidth="1.7" /></>,
  gem: <><path d="M7 4h10l4 5-9 11L3 9l4-5z" strokeWidth="1.6" /><path d="M3 9h18M9.5 9L12 20l2.5-11M7 4l2.5 5L12 4l2.5 5L17 4" strokeWidth="1.2" /></>,
  gold: <><circle cx="12" cy="14" r="6.5" strokeWidth="1.7" /><path d="M12 11v6M10.3 12.4c0-.8.7-1.3 1.7-1.3s1.7.5 1.7 1.2c0 1.9-3.4 1.3-3.4 3.1 0 .8.7 1.3 1.7 1.3s1.7-.5 1.7-1.2M8.5 6.5L7 3h4l1 2.5L13 3h4l-1.5 3.5" strokeWidth="1.3" /></>,
  silver: <><circle cx="12" cy="14" r="6.5" strokeWidth="1.7" /><path d="M10 16.5h4M10.2 11.5h3.4l-3.6 5M8.5 6.5L7 3h4l1 2.5L13 3h4l-1.5 3.5" strokeWidth="1.3" /></>,
  bronze: <><circle cx="12" cy="14" r="6.5" strokeWidth="1.7" /><path d="M10 11.5h3.5c.8 0 .8 2.3-.8 2.3 1.9 0 1.9 2.7 0 2.7H10M8.5 6.5L7 3h4l1 2.5L13 3h4l-1.5 3.5" strokeWidth="1.3" /></>,
  clipboard: <><rect x="5.5" y="4.5" width="13" height="16.5" rx="2" strokeWidth="1.6" /><rect x="9" y="2.8" width="6" height="3.4" rx="1.2" strokeWidth="1.4" /><path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4.5" strokeWidth="1.4" /></>,
  bell: <><path d="M6 16v-5.5a6 6 0 1112 0V16l1.8 2.5H4.2L6 16z" strokeWidth="1.6" /><path d="M10 19.5a2 2 0 004 0" strokeWidth="1.6" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" strokeWidth="1.8" /><path d="M15 15l5.5 5.5" strokeWidth="1.8" /></>,
  spark: <><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" strokeWidth="1.5" /><path d="M18.5 15.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" strokeWidth="1.1" /></>,
  chart: <><path d="M4 20V4" strokeWidth="1.6" /><path d="M4 20h16" strokeWidth="1.6" /><path d="M7.5 15.5l4-5 3 2.5 5-6.5" strokeWidth="1.8" /></>,
  swords: <><path d="M5 4l9 9M19 4l-9 9M5 4h3.2M5 4v3.2M19 4h-3.2M19 4v3.2M8 16l-2.5 2.5M16 16l2.5 2.5M5.5 21L3 18.5M18.5 21L21 18.5" strokeWidth="1.6" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2.2" strokeWidth="1.7" /><path d="M3 9.5h18M6.5 15h5" strokeWidth="1.5" /></>,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3.5" strokeWidth="1.7" /><circle cx="8.7" cy="8.7" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.3" cy="8.7" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="8.7" cy="15.3" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.3" cy="15.3" r="1.2" fill="currentColor" stroke="none" /></>,
  bolt: <path d="M13.2 2.5L5.5 13.5h5l-1.7 8 7.7-11h-5l1.7-8z" fill="currentColor" stroke="none" />,
  cards: <><rect x="3" y="6" width="11" height="15" rx="2" transform="rotate(-8 3 6)" strokeWidth="1.6" /><rect x="10" y="4" width="11" height="15" rx="2" transform="rotate(8 10 4)" strokeWidth="1.6" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" strokeWidth="1.6" /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" strokeWidth="1.6" /></>,
  players: <><circle cx="9" cy="9" r="3.2" strokeWidth="1.6" /><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeWidth="1.6" /><circle cx="16.5" cy="8" r="2.6" strokeWidth="1.5" /><path d="M15.5 14.6c2.8.1 5 2 5 4.9" strokeWidth="1.5" /></>,
  target: <><circle cx="12" cy="12" r="8.5" strokeWidth="1.6" /><circle cx="12" cy="12" r="4.8" strokeWidth="1.5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
  flagmark: <><path d="M6 21V4" strokeWidth="1.8" /><path d="M6 5h11l-2.5 3.5L17 12H6" strokeWidth="1.6" /></>,
  down: <><path d="M12 4v14M6 12l6 6 6-6" strokeWidth="1.8" /></>,
  refresh: <><path d="M19.5 12a7.5 7.5 0 11-2.2-5.3" strokeWidth="1.8" /><path d="M19.7 3.5v4h-4" strokeWidth="1.8" /></>,
  wheel: <><circle cx="12" cy="12" r="8.5" strokeWidth="1.6" /><circle cx="12" cy="12" r="2" strokeWidth="1.4" /><path d="M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6M6 6l4.2 4.2M18 6l-4.2 4.2M6 18l4.2-4.2M18 18l-4.2-4.2" strokeWidth="1.2" /></>,
  coin: <><circle cx="12" cy="12" r="9" strokeWidth="1.6" /><circle cx="12" cy="12" r="5.6" strokeWidth="1.2" /><path d="M12 8.5v7M10.2 10.2c0-.9.8-1.4 1.8-1.4s1.8.5 1.8 1.3c0 2.1-3.6 1.4-3.6 3.4 0 .9.8 1.4 1.8 1.4s1.8-.5 1.8-1.3" strokeWidth="1.3" /></>,
  user: <><circle cx="12" cy="8.5" r="4" strokeWidth="1.7" /><path d="M4.5 20.5c0-3.6 3.3-6 7.5-6s7.5 2.4 7.5 6" strokeWidth="1.7" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="10" rx="2" strokeWidth="1.7" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" strokeWidth="1.7" /><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" /></>,
  cashout: <><path d="M12 17V6M7 11l5-5 5 5" strokeWidth="1.8" /><path d="M4.5 20.5h15" strokeWidth="1.8" /></>,
  dot: <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />,
  scroll: <><path d="M7 4h11a2 2 0 012 2v1.5h-4M7 4a2 2 0 00-2 2v12.5A1.5 1.5 0 016.5 20H17a2 2 0 002-2V7.5" strokeWidth="1.5" /><path d="M9 9.5h6M9 13h6M9 16.5h3.5" strokeWidth="1.3" /></>,
  medal: <><circle cx="12" cy="14.5" r="5.8" strokeWidth="1.7" /><path d="M12 12v5M9.5 6.5L8 3h3l1 2.5L13 3h3l-1.5 3.5" strokeWidth="1.4" /></>,
  fire: <><path d="M12 3c1 3-3.5 4.5-3.5 8.5a5.5 5.5 0 0011 0C19.5 7 14 6.5 12 3z" strokeWidth="1.6" /><path d="M12 21a3 3 0 003-3c0-2-1.5-2.5-3-4.5-1.5 2-3 2.5-3 4.5a3 3 0 003 3z" strokeWidth="1.3" /></>,
  star: <path d="M12 3.5l2.4 5.4 5.9.6-4.4 4 1.2 5.8L12 16.3l-5.1 3 1.2-5.8-4.4-4 5.9-.6L12 3.5z" strokeWidth="1.5" />,
};

export function AppIcon({ name, size = 20, color = 'currentColor', style }: IconProps & { name: string }) {
  const glyph = GLYPH_PATHS[name];
  if (!glyph) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: 'middle', ...style }} aria-hidden>
      {glyph}
    </svg>
  );
}
