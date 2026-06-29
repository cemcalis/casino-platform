export type AnimationLifecycle = 'IDLE' | 'ENTERING' | 'ACTIVE' | 'EXITING' | 'DONE';

export type WinTier = 'NONE' | 'SMALL' | 'MEDIUM' | 'BIG' | 'JACKPOT';

export type ReducedMotionPolicy = 'FULL' | 'REDUCED' | 'NONE';

export type EasingName =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-out-bounce'
  | 'ease-out-elastic'
  | 'ease-in-back'
  | 'ease-out-back';

export interface TransitionSpec {
  readonly durationMs: number;
  readonly easing: EasingName;
  readonly delayMs: number;
}

export interface ParticleEvent {
  readonly type: 'burst' | 'rain' | 'confetti' | 'sparkle' | 'shockwave';
  readonly count: number;
  readonly color: string;
  readonly durationMs: number;
  readonly spreadRadius: number;
}

export interface WinTierAnimation {
  readonly tier: WinTier;
  readonly enter: TransitionSpec;
  readonly hold: TransitionSpec;
  readonly exit: TransitionSpec;
  readonly particles: ReadonlyArray<ParticleEvent>;
  readonly screenShake: boolean;
  readonly labelScale: number;
  readonly glowIntensity: number;
}

export interface AnimationStateNode<TPayload = unknown> {
  readonly lifecycle: AnimationLifecycle;
  readonly payload: TPayload;
  readonly startedAt: number;
  readonly reducedMotion: boolean;
}
