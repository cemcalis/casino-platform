import React from 'react';
import { neonPalaceColors, spacing, typography } from '@casino/theme';

export interface BetPanelProps {
  bet: number;
  minBet: number;
  maxBet: number;
  step?: number;
  presets?: number[];
  onBetChange: (bet: number) => void;
  disabled?: boolean;
}

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${neonPalaceColors.border.default}`,
  borderRadius: '6px',
  backgroundColor: neonPalaceColors.bg.elevated,
  color: neonPalaceColors.text.primary,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 100ms ease',
};

export function BetPanel({
  bet,
  minBet,
  maxBet,
  step = 1,
  presets,
  onBetChange,
  disabled = false,
}: BetPanelProps) {
  const decrease = () => onBetChange(Math.max(minBet, bet - step));
  const increase = () => onBetChange(Math.min(maxBet, bet + step));

  return (
    <div
      aria-label="Bet panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['2'],
        padding: spacing['3'],
        backgroundColor: neonPalaceColors.bg.surface,
        border: `1px solid ${neonPalaceColors.border.subtle}`,
        borderRadius: '8px',
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
        BET
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['2'] }}>
        <button
          onClick={decrease}
          disabled={disabled || bet <= minBet}
          aria-label="Decrease bet"
          style={{ ...btnBase, width: '32px', height: '32px', fontSize: typography.fontSize.lg }}
        >
          −
        </button>

        <span
          aria-live="polite"
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: neonPalaceColors.gold['500'],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {bet}
        </span>

        <button
          onClick={increase}
          disabled={disabled || bet >= maxBet}
          aria-label="Increase bet"
          style={{ ...btnBase, width: '32px', height: '32px', fontSize: typography.fontSize.lg }}
        >
          +
        </button>
      </div>

      {presets && presets.length > 0 && (
        <div style={{ display: 'flex', gap: spacing['1'], flexWrap: 'wrap' as const }}>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onBetChange(Math.min(maxBet, Math.max(minBet, p)))}
              disabled={disabled}
              aria-label={`Set bet to ${p}`}
              aria-pressed={bet === p}
              style={{
                ...btnBase,
                padding: `${spacing['1']} ${spacing['2']}`,
                fontSize: typography.fontSize.xs,
                backgroundColor: bet === p ? neonPalaceColors.gold['600'] : neonPalaceColors.bg.elevated,
                color: bet === p ? neonPalaceColors.text.inverse : neonPalaceColors.text.secondary,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
