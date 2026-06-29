import React from 'react';
import { generateAllVars, typography } from '@casino/theme';

export interface CasinoShellProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Injects all NEON PALACE CSS custom properties (--np-*) into the subtree.
// All child components may reference var(--np-*) in their inline styles.
const cssVars = generateAllVars() as unknown as React.CSSProperties;

export function CasinoShell({ children, className, style }: CasinoShellProps) {
  return (
    <div
      className={className}
      style={{
        ...cssVars,
        minHeight: '100vh',
        backgroundColor: 'var(--np-bg-deep)',
        color: 'var(--np-text-primary)',
        fontFamily: typography.fontFamily.sans,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
