'use client';

import React from 'react';

/** Inline SVG icons for the game runtime — no emojis anywhere in the UI. */

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const base = (size: number, style?: React.CSSProperties): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  style: { flexShrink: 0, verticalAlign: 'middle', ...style },
  'aria-hidden': true,
});

export function CoinIcon({ size = 15, style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="12" r="10" fill="url(#fgCoinG)" stroke="#a16207" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="6.4" fill="none" stroke="#a16207" strokeWidth="1.1" opacity="0.7" />
      <path
        d="M12 8.2v7.6M9.8 10.1c0-1 1-1.6 2.2-1.6s2.2.6 2.2 1.5c0 2.4-4.4 1.6-4.4 3.9 0 1 1 1.6 2.2 1.6s2.2-.6 2.2-1.5"
        stroke="#7c4a03"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="fgCoinG" x1="4" y1="3" x2="20" y2="21">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f4c430" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SoundOnIcon({ size = 18, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 9.5v5h3.2L12 18.6V5.4L7.2 9.5H4z" fill={color} />
      <path d="M15 9a4.2 4.2 0 010 6M17.5 6.6a8 8 0 010 10.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function SoundOffIcon({ size = 18, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 9.5v5h3.2L12 18.6V5.4L7.2 9.5H4z" fill={color} />
      <path d="M15.5 9.5l5 5m0-5l-5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon({ size = 18, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.7" />
      <path d="M12 11v5.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="1.25" fill={color} />
    </svg>
  );
}

export function BoltIcon({ size = 18, color = 'currentColor', style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M13.2 2.5L5.5 13.5h5l-1.7 8 7.7-11h-5l1.7-8z" fill={color} />
    </svg>
  );
}
