import React from 'react';
import { neonPalaceColors, shadows, spacing, typography } from '@casino/theme';

export type WinTier = 'small' | 'medium' | 'big' | 'jackpot';

export interface WinBannerProps {
  visible: boolean;
  amount: string;
  tier: WinTier;
  currency?: string;
  onDismiss?: () => void;
}

const tierConfig: Record<WinTier, { label: string; color: string; glow: string }> = {
  small:   { label: 'WIN',         color: neonPalaceColors.win.small,   glow: 'none' },
  medium:  { label: 'BIG WIN',     color: neonPalaceColors.gold['500'],  glow: shadows['glow-gold'] },
  big:     { label: 'MEGA WIN',    color: neonPalaceColors.win.jackpot,  glow: shadows['glow-win'] },
  jackpot: { label: 'JACKPOT!',    color: neonPalaceColors.win.gold,     glow: shadows['glow-win'] },
};

export function WinBanner({ visible, amount, tier, currency = 'VCOIN', onDismiss }: WinBannerProps) {
  if (!visible) return null;

  const { label, color, glow } = tierConfig[tier];

  return (
    <div
      role="status"
      aria-live="assertive"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(13, 6, 24, 0.82)',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing['4'],
          padding: `${spacing['8']} ${spacing['12']}`,
          backgroundColor: neonPalaceColors.bg.elevated,
          border: `2px solid ${color}`,
          borderRadius: '16px',
          boxShadow: glow,
          textAlign: 'center' as const,
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.extrabold,
            color,
            letterSpacing: typography.letterSpacing.display,
          }}
        >
          {label}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing['1'] }}>
          <span style={{ fontSize: typography.fontSize.xs, color: neonPalaceColors.text.secondary, letterSpacing: typography.letterSpacing.wider }}>
            {currency}
          </span>
          <span
            style={{
              fontSize: typography.fontSize['6xl'],
              fontWeight: typography.fontWeight.extrabold,
              color,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: '1',
              textShadow: tier === 'jackpot' ? `0 0 30px ${color}` : 'none',
            }}
          >
            {amount}
          </span>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss win banner"
            style={{
              marginTop: spacing['2'],
              padding: `${spacing['2']} ${spacing['6']}`,
              backgroundColor: color,
              color: neonPalaceColors.text.inverse,
              border: 'none',
              borderRadius: '8px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              letterSpacing: typography.letterSpacing.wider,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            COLLECT
          </button>
        )}
      </div>
    </div>
  );
}
