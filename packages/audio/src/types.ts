export type SoundEventId = string & { readonly __brand: 'SoundEventId' };

export function soundEventId(raw: string): SoundEventId {
  return raw as SoundEventId;
}

export type AudioChannel = 'MUSIC' | 'AMBIENT' | 'SFX';

export interface SoundEvent {
  readonly id: SoundEventId;
  readonly channel: AudioChannel;
  readonly label: string;
  readonly loop: boolean;
  readonly priority: number;
}

export interface ChannelState {
  readonly channel: AudioChannel;
  readonly volume: number;
  readonly muted: boolean;
}

export interface AudioState {
  readonly masterMuted: boolean;
  readonly masterVolume: number;
  readonly channels: Record<AudioChannel, ChannelState>;
}

export interface SoundTrigger {
  readonly eventId: SoundEventId;
  readonly volumeOverride?: number;
  readonly pitchShift?: number;
}

export type AudioEventMap = {
  'sound:trigger': SoundTrigger;
  'sound:stop': { eventId: SoundEventId };
  'sound:stop-all-channel': { channel: AudioChannel };
  'volume:change': { channel: AudioChannel; volume: number };
  'mute:channel': { channel: AudioChannel; muted: boolean };
  'mute:master': { muted: boolean };
};
