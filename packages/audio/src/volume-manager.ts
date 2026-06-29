import type { AudioChannel, AudioState, ChannelState } from './types';

const DEFAULT_VOLUMES: Record<AudioChannel, number> = {
  MUSIC:   0.6,
  AMBIENT: 0.4,
  SFX:     0.8,
};

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function buildChannelState(channel: AudioChannel, volume: number, muted: boolean): ChannelState {
  return { channel, volume, muted };
}

export class VolumeManager {
  private masterMuted = false;
  private masterVolume = 1.0;
  private volumes: Record<AudioChannel, number> = { ...DEFAULT_VOLUMES };
  private mutedChannels: Record<AudioChannel, boolean> = { MUSIC: false, AMBIENT: false, SFX: false };

  getState(): AudioState {
    const channels = {
      MUSIC:   buildChannelState('MUSIC',   this.volumes['MUSIC'],   this.mutedChannels['MUSIC']),
      AMBIENT: buildChannelState('AMBIENT', this.volumes['AMBIENT'], this.mutedChannels['AMBIENT']),
      SFX:     buildChannelState('SFX',     this.volumes['SFX'],     this.mutedChannels['SFX']),
    };
    return { masterMuted: this.masterMuted, masterVolume: this.masterVolume, channels };
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = clamp(volume);
  }

  setMasterMuted(muted: boolean): void {
    this.masterMuted = muted;
  }

  setChannelVolume(channel: AudioChannel, volume: number): void {
    this.volumes[channel] = clamp(volume);
  }

  setChannelMuted(channel: AudioChannel, muted: boolean): void {
    this.mutedChannels[channel] = muted;
  }

  getEffectiveVolume(channel: AudioChannel): number {
    if (this.masterMuted || this.mutedChannels[channel]) return 0;
    return clamp(this.masterVolume * this.volumes[channel]);
  }

  reset(): void {
    this.masterMuted = false;
    this.masterVolume = 1.0;
    this.volumes = { ...DEFAULT_VOLUMES };
    this.mutedChannels = { MUSIC: false, AMBIENT: false, SFX: false };
  }
}
