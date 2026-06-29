import React from 'react';
import { neonPalaceColors, spacing, typography } from '@casino/theme';

export interface SettingsPanelProps {
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  animationsEnabled: boolean;
  onMusicVolumeChange: (v: number) => void;
  onSfxVolumeChange: (v: number) => void;
  onAmbientVolumeChange: (v: number) => void;
  onAnimationsToggle: (enabled: boolean) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
}

function SliderRow({ label, value, onChange, id }: SliderRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing['3'] }}>
      <label
        htmlFor={id}
        style={{ width: '80px', fontSize: typography.fontSize.sm, color: neonPalaceColors.text.secondary, flexShrink: 0 }}
      >
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ flex: 1, accentColor: neonPalaceColors.gold['500'] }}
      />
      <span
        style={{ width: '36px', textAlign: 'right', fontSize: typography.fontSize.xs, color: neonPalaceColors.text.muted, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}%
      </span>
    </div>
  );
}

export function SettingsPanel({
  musicVolume,
  sfxVolume,
  ambientVolume,
  animationsEnabled,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onAmbientVolumeChange,
  onAnimationsToggle,
}: SettingsPanelProps) {
  return (
    <section
      aria-label="Settings"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['4'],
        padding: spacing['5'],
        backgroundColor: neonPalaceColors.bg.surface,
        border: `1px solid ${neonPalaceColors.border.subtle}`,
        borderRadius: '12px',
        minWidth: '300px',
      }}
    >
      <h3 style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: neonPalaceColors.text.primary }}>
        Settings
      </h3>

      <SliderRow label="Music" value={musicVolume} onChange={onMusicVolumeChange} id="setting-music" />
      <SliderRow label="Sound FX" value={sfxVolume} onChange={onSfxVolumeChange} id="setting-sfx" />
      <SliderRow label="Ambient" value={ambientVolume} onChange={onAmbientVolumeChange} id="setting-ambient" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing['2'], borderTop: `1px solid ${neonPalaceColors.border.subtle}` }}>
        <label
          htmlFor="setting-animations"
          style={{ fontSize: typography.fontSize.sm, color: neonPalaceColors.text.secondary }}
        >
          Animations
        </label>
        <input
          id="setting-animations"
          type="checkbox"
          role="switch"
          checked={animationsEnabled}
          onChange={(e) => onAnimationsToggle(e.target.checked)}
          aria-checked={animationsEnabled}
          style={{ width: '20px', height: '20px', accentColor: neonPalaceColors.gold['500'], cursor: 'pointer' }}
        />
      </div>
    </section>
  );
}
