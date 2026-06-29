import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';

const defaults = {
  musicVolume: 80,
  sfxVolume: 60,
  ambientVolume: 40,
  animationsEnabled: true,
  onMusicVolumeChange: vi.fn(),
  onSfxVolumeChange: vi.fn(),
  onAmbientVolumeChange: vi.fn(),
  onAnimationsToggle: vi.fn(),
};

describe('SettingsPanel', () => {
  it('renders Settings heading', () => {
    render(<SettingsPanel {...defaults} />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders Music slider', () => {
    render(<SettingsPanel {...defaults} />);
    expect(screen.getByLabelText('Music')).toBeTruthy();
  });

  it('renders SFX slider', () => {
    render(<SettingsPanel {...defaults} />);
    expect(screen.getByLabelText('Sound FX')).toBeTruthy();
  });

  it('renders Ambient slider', () => {
    render(<SettingsPanel {...defaults} />);
    expect(screen.getByLabelText('Ambient')).toBeTruthy();
  });

  it('renders Animations toggle', () => {
    render(<SettingsPanel {...defaults} />);
    expect(screen.getByLabelText('Animations')).toBeTruthy();
  });

  it('calls onAnimationsToggle when animations checkbox changes', () => {
    const onAnimationsToggle = vi.fn();
    render(<SettingsPanel {...defaults} onAnimationsToggle={onAnimationsToggle} animationsEnabled={true} />);
    fireEvent.click(screen.getByLabelText('Animations'));
    expect(onAnimationsToggle).toHaveBeenCalledWith(false);
  });

  it('calls onMusicVolumeChange when music slider changes', () => {
    const onMusicVolumeChange = vi.fn();
    render(<SettingsPanel {...defaults} onMusicVolumeChange={onMusicVolumeChange} />);
    fireEvent.change(screen.getByLabelText('Music'), { target: { value: '50' } });
    expect(onMusicVolumeChange).toHaveBeenCalledWith(50);
  });
});
