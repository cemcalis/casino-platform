import React, { useState } from 'react';
import { neonPalaceColors, shadows, spacing, typography } from '@casino/theme';

export interface GameCardProps {
  id: string;
  name: string;
  category: string;
  rtpPercent?: number;
  imageSrc?: string;
  badgeText?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function GameCard({
  name,
  category,
  rtpPercent,
  imageSrc,
  badgeText,
  onClick,
  disabled = false,
}: GameCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-disabled={disabled}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: neonPalaceColors.bg.surface,
        border: `1px solid ${hovered ? neonPalaceColors.border.focus : neonPalaceColors.border.subtle}`,
        boxShadow: hovered ? shadows['glow-gold'] : shadows.md,
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          aspectRatio: '5/7',
          backgroundColor: neonPalaceColors.bg.medium,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            aria-hidden
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${neonPalaceColors.gold['500']}, ${neonPalaceColors.teal['500']})`,
              opacity: 0.4,
            }}
          />
        )}
      </div>

      {/* Badge */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: spacing['2'],
            right: spacing['2'],
            backgroundColor: neonPalaceColors.gold['500'],
            color: neonPalaceColors.text.inverse,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.bold,
            padding: `2px ${spacing['2']}`,
            borderRadius: '4px',
            letterSpacing: typography.letterSpacing.wider,
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: spacing['3'] }}>
        <div
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: neonPalaceColors.text.primary,
            marginBottom: spacing['1'],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: typography.fontSize.xs, color: neonPalaceColors.text.secondary }}>
            {category}
          </span>
          {rtpPercent !== undefined && (
            <span style={{ fontSize: typography.fontSize.xs, color: neonPalaceColors.teal['500'] }}>
              {rtpPercent.toFixed(1)}% RTP
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
