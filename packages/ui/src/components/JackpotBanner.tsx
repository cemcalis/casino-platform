import React from 'react';
import { neonPalaceColors, shadows, spacing, typography } from '@casino/theme';

export interface JackpotBannerProps {
  amount: string;
  currency?: string;
  label?: string;
  pulsing?: boolean;
}

export function JackpotBanner({ amount, currency = 'VCOIN', label = 'JACKPOT', pulsing = false }: JackpotBannerProps) {
  return (
    <div
      role="banner"
      aria-label={`${label}: ${amount} ${currency}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing['1'],
        padding: `${spacing['3']} ${spacing['6']}`,
        background: `linear-gradient(135deg, ${neonPalaceColors.bg.elevated} 0%, ${neonPalaceColors.bg.surface} 100%)`,
        border: `1px solid ${neonPalaceColors.gold['500']}`,
        borderRadius: '12px',
        boxShadow: shadows['glow-gold-strong'],
        animation: pulsing ? 'jackpot-pulse 2s ease-in-out infinite' : 'none',
      }}
    >
      <span
        style={{
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.extrabold,
          color: neonPalaceColors.teal['500'],
          letterSpacing: typography.letterSpacing.display,
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.extrabold,
          color: neonPalaceColors.win.gold,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: '1',
          textShadow: `0 0 20px ${neonPalaceColors.win.glow}`,
        }}
      >
        {amount}
      </span>
      <span
        style={{
          fontSize: typography.fontSize.xs,
          color: neonPalaceColors.text.secondary,
          letterSpacing: typography.letterSpacing.wider,
        }}
      >
        {currency}
      </span>
    </div>
  );
}
