import React, { useState } from 'react';
import { neonPalaceColors, shadows, typography } from '@casino/theme';

export type SpinButtonState = 'idle' | 'spinning' | 'disabled';

export interface SpinButtonProps {
  state?: SpinButtonState;
  onClick?: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { width: '80px', height: '80px', fontSize: typography.fontSize.sm },
  md: { width: '120px', height: '120px', fontSize: typography.fontSize.base },
  lg: { width: '160px', height: '160px', fontSize: typography.fontSize.lg },
};

export function SpinButton({ state = 'idle', onClick, label = 'SPIN', size = 'lg' }: SpinButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = state === 'disabled' || state === 'spinning';

  const { width, height, fontSize } = sizeMap[size];

  const bgColor =
    state === 'spinning'
      ? neonPalaceColors.gold['600']
      : state === 'disabled'
        ? neonPalaceColors.bg.elevated
        : neonPalaceColors.gold['500'];

  const textColor =
    state === 'disabled' ? neonPalaceColors.text.disabled : neonPalaceColors.text.inverse;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={isDisabled}
      aria-label={state === 'spinning' ? 'Spinning…' : label}
      aria-busy={state === 'spinning'}
      style={{
        width,
        height,
        borderRadius: '50%',
        border: `3px solid ${state === 'disabled' ? neonPalaceColors.border.subtle : neonPalaceColors.gold['400']}`,
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        fontWeight: typography.fontWeight.extrabold,
        fontFamily: 'inherit',
        letterSpacing: typography.letterSpacing.widest,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: state === 'idle' ? shadows['glow-gold'] : 'none',
        transform: pressed && !isDisabled ? 'scale(0.94)' : 'scale(1)',
        transition: 'transform 100ms ease, box-shadow 150ms ease, background-color 150ms ease',
        outline: 'none',
        userSelect: 'none' as const,
      }}
    >
      {state === 'spinning' ? '…' : label}
    </button>
  );
}
