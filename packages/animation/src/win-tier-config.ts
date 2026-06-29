import type { WinTierAnimation, WinTier, ParticleEvent } from './types';
import { makeTransitionSpec, DURATION } from './timing';

function goldBurst(count: number): ParticleEvent {
  return { type: 'burst', count, color: '#f4c430', durationMs: 800, spreadRadius: 150 };
}

function confettiRain(count: number): ParticleEvent {
  return { type: 'confetti', count, color: '#00d4c8', durationMs: 1500, spreadRadius: 300 };
}

function sparkle(count: number): ParticleEvent {
  return { type: 'sparkle', count, color: '#f0e8ff', durationMs: 600, spreadRadius: 80 };
}

function shockwave(): ParticleEvent {
  return { type: 'shockwave', count: 1, color: '#f4c430', durationMs: 500, spreadRadius: 400 };
}

const NONE_ANIM: WinTierAnimation = {
  tier:         'NONE',
  enter:        makeTransitionSpec(0, 'linear'),
  hold:         makeTransitionSpec(0, 'linear'),
  exit:         makeTransitionSpec(0, 'linear'),
  particles:    [],
  screenShake:  false,
  labelScale:   1.0,
  glowIntensity: 0,
};

const SMALL_ANIM: WinTierAnimation = {
  tier:         'SMALL',
  enter:        makeTransitionSpec(DURATION.fast,    'ease-out-back'),
  hold:         makeTransitionSpec(DURATION.slow,    'linear'),
  exit:         makeTransitionSpec(DURATION.fast,    'ease-in'),
  particles:    [sparkle(6)],
  screenShake:  false,
  labelScale:   1.1,
  glowIntensity: 0.3,
};

const MEDIUM_ANIM: WinTierAnimation = {
  tier:         'MEDIUM',
  enter:        makeTransitionSpec(DURATION.normal,  'ease-out-bounce'),
  hold:         makeTransitionSpec(DURATION.slower,  'linear'),
  exit:         makeTransitionSpec(DURATION.fast,    'ease-in'),
  particles:    [goldBurst(20), sparkle(12)],
  screenShake:  false,
  labelScale:   1.25,
  glowIntensity: 0.6,
};

const BIG_ANIM: WinTierAnimation = {
  tier:         'BIG',
  enter:        makeTransitionSpec(DURATION.normal,  'ease-out-elastic'),
  hold:         makeTransitionSpec(DURATION.slowest, 'linear'),
  exit:         makeTransitionSpec(DURATION.normal,  'ease-in'),
  particles:    [goldBurst(50), confettiRain(30), sparkle(25)],
  screenShake:  true,
  labelScale:   1.5,
  glowIntensity: 0.85,
};

const JACKPOT_ANIM: WinTierAnimation = {
  tier:          'JACKPOT',
  enter:         makeTransitionSpec(DURATION.slow,       'ease-out-elastic'),
  hold:          makeTransitionSpec(DURATION.celebration, 'linear'),
  exit:          makeTransitionSpec(DURATION.normal,     'ease-in'),
  particles:     [goldBurst(120), confettiRain(80), sparkle(60), shockwave()],
  screenShake:   true,
  labelScale:    2.0,
  glowIntensity: 1.0,
};

export const WIN_TIER_ANIMATIONS: Record<WinTier, WinTierAnimation> = {
  NONE:    NONE_ANIM,
  SMALL:   SMALL_ANIM,
  MEDIUM:  MEDIUM_ANIM,
  BIG:     BIG_ANIM,
  JACKPOT: JACKPOT_ANIM,
};

export function getWinTierAnimation(tier: WinTier): WinTierAnimation {
  return WIN_TIER_ANIMATIONS[tier];
}

export function totalAnimationDurationMs(anim: WinTierAnimation): number {
  return anim.enter.durationMs + anim.hold.durationMs + anim.exit.durationMs;
}
