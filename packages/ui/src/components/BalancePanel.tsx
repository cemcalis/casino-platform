import React from 'react';
import { neonPalaceColors, spacing, typography } from '@casino/theme';

export interface BalancePanelProps {
  balance: string;
  currency?: string;
  loading?: boolean;
}

export function BalancePanel({ balance, currency = 'VCOIN', loading = false }: BalancePanelProps) {
  return (
    <div
      aria-label="Player balance"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: spacing['1'],
        padding: `${spacing['2']} ${spacing['3']}`,
        backgroundColor: neonPalaceColors.bg.surface,
        border: `1px solid ${neonPalaceColors.border.subtle}`,
        borderRadius: '8px',
        minWidth: '140px',
      }}
    >
      <span
        style={{
          fontSize: typography.fontSize.xs,
          color: neonPalaceColors.text.secondary,
          letterSpacing: typography.letterSpacing.wider,
          textTransform: 'uppercase' as const,
        }}
      >
        {currency}
      </span>
      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading balance"
          style={{
            width: '80px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: neonPalaceColors.bg.elevated,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <span
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: neonPalaceColors.gold['500'],
            fontVariantNumeric: 'tabular-nums',
            lineHeight: '1',
          }}
        >
          {balance}
        </span>
      )}
    </div>
  );
}
