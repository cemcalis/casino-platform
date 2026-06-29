export type {
  AnimationLifecycle,
  WinTier,
  ReducedMotionPolicy,
  EasingName,
  TransitionSpec,
  ParticleEvent,
  WinTierAnimation,
  AnimationStateNode,
} from './types';
export {
  EASING,
  DURATION,
  makeTransitionSpec,
  scaleDuration,
  toReducedMotionSpec,
  toCssTransition,
} from './timing';
export type { DurationName } from './timing';
export {
  detectReducedMotion,
  applyReducedMotionPolicy,
  policyFromPreference,
  scaleParticlesToPolicy,
} from './reduced-motion';
export {
  WIN_TIER_ANIMATIONS,
  getWinTierAnimation,
  totalAnimationDurationMs,
} from './win-tier-config';
