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
